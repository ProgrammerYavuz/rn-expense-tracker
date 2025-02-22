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

const Register = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if(!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Hata", "Lütfen mail, şifre ve adınızı girin", [{text: "Tamam"}]);
      return;
    }
    setIsLoading(true);
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{gap: 5, marginTop: spacingY._20}}>
          <Typo fontWeight='800' size={30}>Kayıt Ol</Typo>
          <Typo fontWeight='800' size={30}>Hesabınızı Oluşturun</Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLight} >
            Harcamalarınızı takip etmek için bir hesap oluşturun!
          </Typo>
          <Input 
            placeholder='Adınızı girin' 
            onChangeText={(value) => (nameRef.current = value)}
            icon={<Icons.User size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
          />
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

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight='700' color={colors.black} size={21}>Kayıt Ol</Typo>
          </Button>
        </View>

        <View style={styles.footer}>
          <Typo size={15} color={colors.textLight}>Zaten hesabınız var mı?</Typo>
          <Pressable onPress={() => router.navigate('/(auth)/login')}>
            <Typo size={15} color={colors.primary} fontWeight='700'>Giriş Yap</Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Register

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