import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'

const Wallet = () => {
  return (
    <ScreenWrapper>
      <Typo fontWeight='700' size={24}>Wallet</Typo>
    </ScreenWrapper>
  )
}

export default Wallet

const styles = StyleSheet.create({})