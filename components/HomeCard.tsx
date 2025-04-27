import { ImageBackground, StyleSheet, View } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { scale, verticalScale } from '@/utils/styling'
import { colors, spacingX, spacingY } from '@/constants/theme'
import * as Icons from "phosphor-react-native"
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { orderBy, where } from 'firebase/firestore'
import { formatCurrency } from '@/utils/formatCurrency'
import Loading from './Loading'

const HomeCard = () => {
    const { user } = useAuth();

    const { data: wallets, loading: walletLoading } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc")
    ]);

    const getTotals = () => {
        return wallets.reduce((totals: any, item: WalletType) => {
            totals.balance = totals.balance + Number(item.amount);
            totals.income = totals.income + Number(item.totalIncome);
            totals.expenses = totals.expenses + Number(item.totalExpenses);
            return totals;
        }, {balance: 0, income: 0, expenses: 0 })
    }
    
  return (
    <ImageBackground
        source={require('../assets/images/card.png')}
        resizeMode='stretch'
        style={styles.bgImage}
    >
        <View style={styles.container}>
            {walletLoading ? <Loading color={colors.neutral800} /> : (
                <>
                    <View>
                        <View style={styles.totalBalanceRow}>
                            <Typo size={17} color={colors.neutral800} fontWeight='500'>Toplam Bakiye</Typo>
                            <Icons.DotsThreeOutline size={verticalScale(23)} color={colors.neutral800} weight='fill' />
                        </View>
                        <Typo size={30} color={colors.neutral800} fontWeight='bold'>{formatCurrency(getTotals()?.balance, 'TRY', 2)}</Typo>
                    </View>
                    <View style={styles.stats}>
                        <View style={{gap: verticalScale(5)}}>
                            <View style={styles.incomeExpense}> 
                                <View style={styles.statsIcon}>
                                    <Icons.ArrowDown
                                        size={verticalScale(25)}
                                        color={colors.black}
                                        weight='bold'
                                    />
                                </View>
                                <Typo size={16} color={colors.neutral700} fontWeight='500'>Gelir</Typo>
                            </View>
                            <View style={{alignSelf: "center"}}>
                                <Typo size={17} color={colors.green} fontWeight='600'>{formatCurrency(getTotals()?.income, 'TRY', 2)}</Typo>
                            </View>
                        </View>

                        <View style={{gap: verticalScale(5)}}>
                            <View style={styles.incomeExpense}> 
                                <View style={styles.statsIcon}>
                                    <Icons.ArrowUp
                                        size={verticalScale(25)}
                                        color={colors.black}
                                        weight='bold'
                                    />
                                </View>
                                <Typo size={16} color={colors.neutral700} fontWeight='500'>Gider</Typo>
                            </View>
                            <View style={{alignSelf: "center"}}>
                                <Typo size={17} color={colors.rose} fontWeight='600'>{formatCurrency(getTotals()?.expenses, 'TRY', 2)}</Typo>
                            </View>
                        </View>

                    </View>
                </>
            )}
        </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
    bgImage: {
        width: '100%',
        height: scale(210),
    },
    container: {
        padding: spacingX._20,
        paddingHorizontal: scale(23),
        height: "87%",
        width: "100%",
        justifyContent: "space-between"
    },
    totalBalanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._5
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    statsIcon: {
        backgroundColor: colors.neutral350,
        padding: spacingY._5,
        borderRadius: 50
    },
    incomeExpense: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingY._7
    }
})