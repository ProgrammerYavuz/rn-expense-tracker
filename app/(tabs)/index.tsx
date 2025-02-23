import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Typo from '@/components/Typo'
import ScreenWrapper from '@/components/ScreenWrapper'

const Home = () => {
  return (
    <ScreenWrapper>
      <Typo fontWeight='700' size={24}>Home</Typo>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})