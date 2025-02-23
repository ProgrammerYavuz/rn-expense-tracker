import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'

const Statistics = () => {
  return (
    <ScreenWrapper>
      <Typo fontWeight='700' size={24}>Statistics</Typo>
    </ScreenWrapper>
  )
}

export default Statistics

const styles = StyleSheet.create({})