import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import * as Icons from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { orderBy, where } from 'firebase/firestore'
import Loading from '@/components/Loading'
import WalletListItem from '@/components/WalletListItem'

/**
 * Wallet Bileşeni:
 * - Kullanıcının cüzdanlarını listeleyen ekran bileşeni.
 * - Toplam bakiyeyi hesaplar ve gösterir.
 * - Yeni cüzdan ekleme işlemi için bir buton içerir.
 */
const Wallet = () => {
  const router = useRouter();
  const {user} = useAuth();

  /**
   * Firestore'dan cüzdan verilerini çeker.
   * - `where("uid", "==", user?.uid)`: Sadece giriş yapan kullanıcıya ait cüzdanları alır.
   * - `orderBy("created", "desc")`: Cüzdanları oluşturulma tarihine göre sıralar (yeniden eskiye).
   */
  const { data: wallets, loading, error } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc")
  ]);

  // console.log('wallets:', wallets.length);
  const getTotalBalance = () =>
    wallets.reduce((total, item) => {
      total = total + (item.amount || 0);
      return total
    }, 0);

  return (
    <ScreenWrapper style={{backgroundColor: colors.black}}>
      <View style={styles.container}>
        <View style={styles.balanceView}>
          <View style={{alignItems: 'center'}}>
            <Typo size={40} fontWeight='500'>{getTotalBalance()?.toFixed(2)} ₺</Typo>
            <Typo size={16} color={colors.textLight}>Toplam Bakiye</Typo>
          </View>
        </View>

        <View style={styles.wallets}>
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight='500'>Cüzdanım</Typo>
            <TouchableOpacity onPress={() => router.push("/(modals)/walletModal")}>
              <Icons.PlusCircle weight='bold' size={verticalScale(33)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && <Loading />}

          <FlatList
            data={wallets}
            renderItem={({item, index}) => (
              <WalletListItem item={item} index={index} router={router} />
            )}
            contentContainerStyle={styles.listStyle}
          />
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Wallet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacingY._10
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._20
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15
  }
})