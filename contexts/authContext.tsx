import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

// AuthContext: Kimlik doğrulama işlemlerini yönetmek için bir context oluşturuyoruz
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider: Kimlik doğrulama işlemlerini sarmalayan provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // Kullanıcı verisini state'de tutmak için useState kullanılıyor
    const [user, setUser] = useState<UserType>(null);
    const router = useRouter(); // Navigasyon işlemleri için Expo Router kullanılıyor

    /**
     * useEffect ve onAuthStateChanged:
     * - Firebase Authentication'dan kullanıcının giriş durumunu dinler.
     * - Kullanıcı giriş yapmışsa `user` state güncellenir ve ana sayfaya yönlendirilir.
     * - Kullanıcı çıkış yapmışsa `user` state `null` yapılır ve `welcome` sayfasına yönlendirilir.
     */
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            // console.log(firebaseUser); // Firebase'den dönen kullanıcı verisi konsola loglanır.

            if(firebaseUser){
                // Kullanıcı giriş yapmışsa state güncellenir
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    name: firebaseUser?.displayName
                });
                router.replace("/(tabs)"); // Ana sayfaya yönlendirme
                updateUserData(firebaseUser.uid); // Kullanıcı verisini güncelleme
            } else {
                // Kullanıcı çıkış yapmışsa veya giriş yapmamışsa
                setUser(null);
                router.replace("/(auth)/welcome"); // Welcome sayfasına yönlendirme
            }
        });

        // useEffect cleanup: Auth state dinleyicisini kaldırma
        return () => unsub();
    }, []);

    /**
     * login: Giriş yapma fonksiyonu
     * - Firebase Authentication kullanılarak e-posta ve şifre ile giriş yapılır.
     * - Başarılı olursa `{ success: true }` döner.
     * - Hata oluşursa `{ success: false, msg: error.message }` döner.
     */
    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error: any) {
            let msg = error.message;
            // Hata mesajlarını daha kullanıcı dostu hale getirme
            if(msg.includes("(auth/invalid-credential)")) msg = "Giriş bilgileri hatalı!";
            if(msg.includes("(auth/invalid-email)")) msg = "Mail adresi hatalı!";
            return { success: false, msg };
        }
    }

    /**
     * register: Kayıt olma fonksiyonu
     * - Firebase Authentication ile yeni kullanıcı oluşturur.
     * - Kullanıcı verisini Firestore'da "users" koleksiyonuna kaydeder.
     * - Başarılı olursa `{ success: true }` döner.
     * - Hata oluşursa `{ success: false, msg: error.message }` döner.
     */
    const register = async (email: string, password: string, name: string) => {
        try {
            // Yeni kullanıcı oluşturma
            let response = await createUserWithEmailAndPassword(auth, email, password);
            
            // Kullanıcı verisini Firestore'a kaydetme
            await setDoc(doc(firestore, "users", response?.user?.uid), { 
                name,
                email,
                uid: response?.user?.uid
            });
            return { success: true };
        } catch (error: any) {
            let msg = error.message;
            // Hata mesajlarını daha kullanıcı dostu hale getirme
            if(msg.includes("(auth/email-already-in-use)")) msg = "Kullanıcı zaten kayıtlı!";
            if(msg.includes("(auth/weak-password)")) msg = "Parola 6 karakterden uzun olmalı!";
            return { success: false, msg };
        }
    }

    /**
     * updateUserData: Kullanıcı verisini güncelleme fonksiyonu
     * - Firestore'dan kullanıcı verisini alır ve state'e kaydeder.
     * - Eğer kullanıcı verisi varsa state güncellenir.
     */
    const updateUserData = async (uid: string) => {
        try {
            // Firestore'dan kullanıcı verisini çekme
            const docRef = doc(firestore, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if(docSnap.exists()) {
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    name: data.name || null,
                    image: data.image || null
                }
                setUser({...userData}); // Kullanıcı verisini state'de güncelleme
            }
        } catch (error: any) {
            let msg = error.message;
            console.log('Hata:', msg);
        }
    }

    // AuthContext'in sağlayacağı değerler
    const contextValue: AuthContextType = {
        user,            // Kullanıcı verisi
        setUser,         // Kullanıcı verisini güncelleme fonksiyonu
        login,           // Giriş yapma fonksiyonu
        register,        // Kayıt olma fonksiyonu
        updateUserData   // Kullanıcı verisini güncelleme fonksiyonu
    }

    /**
     * AuthProvider: Uygulamanın çocuk bileşenlerini AuthContext ile sarmalar
     * - Tüm uygulamada kimlik doğrulama verilerine erişim sağlar.
     */
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * useAuth: Kimlik doğrulama verilerine erişmek için özel hook
 * - AuthContext içerisindeki verileri döner.
 * - Eğer AuthProvider içinde kullanılmazsa hata fırlatır.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth bir AuthProvider içinde kullanılmalıdır');
    }   
    return context;
}