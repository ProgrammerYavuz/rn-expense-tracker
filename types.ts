import { Href } from "expo-router";
import { Firestore, Timestamp } from "firebase/firestore";
import { Icon } from "phosphor-react-native";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  ImageStyle,
  PressableProps,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

// Ekran bileşenleri için genel bir sarmalayıcı türü
export type ScreenWrapperProps = {
  style?: ViewStyle; // Opsiyonel stil tanımı
  children: React.ReactNode; // İçeride render edilecek bileşenler
};

// Modal bileşenlerini sarmalamak için bir tür
export type ModalWrapperProps = {
  style?: ViewStyle; // Modalın genel stil tanımı
  children: React.ReactNode; // İçerik
  bg?: string; // Arkaplan rengi (opsiyonel)
};

// Kullanıcı hesap ayarlarında gösterilecek seçenekler için bir tür
export type accountOptionType = {
  title: string; // Seçenek başlığı
  icon: React.ReactNode; // İkon bileşeni
  bgColor: string; // Arkaplan rengi
  routeName?: any; // Navigasyon için kullanılacak route adı (opsiyonel)
};

// Tipografi (yazı) bileşenleri için bir tür
export type TypoProps = {
  size?: number; // Yazı boyutu
  color?: string; // Yazı rengi
  fontWeight?: TextStyle["fontWeight"]; // Yazı kalınlığı
  children: any | null; // İçerik (string veya başka bir bileşen olabilir)
  style?: TextStyle; // Opsiyonel stil tanımı
  textProps?: TextProps; // React Native `Text` bileşenine özel özellikler
};

// Genel ikon bileşenleri için bir tür
export type IconComponent = React.ComponentType<{
  height?: number; // İkon yüksekliği
  width?: number; // İkon genişliği
  strokeWidth?: number; // Çizgi kalınlığı
  color?: string; // Renk
  fill?: string; // Doldurma rengi
}>;

// İkon bileşenlerini tanımlamak için kullanılabilecek props
export type IconProps = {
  name: string; // İkon adı
  color?: string; // İkon rengi
  size?: number; // Boyut
  strokeWidth?: number; // Çizgi kalınlığı
  fill?: string; // Doldurma rengi
};

// Uygulama başlıkları için bir tür
export type HeaderProps = {
  title?: string; // Başlık metni
  style?: ViewStyle; // Stil
  leftIcon?: ReactNode; // Sol tarafa eklenebilecek ikon
  rightIcon?: ReactNode; // Sağ tarafa eklenebilecek ikon
};

// Geri butonu bileşeni için bir tür
export type BackButtonProps = {
  style?: ViewStyle; // Buton stili
  iconSize?: number; // İkon boyutu
};

// Finansal işlemler (harcama, gelir vb.) için genel bir tür
export type TransactionType = {
  id?: string; // İşlem ID'si (opsiyonel)
  type: string; // İşlem tipi ("gelir", "gider" vb.)
  amount: number; // İşlem miktarı
  category?: string; // İşlem kategorisi (örneğin "Market", "Fatura" vb.)
  date: Date | Timestamp | string; // İşlem tarihi (Firebase Timestamp destekleniyor)
  description?: string; // Açıklama (opsiyonel)
  image?: any; // İşlemle ilgili resim (fiş vb.)
  uid?: string; // Kullanıcı ID'si (bu işlemi kimin yaptığı)
  walletId: string; // Hangi cüzdana bağlı olduğu
};

// Harcama kategorilerini tanımlamak için kullanılan tür
export type CategoryType = {
  label: string; // Kategori adı
  value: string; // Kategori değeri (örneğin "groceries", "bills" vb.)
  icon: Icon; // Kategoriye özel ikon
  bgColor: string; // Arkaplan rengi
};

// Uygulamada kullanılan harcama kategorilerini gruplamak için bir nesne tipi
export type ExpenseCategoriesType = {
  [key: string]: CategoryType; // Kategori anahtarları ve değerleri
};

// İşlem listesini yönetmek için kullanılan bir tür
export type TransactionListType = {
  data: TransactionType[]; // İşlem dizisi
  title?: string; // Liste başlığı (opsiyonel)
  loading?: boolean; // Verinin yüklenip yüklenmediğini belirten flag
  emptyListMessage?: string; // Eğer liste boşsa gösterilecek mesaj
};

// Tek bir işlem öğesini temsil eden bileşen için props tanımlaması
export type TransactionItemProps = {
  item: TransactionType; // İşlem verisi
  index: number; // Listenin kaçıncı elemanı olduğu
  handleClick: Function; // Tıklama işlevi
};

// Gelişmiş giriş bileşeni (input) için props
export interface InputProps extends TextInputProps {
  icon?: React.ReactNode; // Giriş alanının içinde gösterilecek ikon (opsiyonel)
  containerStyle?: ViewStyle; // Dış kapsayıcının stil tanımı
  inputStyle?: TextStyle; // Giriş alanının stil tanımı
  inputRef?: React.RefObject<TextInput>; // Input referansı
}

// Özelleştirilmiş buton bileşeni için props
export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle; // Butonun genel stil tanımı
  onPress?: () => void; // Tıklama olayı
  loading?: boolean; // Yükleme durumu (buton tıklandığında gösterilebilir)
  children: React.ReactNode; // Buton içeriği
}

// Resim yükleme bileşeni için props
export type ImageUploadProps = {
  file?: any; // Seçili dosya
  onSelect: (file: any) => void; // Dosya seçildiğinde çağrılacak fonksiyon
  onClear: () => void; // Dosya temizleme işlemi
  containerStyle?: ViewStyle; // Konteyner stil tanımı
  imageStyle?: ViewStyle; // Resim stil tanımı
  placeholder?: string; // Yer tutucu metin
};

// Kullanıcı bilgilerini temsil eden bir tür
export type UserType = {
  uid?: string; // Kullanıcı ID'si
  email?: string | null; // Kullanıcı e-posta adresi
  name: string | null; // Kullanıcı adı
  image?: any; // Profil resmi
} | null; // Kullanıcı giriş yapmamışsa `null` olabilir

// Kullanıcı verisini yönetmek için kullanılan tür
export type UserDataType = {
  name: string; // Kullanıcı adı
  image?: any; // Kullanıcı resmi (opsiyonel)
};

// Yetkilendirme (authentication) işlemlerini yöneten bağlam (context)
export type AuthContextType = {
  user: UserType; // Kullanıcı verisi
  setUser: Function; // Kullanıcıyı güncellemek için fonksiyon
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg?: string }>; // Giriş fonksiyonu
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; msg?: string }>; // Kayıt fonksiyonu
  updateUserData: (userId: string) => Promise<void>; // Kullanıcı verisini güncelleme fonksiyonu
};

// API yanıtlarını yönetmek için bir tür
export type ResponseType = {
  success: boolean; // İşlemin başarılı olup olmadığını belirten flag
  data?: any; // Dönen veri (opsiyonel)
  msg?: string; // Hata veya başarı mesajı
};

// Cüzdanları temsil eden tür
export type WalletType = {
  id?: string; // Cüzdan ID'si
  name: string; // Cüzdan adı
  amount?: number; // Bakiye
  totalIncome?: number; // Toplam gelir
  totalExpenses?: number; // Toplam gider
  image: any; // Cüzdan resmi
  uid?: string; // Kullanıcı ID'si
  created?: Date; // Oluşturulma tarihi
};

// Ay numaralarını Türkçe karşılıklarıyla temsil eden tür
export type MonthsType = {
    [key: string]: number;
};