import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";

/**
 * createOrUpdateTransaction:
 * - Yeni bir işlem oluşturur veya mevcut bir işlemi günceller.
 * - İşleme ait resim varsa önce Cloudinary'e yüklenir.
 * - İşlem yeni ekleniyorsa cüzdan bakiyesi ve toplam gelir/gider değerleri güncellenir.
 * - Mevcut bir işlem güncelleniyorsa eski işlemin cüzdan etkisi geri alınır ve yeni işlem bilgileri güncellenir.
 */
export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
) : Promise<ResponseType> => {
    try {
        const { id, type, walletId, amount, image } = transactionData;
        if(!amount || amount <= 0 || !walletId || !type){
            return { success: false, msg: "Geçersiz işlem bilgileri!" };
        }

        if(id) { // Eğer işlem mevcutsa (id varsa) eski veriler alınır ve cüzdan dengesi kontrol edilir
            const oldTransactionSnapshot = await getDoc(doc(firestore, "transactions", id));
            const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
            const shouldRevertOriginal = oldTransaction.type != type || oldTransaction.amount !== amount || oldTransaction.walletId != walletId;
            if(shouldRevertOriginal) {
                let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
                if (!res.success) return res;
            }
        } else { // Yeni işlem ekleniyorsa cüzdan güncellemesi yapılır
            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            )
            if (!res.success) return res;
        }

        if (image) { // Eğer resim varsa Cloudinary'e yüklenir
            const imageUploadRes = await uploadFileToCloudinary(
                image,
                "transactions"
            );
            if (!imageUploadRes.success) {
                return {
                    success: false,
                    msg: imageUploadRes.msg || "Resim yükleme sırasında hata oluştu."
                }
            }
            transactionData.image = imageUploadRes.data;
        }

        // İşlem Firestore'a kaydedilir (id varsa güncelleme, yoksa oluşturma)
        const transactionRef = id ? doc(firestore, "transactions", id) : doc(collection(firestore, "transactions"));
        await setDoc(transactionRef, transactionData, { merge: true });

        return { success: true, data: {...transactionData, id: transactionRef.id} };
    } catch (error: any) {
        console.log("İşlem oluşturulurken veya güncellenirken hata oluştu: ", error);
        return { success: false, msg: error.message }
    }
};

const updateWalletForNewTransaction = async ( // Yeni bir işlem oluşturulurken cüzdanın bakiyesini ve toplam gelir/gider değerlerini günceller.
    walletId: string,
    amount: number,
    type: string
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnapshot = await getDoc(walletRef);
        if (!walletSnapshot.exists()) {
            console.log("Yeni işlem için cüzdan bulunamadı!");
            return { success: false, msg: "Cüzdan bulunamadı!" }
        }

        const walletData = walletSnapshot.data() as WalletType;

        // Eğer gider işlemi yapılacaksa bakiye durumu kontrol edilir
        if (type === "expense" && walletData.amount! - amount < 0) {
            return { success: false, msg: "Seçilen cüzdanda bu işlem için yeterli bakiye yok!" }
        }

        const updateType = type === "income" ? "totalIncome" : "totalExpenses";
        const updatedWalletAmount = type === "income"
            ? Number(walletData.amount) + amount
            : Number(walletData.amount) - amount;

        const updatedTotals = type === "income"
            ? Number(walletData.totalIncome) + amount
            : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updateType]: updatedTotals
        })

        return { success: true };
    } catch (err: any) {
        console.log("Yeni işlem için cüzdan güncellenirken hata oluştu: ", err);
        return { success: false, msg: err.message }
    }
};

/**
 * revertAndUpdateWallets:
 * - Bir işlem güncellendiğinde, eski işlemin cüzdan üzerindeki etkisini geri alır.
 * - Daha sonra yeni işlem bilgisine göre cüzdan bakiyesini ve toplam gelir/gider değerlerini tekrar günceller.
 */
const revertAndUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newTransactionType: string,
    newWalletId: string
) => {
    try {
        const originalWalletSnapshot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId));

        const originalWallet = originalWalletSnapshot.data() as WalletType;

        let newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));

        let newWallet = newWalletSnapshot.data() as WalletType;

        const revertType = oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";
    
        const revertIncomeExpense = oldTransaction.type == "income" ? -Number(oldTransaction.amount) : Number(oldTransaction.amount);

        const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;

        const revertedIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount);

        if(newTransactionType == 'expense') {
            if(oldTransaction.walletId == newWalletId && revertedWalletAmount < newTransactionAmount) {
                return { success: false, msg: "Cüzdan bakiyesi yetersiz!" };
            }

            if(newWallet.amount! < newTransactionAmount ) {
                return { success: false, msg: "Cüzdan bakiyesi yetersiz!" };
            }
        }

        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertedWalletAmount,
            [revertType]: revertedIncomeExpenseAmount
        });

        newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
        newWallet = newWalletSnapshot.data() as WalletType;

        const updateType = newTransactionType == 'income' ? 'totalIncome' : 'totalExpenses';

        const updatedTransactionAmount: number = newTransactionType == 'income' ? Number(newTransactionAmount) : -Number(newTransactionAmount);

        const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

        const newIncomeExpenseAmount = Number(newWallet[updateType]! + Number(newTransactionAmount));

        await createOrUpdateWallet({
            id: newWalletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        });

        return { success: true };
    } catch (err: any) {
        console.log("Cüzdan güncellenirken hata oluştu: ", err);
        return { success: false, msg: err.message }
    }
};

