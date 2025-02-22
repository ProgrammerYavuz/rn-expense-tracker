import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Button from '@/components/Button'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
            <Typo fontWeight='500'>Giriş Yap</Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeInDown.duration(1000)}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode='contain'
          />
        </View>

        <View style={styles.footer}>
          <Animated.View entering={FadeInDown.duration(1000).delay(100).springify().damping(12)} style={{alignItems: 'center'}}>
            <Typo fontWeight='800' size={24}>Finansal geleceğine</Typo>
            <Typo fontWeight='800' size={30}>daima yön ver!</Typo>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(600).springify().damping(12)} style={{alignItems: 'center', gap: 2}}>
            <Typo size={17} color={colors.textLight}>Daha iyi bir başlangıc için</Typo>
            <Typo size={14} color={colors.textLight}>finanslarınızı geleceğe yönelik düzenleyin.</Typo>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(1000).springify().damping(12)} style={styles.buttonContainer}>
            <Button onPress={() => router.push("/(auth)/register")}>
              <Typo size={22} color={colors.neutral900} fontWeight='700'>Haydi Başlayalım</Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacingY._7,
  },
  welcomeImage: {
    width: '100%',
    height: verticalScale(350),
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  loginButton: {
    alignSelf: 'flex-end',
    marginRight: spacingX._20 
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.neutral900,
    alignItems: 'center',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacingX._25,
  }
})