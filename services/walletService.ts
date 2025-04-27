import { ResponseType, WalletType } from "@/types";
import { uploadFileToCloudinary } from "./imageService";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { firestore } from "@/config/firebase";

/**
 * createOrUpdateWallet:
 * - Yeni bir cüzdan oluşturur veya mevcut bir cüzdanı günceller.
 * - Eğer `walletData.image` varsa, önce Cloudinary'e yüklenir ve URL kaydedilir.
 * - Eğer `walletData.id` varsa, güncelleme işlemi yapılır.
 * - Eğer `walletData.id` yoksa, yeni bir cüzdan oluşturulur.
 * 
 * @param walletData - Cüzdan bilgileri (`Partial<WalletType>` formatında)
 * @returns `ResponseType` formatında başarı veya hata durumu
 */

export const createOrUpdateWallet = async (
    walletData: Partial<WalletType> // Güncellenecek veya oluşturulacak cüzdan verisi
): Promise<ResponseType> => {
    try {
        // Cüzdan verilerini saklamak için yeni bir obje oluşturuluyor
        let walletToSave = {...walletData};

        /**
         * Resim Yükleme İşlemi:
         * - Eğer `walletData.image` varsa, önce Cloudinary'e yüklenir.
         * - Başarılı olursa URL kaydedilir.
         * - Başarısız olursa hata mesajı döndürülür.
         */
        if(walletData.image){
            const imageUploadRes = await uploadFileToCloudinary(
                walletData.image,// Yüklenecek resmin URI'si
                "wallets" // Cloudinary'de kaydedilecek klasör adı
            )

            if(!imageUploadRes.success){
                return { success: false, msg: imageUploadRes.msg || "Resim yükleme sırasında hata oluştu." };
            }

            // Yükleme başarılı olursa `walletToSave.image` Cloudinary URL'si ile güncellenir
            walletToSave.image = imageUploadRes.data;
        }

        /**
         * Yeni Cüzdan Oluşturma:
         * - Eğer `walletData.id` yoksa (yani yeni bir cüzdan oluşturuluyorsa):
         *   - `amount`, `totalIncome`, `totalExpenses` sıfır olarak ayarlanır.
         *   - `created` alanı, cüzdanın oluşturulma tarihini kaydeder.
         */
        if(!walletData?.id){
            walletToSave.amount = 0; // Başlangıç bakiyesi sıfır
            walletToSave.totalIncome = 0; // Başlangıç toplam geliri sıfır
            walletToSave.totalExpenses = 0; // Başlangıç toplam gideri sıfır
            walletToSave.created = new Date(); // Oluşturulma tarihi
        }

        /**
         * Firestore Referans:
         * - Eğer `walletData.id` varsa, ilgili doküman güncellenir (`doc()` kullanılır).
         * - Eğer `walletData.id` yoksa, yeni bir doküman oluşturulur (`collection()` ile referans alınır).
         */
        const walletRef = walletData?.id
            ? doc(firestore, "wallets", walletData.id) // Mevcut cüzdanı güncelle
            : doc(collection(firestore, "wallets")); // Yeni cüzdan oluştur
        
        /**
         * Firestore'da Cüzdan Kaydetme:
         * - `setDoc()` kullanılarak cüzdan verisi kaydedilir.
         * - `{ merge: true }` → Sadece değişen alanlar güncellenir, diğerleri korunur.
         */
        await setDoc(walletRef, walletToSave, { merge: true });

        return {success: true, data: {...walletToSave, id: walletRef.id}};
    } catch (error: any) {
        console.log("Hata:", error);
        return { success: false, msg: error.message }
    }
}

/**
 * deleteWallet:
 * - Belirtilen cüzdanı Firestore'dan siler.
 * - Cüzdanla ilişkili tüm işlemleri de silmek için `deleteTransactionByWalletId` fonksiyonunu çağırır.
 * 
 * @param walletId - Silinecek cüzdanın ID'si
 * @returns `ResponseType` formatında başarı veya hata durumu
 */
export const deleteWallet = async (walletId: string): Promise<ResponseType> => { // Cüzdan silme
    try {
        const walletRef = doc(firestore, "wallets", walletId); // Firestore'dan cüzdan referansı alınır
        await deleteDoc(walletRef); // Belirtilen cüzdan silinir
        deleteTransactionByWalletId(walletId); // Cüzdana bağlı tüm işlemler de silinir
        return { success: true, msg: "Cüzdan basarıyla silindi." };
    } catch (error: any) {
        console.log("Hata:", error);
        return { success: false, msg: error.message }
    }
}

/**
 * deleteTransactionByWalletId:
 * - Belirli bir cüzdana (`walletId`) bağlı olan tüm işlemleri Firestore'dan toplu olarak siler.
 * - Firestore'un `writeBatch` özelliğini kullanarak işlemleri verimli bir şekilde topluca siler.
 * - Eğer işlemler çok fazlaysa, `while` döngüsüyle tüm işlemler bitene kadar silme işlemi devam eder.
 * 
 * @param walletId - Silinecek işlemlerin bağlı olduğu cüzdanın ID'si
 * @returns `ResponseType` formatında başarı veya hata durumu
 */
export const deleteTransactionByWalletId = async (walletId: string): Promise<ResponseType> => {
    try {
        let hasMoreTransactions = true; // Daha fazla işlem olup olmadığını kontrol etmek için

        while (hasMoreTransactions) {
            const transactionsQuery = query( // Belirli walletId'ye ait işlemler sorgulanır
                collection(firestore, "transactions"),
                where("walletId", "==", walletId)
            );

            // Eğer hiç işlem bulunmazsa döngü sonlandırılır
            const transactionsSnapshot = await getDocs(transactionsQuery);
            if (transactionsSnapshot.size == 0) {
                hasMoreTransactions = false;
                break;
            }
            
            // İşlemleri toplu silme işlemi için batch oluşturulur
            const batch = writeBatch(firestore);
            transactionsSnapshot.forEach((transactionDoc) => {
                batch.delete(transactionDoc.ref);
            })

            await batch.commit();

            console.log(`${transactionsSnapshot.size} işlem silindi.`)
        }

        return { success: true, msg: "Tüm işlemler başarıyla silindi." }
    } catch (error: any) {
        console.log("Hata:", error);
        return { success: false, msg: error.message }
    }
}