// Bir işlemi siler ve cüzdanın bakiyesini ve toplam gelir/gider değerlerini buna göre günceller.
export const deleteTransaction = async (transactionId: string, walletId: string) => {
    try {
        const transactionRef = doc(firestore, "transactions", transactionId);
        const transactionSnapshot = await getDoc(transactionRef);

        if (!transactionSnapshot.exists()) {
            return { success: false, msg: "İşlem bulunamadı!" };
        }
            
        const transactionData = transactionSnapshot.data() as TransactionType;
        const transactionType = transactionData?.type;
        const transactionAmount = transactionData?.amount;
        
        const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
        const walletData = walletSnapshot.data() as WalletType;

        const updateType = transactionType == 'income' ? 'totalIncome' : 'totalExpenses';

        const newWalletAmount = walletData?.amount! - (transactionType == 'income' ? transactionAmount : -transactionAmount!);

        const newIncomeExpenseAmount = walletData?.[updateType]! - transactionAmount;

        if(transactionType == 'expense' && newWalletAmount < 0) {
            return { success: false, msg: "Bu işlemi silmek için cüzdan bakiyesi yetersiz!" };
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount
        });

        await deleteDoc(transactionRef);

        return { success: true };
    } catch (err: any) {
        console.log("İşlem silinirken hata oluştu: ", err);
        return { success: false, msg: err.message }
    }
};

export const fetchWeeklyStats = async ( uid: string ) : Promise<ResponseType> => {
    try {
        const db = firestore;
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const transactionsQuery = query(
            collection(db, "transactions"),
            where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const weeklyData = getLast7Days();
        const transactions: TransactionType[] = [];

        // Haftalık istatistikleri hesaplar
        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0];
            const dayData = weeklyData.find((day) => day.date == transactionDate);

            if (dayData) {
                if (transaction.type == "income") {
                    dayData.income += transaction.amount;
                } else if (transaction.type == "expense") {
                    dayData.expense += transaction.amount;
                }
            }
        });

        // Haftalık istatistikleri grafik için hazırlar
        const stats = weeklyData.flatMap((day) => [
            {
                value: day.income,
                label: day.day,
                spacing: scale(4),
                labelWidth: scale(30),
                frontColor: colors.primary
            },
            { value: day.expense, frontColor: colors.rose }
        ])
        
        return { success: true, data: { stats, transactions } };
    } catch (err: any) {
        console.log("Haftalık istatistikler alırken hata oluştu: ", err);
        return { success: false, msg: err.message };
    }
}

export const fetchMonthlyStats = async ( uid: string ) : Promise<ResponseType> => {
    try {
        const db = firestore;
        const today = new Date();
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setMonth(today.getMonth() - 12);
        
        const transactionsQuery = query(
            collection(db, "transactions"),
            where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
            where("date", "<=", Timestamp.fromDate(today)),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const monthlyData = getLast12Months();
        const transactions: TransactionType[] = [];
        // Aylık istatistikleri hesaplar
        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate();
            const monthName = transactionDate.toLocaleString("tr-TR", { month: "short" });
            const shortYear = transactionDate.getFullYear().toString().slice(-2);
            const monthData = monthlyData.find((month) => month.month === `${monthName} ${shortYear}`);

            if(monthData) {
                if(transaction.type == "income") {
                    monthData.income += transaction.amount;
                } else if(transaction.type == "expense") {
                    monthData.expense += transaction.amount;
                }
            }
        })

        // Aylık istatistikleri grafik için hazırlar
        const stats = monthlyData.flatMap((month) => [
            {
                value: month.income,
                label: month.month,
                spacing: scale(4),
                labelWidth: scale(46),
                frontColor: colors.primary
            },
            { value: month.expense, frontColor: colors.rose }
        ]);

        return { success: true, data: { stats, transactions } };
    } catch (err: any) {
        console.log("Aylık istatistikler alırken hata oluştu: ", err);
        return { success: false, msg: err.message };
    }
}

export const fetchYearlyStats = async ( uid: string ) : Promise<ResponseType> => {
    try {
        const db = firestore;

        const transactionsQuery = query(
            collection(db, "transactions"),
            orderBy("date", "desc"),
            where("uid", "==", uid)
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const transactions: TransactionType[] = [];
        
        const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
            const transactionDate = doc.data().date.toDate();
            return transactionDate < earliest ? transactionDate : earliest;
        }, new Date())

        const firstYear = firstTransaction.getFullYear();
        const currentYear = new Date().getFullYear();

        const yearlyData = getYearsRange(firstYear, currentYear);

        querySnapshot.forEach((doc) => {
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();

            const yearData = yearlyData.find((item: any) => item.year === transactionYear.toString());

            if(yearData) {
                if(transaction.type == "income") {
                    yearData.income += transaction.amount;
                } else if(transaction.type == "expense") {
                    yearData.expense += transaction.amount;
                }
            }
        })

        // Yıllık istatistikleri grafik için hazırlar
        const stats = yearlyData.flatMap((year: any) => [
            {
                value: year.income,
                label: year.year,
                spacing: scale(4),
                labelWidth: scale(35),
                frontColor: colors.primary
            },
            { value: year.expense, frontColor: colors.rose }
        ]);

        return { success: true, data: { stats, transactions } };
    } catch (err: any) {
        console.log("Yıllık istatistikler alırken hata oluştu: ", err);
        return { success: false, msg: err.message };
    }
}