import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import * as Icons from 'phosphor-react-native'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'

const Login = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if(!emailRef.current || !passwordRef.current) {
      Alert.alert("Hata", "Lütfen mail ve şifre girin", [{text: "Tamam"}]);
      return;
    }
    setIsLoading(true);
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{gap: 5, marginTop: spacingY._20}}>
          <Typo fontWeight='800' size={30}>Merhaba,</Typo>
          <Typo fontWeight='800' size={30}>Tekrar Hoşgeldin</Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLight} >
            Tüm harcamalarınızı takip etmek için şimdi giriş yapın.
          </Typo>
          <Input 
            placeholder='Mail adresinizi girin' 
            onChangeText={(value) => (emailRef.current = value)}
            icon={<Icons.At size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
          />
          <Input 
            placeholder='Parolanızı girin'
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={<Icons.Lock size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
          />

          <Typo size={14} color={colors.text} style={{alignSelf: 'flex-end'}}>Parolanızı mı unuttunuz?</Typo>
          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight='700' color={colors.black} size={21}>Giriş Yap</Typo>
          </Button>
        </View>

        <View style={styles.footer}>
          <Typo size={15} color={colors.textLight}>Hesabınız yok mu?</Typo>
          <Pressable onPress={() => router.navigate('/(auth)/register')}>
            <Typo size={15} color={colors.primary} fontWeight='700'>Kayıt Ol</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20
  },
  form: {
    gap: spacingY._20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  }
})