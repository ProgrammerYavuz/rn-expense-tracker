import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Typo from '@/components/Typo'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import { useAuth } from '@/contexts/authContext'
import * as Icons from 'phosphor-react-native'
import HomeCard from '@/components/HomeCard'
import TransactionList from '@/components/TransactionList'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { limit, orderBy, where } from 'firebase/firestore'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(10)
  ];

  const { data: recentTransactions, loading: transactionLoading } = useFetchData<TransactionType>("transactions", constraints);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{gap: 4}}>
            <Typo size={14} color={colors.neutral400}>Merhaba, </Typo>
            <Typo size={20} color={colors.white} fontWeight='500'>{user?.name}</Typo>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <Icons.MagnifyingGlass size={verticalScale(22)} color={colors.neutral200} weight='bold' />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <HomeCard />
          </View>

          <TransactionList data={recentTransactions} loading={transactionLoading} emptyListMessage='İşlem kaydınız bulunmamaktadır.' title='Son İşlemler' />
        </ScrollView>

        <Button style={styles.floatingButton} onPress={() => router.push('/(modals)/transactionModal')}>
          <Icons.Plus size={verticalScale(24)} color={colors.black} weight='bold' />
        </Button>
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50
  },
  floatingButton: {
    position: 'absolute',
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25
  }
})