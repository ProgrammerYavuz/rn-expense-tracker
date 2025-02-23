import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

/**
 * updateUser:
 * - Kullanıcı bilgilerini Firestore'da günceller.
 * - Eğer `updatedData.image` varsa, önce Cloudinary'e yükler ve URL'sini kaydeder.
 * - Başarılı olursa `{ success: true, msg: "Kullanıcı bilgileri güncellendi." }` döner.
 * - Hata oluşursa `{ success: false, msg: error.message }` döner.
 * 
 * @param uid - Kullanıcının UID'si (Firestore'da hangi dokümanın güncelleneceği)
 * @param updatedData - Güncellenecek kullanıcı verileri (`UserDataType` formatında)
 */
export const updateUser = async (
    uid: string, // Firebase'deki kullanıcı ID'si
    updatedData: UserDataType // Güncellenmek istenen kullanıcı verileri
): Promise<ResponseType> => { 
    try {
        /**
         * Resim Yükleme İşlemi:
         * - Eğer `updatedData.image` varsa ve `image.uri` içeriyorsa:
         *   - `uploadFileToCloudinary()` fonksiyonu ile Cloudinary'e yüklenir.
         *   - Yükleme başarılı olursa `updatedData.image` Cloudinary'den dönen URL ile değiştirilir.
         */
        if(updatedData.image && updatedData?.image?.uri){
            const imageUploadRes = await uploadFileToCloudinary(
                updatedData.image, // Yüklenecek resmin URI'si
                "users" // Cloudinary'de kaydedileceği klasör adı
            )

            if(!imageUploadRes.success){
                return { success: false, msg: imageUploadRes.msg || "Resim yükleme sırasında hata oluştu." };
            }
            updatedData.image = imageUploadRes.data;
        }

        /**
         * Firestore'da Kullanıcı Verilerini Güncelleme:
         * - `doc()` ile kullanıcı dokümanına referans alınıyor.
         * - `updateDoc()` kullanılarak ilgili doküman güncelleniyor.
         * - `updatedData` içindeki tüm alanlar Firestore'da güncellenir.
         */
        const userRef = doc(firestore, "users", uid);
        await updateDoc(userRef, updatedData);
        return { success: true, msg: "Kullanıcı bilgileri güncellendi." };
    } catch (error: any) {
        return { success: false, msg: error?.message };
    }
}