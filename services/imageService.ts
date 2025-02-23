import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from "axios";

// Cloudinary API URL'si
// - Cloudinary'de görüntü yüklemek için kullanılacak URL.
// - `CLOUDINARY_CLOUD_NAME` proje ayarlarında tanımlanan Cloudinary hesabı adıdır.
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * uploadFileToCloudinary:
 * - Cloudinary'e dosya yüklemek için asenkron bir fonksiyondur.
 * - `file`: Yüklenmek istenen dosya (URI veya string olabilir).
 * - `folderName`: Cloudinary'de hangi klasöre yükleneceğini belirtir.
 * 
 * Başarılı olursa `{ success: true, data: secure_url }` döner.
 * Hata oluşursa `{ success: false, msg: error.message }` döner.
 */
export const uploadFileToCloudinary = async (
    file: {uri?: string} | string,  // Dosya URI'si veya URL olarak string
    folderName: string // Cloudinary'de kaydedilecek klasör adı
): Promise<ResponseType> => {
    try {
        // Eğer `file` bir URL (string) ise direkt olarak başarılı kabul edilir.
        if(typeof file === 'string'){
            return { success: true, data: file };
        }

        /**
         * Eğer `file` bir URI içeriyorsa:
         * - `FormData` kullanılarak Cloudinary API'ye POST isteği atılır.
         * - Yükleme ayarları: JPEG formatında yüklenir.
         */
        if(file && file.uri){
            const formData = new FormData();

            // FormData'ya dosya bilgileri ekleniyor
            formData.append('file', {
                uri: file?.uri, // Dosyanın URI adresi
                type: "image/jpeg", // Yükleme formatı JPEG olarak ayarlandı
                name: file?.uri?.split('/')?.pop() || 'image.jpg' // Dosya adı, URI'den çekilir
            } as any);

            // Cloudinary upload preset ve klasör adı ekleniyor
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', folderName);

            /**
             * Cloudinary'ye POST isteği gönderiliyor
             * - `axios` kullanılarak FormData yükleniyor.
             * - Header'da `multipart/form-data` kullanıldığı için resim gönderimi yapılıyor.
             */
            const response = await axios.post(CLOUDINARY_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // console.log(response?.data?.secure_url);

            // Cloudinary'den dönen `secure_url` geri döndürülüyor
            return { success: true, data: response?.data?.secure_url };
        }

        return { success: true };
    } catch (error: any) {
        console.log('Dosyayı yükleme sırasında hata:', error);
        return { success: false, msg: error.message || 'Bir hata oluştu' };
    }
}

/**
 * getProfileImage:
 * - Profil resmini almak için kullanılan yardımcı fonksiyon.
 * - Eğer `file` string ise doğrudan URL döner.
 * - Eğer `file` bir URI (object) içeriyorsa URI adresini döner.
 * - Aksi takdirde varsayılan bir avatar resmi döndürülür.
 */
export const getProfileImage = (file: any)=>{
    if(file && typeof file === 'string') return file;
    if(file && typeof file === 'object') return file.uri;

    return require('../assets/images/avatarMan.png');
}