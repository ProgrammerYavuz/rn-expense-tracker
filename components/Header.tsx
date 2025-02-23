import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HeaderProps } from '@/types'
import Typo from './Typo'

const Header = ({title = "", leftIcon, style}: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {title && (
        <Typo 
          size={20}
          fontWeight="600"
          style={{
            width: leftIcon ? "82%" : "100%",
            textAlign: "center"
          }}
        >
          {title}
        </Typo>
      )}
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  leftIcon: {
    alignSelf: "flex-start"
  }
})