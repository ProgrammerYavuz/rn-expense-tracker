import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingX } from '@/constants/theme'
import { Image } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

/**
 * WalletListItem:
 * - Kullanıcının cüzdanlarını listeleyen bileşen.
 * - Cüzdana tıklandığında detay modalını açar.
 * - Animasyonlu giriş efekti içerir.
 */

const WalletListItem = ({
    item, // Gösterilecek cüzdan verisi
    index, // Liste içerisindeki konumu (animasyon gecikmesi için kullanılır)
    router // Navigasyon işlemlerini yönetmek için `expo-router`
}: {
    item: WalletType,
    index: number,
    router: Router
}) => {

    /**
     * openWallet:
     * - Cüzdan detay modülünü açar.
     * - Seçilen cüzdanın bilgileri ile yönlendirme yapar.
     */

    const openWallet = () => {
        router.push({
            pathname: "/(modals)/walletModal",
            params: {
                id: item?.id,
                name: item?.name,
                image: item?.image
            }
        })
    }

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify().damping(12)}>
      <TouchableOpacity style={styles.container} onPress={openWallet}>
        <View style={styles.imageContainer}>
          <Image style={{flex: 1}} source={{uri: item?.image}} contentFit='cover' transition={100} />
        </View>
        <View style={styles.nameContainer}>
          <Typo size={16}>{item?.name}</Typo>
          <Typo size={14} color={colors.neutral400} fontWeight='600'>{item?.amount} ₺</Typo>
        </View>
        <Icons.CaretRight weight='bold' size={verticalScale(24)} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(17)   
    },
    imageContainer: {
        height: verticalScale(45),
        width: verticalScale(45),
        borderWidth: 1,
        borderColor: colors.neutral600,
        borderRadius: radius._12,
        borderCurve: 'continuous',
        overflow: 'hidden'
    },
    nameContainer: {
        flex: 1,
        gap: 2,
        marginLeft: spacingX._10
    }
})