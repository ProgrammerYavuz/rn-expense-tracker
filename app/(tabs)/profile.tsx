import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/authContext'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import { accountOptionType } from '@/types'
import * as Icons from 'phosphor-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useRouter } from 'expo-router'

const Profile = () => {
  const {user} = useAuth(); // Kimlik doğrulama verilerini `useAuth()` ile çekiyoruz.
  const router = useRouter();

  /**
   * accountOptions:
   * - Profil ekranında gösterilecek seçenekleri tanımlar.
   * - Her bir seçenek için `title`, `icon`, `routeName` ve `bgColor` belirtilir.
   * - `routeName`: Butona tıklanınca gidilecek sayfa.
   */
  const accountOptions: accountOptionType[] = [
    {
      title: "Profilini Düzenle",
      icon: (
        <Icons.User
          size={24}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: "/(modals)/profileModal",
      bgColor: '#6366f1'
    },
    {
      title: "Ayarlar",
      icon: (
        <Icons.GearSix
          size={24}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/settingsModal",
      bgColor: '#059669'
    },
    {
      title: "Gizlilik Politikası",
      icon: (
        <Icons.Lock
          size={24}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/privacyPolicyModal",
      bgColor: '#3DA5F4'
    },
    {
      title: "Çıkış Yap",
      icon: (
        <Icons.Power
          size={24}
          color={colors.white}
          weight="fill"
        />
      ),
      // routeName: "/(modals)/logoutModal",
      bgColor: '#e11d48'
    },
  ]

  /**
   * handleLogout:
   * - Firebase Authentication kullanarak kullanıcı oturumunu kapatır.
   */
  const handleLogout = async () => {
    await signOut(auth);
  }

  /**
   * showLogoutAlert:
   * - Çıkış yapmadan önce kullanıcıyı uyarmak için alert gösterir.
   * - "Vazgeç" veya "Çıkış Yap" seçenekleri bulunur.
   */
  const showLogoutAlert = () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "Vazgeç",
          onPress: () => console.log("Vazgeç"),
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          onPress: () => handleLogout(),
          style: "destructive"
        }
      ]
    )
  }

  /**
   * haddlePress:
   * - Her bir hesap seçeneğine tıklandığında çalışır.
   * - Eğer "Çıkış Yap" seçeneğine tıklandıysa `showLogoutAlert()` fonksiyonu çağrılır.
   * - Eğer `routeName` tanımlıysa ilgili sayfaya yönlendirilir.
   */
  const haddlePress = (item: accountOptionType) => {
    if (item.title === "Çıkış Yap") {
      showLogoutAlert();
    }

    if(item.routeName){
      router.push(item.routeName)
    }
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Header title="Profil" style={{marginVertical: spacingY._10}} />

        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image source={getProfileImage(user?.image)} contentFit='cover' transition={100} style={styles.avatar} />
          </View>
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight='600' color={colors.neutral100}>{user?.name}</Typo>
            <Typo size={15} color={colors.neutral400}>{user?.email}</Typo>
          </View>
        </View>

        <View style={styles.accountOptions}>
          {
            accountOptions.map((item, index) => {
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 100).springify().damping(14)} // Her bir seçenek aşağıdan yukarıya animasyonla gelir
                  key={index.toString()}
                  style={styles.listItem}
                >
                  <TouchableOpacity
                    style={styles.flexRow}
                    onPress={() => haddlePress(item)}
                  >
                    <View
                      style={[
                        styles.listIcon,
                        { backgroundColor: item?.bgColor }
                      ]}
                    >
                      {item?.icon && item?.icon}
                    </View>
                    <Typo size={16} style={{flex: 1}} fontWeight='500'>{item?.title}</Typo>
                    <Icons.CaretRight size={verticalScale(20)} color={colors.white} weight='bold' />
                  </TouchableOpacity>
                </Animated.View>
              )
            })
          }
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: spacingY._20
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center'
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5
  },
  nameContainer: {
    alignItems: 'center',
    gap: verticalScale(4)
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius._15,
    borderCurve: 'continuous'
  },
  listItem: {
    marginBottom: verticalScale(15),
    backgroundColor: colors.neutral800,
    borderWidth: 1,
    borderColor: colors.neutral700,
    padding: verticalScale(10),
    borderRadius: radius._15
  },
  accountOptions: {
    marginTop: spacingY._35
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10
  }
})