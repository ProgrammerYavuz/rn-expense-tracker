import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { colors } from '@/constants/theme'

const Home = () => {
  const handleLogout = async () => {
    await signOut(auth)
  }
  return (
    <View>
      <Text>Home</Text>
      <Button onPress={handleLogout}>
        <Typo fontWeight='700' color={colors.black} size={21}>Çıkış Yap</Typo>
      </Button>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})