import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart } from "react-native-gifted-charts";
import Loading from '@/components/Loading'
import { useAuth } from '@/contexts/authContext'
import { fetchMonthlyStats, fetchWeeklyStats, fetchYearlyStats } from '@/services/transactionService'
import TransactionList from '@/components/TransactionList'

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if(activeIndex === 0){
      getWeeklyStats();
    }
    if(activeIndex === 1){
      getMonthlyStats();
    }
    if(activeIndex === 2){
      getYearlyStats();
    }
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    const res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Hata", "İstatistikler alınamadı!", [{text: "Tamam"}]);
    }
  }

  const getMonthlyStats = async () => {
    setChartLoading(true);
    const res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Hata", "İstatistikler alınamadı!", [{text: "Tamam"}]);
    }
  }

  const getYearlyStats = async () => {
    setChartLoading(true);
    const res = await fetchYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Hata", "İstatistikler alınamadı!", [{text: "Tamam"}]);
    }
  }
  
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="İstatistik" />
          <ScrollView
            contentContainerStyle={{
              gap: spacingY._20,
              paddingTop: spacingY._10,
              paddingBottom: verticalScale(100)
            }}
            showsVerticalScrollIndicator={false}
          >
            <SegmentedControl
              values={['Haftalık', 'Aylık', 'Yıllık']}
              selectedIndex={activeIndex}
              onChange={(event) => {
                setActiveIndex(event.nativeEvent.selectedSegmentIndex);
              }}
              tintColor={colors.primary}
              backgroundColor={colors.neutral800}
              appearance="dark"
              activeFontStyle={styles.segmentFontStyle}
              style={styles.segmentStyle}
              fontStyle={{...styles.segmentFontStyle, color: colors.white}}
            />

            <View style={styles.chartContainer}>
              {
                chartData.length > 0 ? (
                  <BarChart
                    data={chartData}
                    barWidth={scale(12)}
                    spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                    roundedTop
                    roundedBottom
                    hideRules
                    yAxisLabelSuffix='₺'
                    yAxisThickness={scale(2)}
                    xAxisThickness={scale(2)}
                    yAxisLabelWidth={scale(50)}
                    // hideYAxisText
                    yAxisColor={colors.neutral350}
                    xAxisColor={colors.neutral350}
                    xAxisLabelTextStyle={{color: colors.neutral350, fontSize: verticalScale(12)}}
                    yAxisTextStyle={{color: colors.neutral350, fontSize: verticalScale(12)}}
                    noOfSections={4}
                    minHeight={5}
                  />
                ) : (
                  <View style={styles.noChart}/>
                )
              }

              {
                chartLoading && (
                  <View style={styles.chartLoadingContainer}>
                    <Loading color={colors.primary}/>
                  </View>
                )
              }
            </View>

            <View>
              <TransactionList
                title="İşlemler"
                emptyListMessage="Hiç işlem bulunamadı"
                data={transactions}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Statistics

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
    gap: spacingY._10
  },
  header: {
    
  },
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center"
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0, 0, 0, 0.6)"
  },
  noChart: {
    width: "100%",
    height: verticalScale(210),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous"
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black
  }
})