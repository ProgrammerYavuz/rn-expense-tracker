import { Dimensions, PixelRatio } from "react-native";

// Cihazın ekran genişliği ve yüksekliği alınır
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Ekranın kısa ve uzun kenarlarını belirler
const [shortDimension, longDimension] =
  SCREEN_WIDTH < SCREEN_HEIGHT
    ? [SCREEN_WIDTH, SCREEN_HEIGHT] // Portre modundaysa, genişlik kısa kenar olur
    : [SCREEN_HEIGHT, SCREEN_WIDTH]; // Manzara modundaysa, yükseklik kısa kenar olur

// Tasarımın referans alındığı temel ekran boyutları (örneğin, iPhone X gibi bir cihaz)
const guidelineBaseWidth = 375; // Referans genişlik
const guidelineBaseHeight = 812; // Referans yükseklik

// Genişlik bazlı ölçeklendirme fonksiyonu
export const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (shortDimension / guidelineBaseWidth) * (size as number) // Mevcut ekranın genişlik oranına göre ölçeklendirme
    )
  );

// Yükseklik bazlı ölçeklendirme fonksiyonu
export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (longDimension / guidelineBaseHeight) * (size as number) // Mevcut ekranın yükseklik oranına göre ölçeklendirme
    )
  );
