import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import * as Icons from 'phosphor-react-native'
import Input from '@/components/Input'
import { MonthsType, TransactionType } from '@/types'
import { useAuth } from '@/contexts/authContext'
import { orderBy, where } from 'firebase/firestore'
import useFetchData from '@/hooks/useFetchData'
import TransactionList from '@/components/TransactionList'
import Typo from '@/components/Typo'
import { Dropdown, MultiSelect } from 'react-native-element-dropdown'
import { expenseCategories, transactionTypes } from '@/constants/data'
import Button from '@/components/Button'

const SearchModal = () => {
    const {user} = useAuth();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

    const constraints = [
        where("uid", "==", user?.uid),
        orderBy("date", "desc")
    ];
    
    const { data: allTransactions, loading: transactionLoading } = useFetchData<TransactionType>("transactions", constraints);

    // Türkçe ay isimleri ve karşılık gelen ay numaraları
    const months: MonthsType = {
        "ocak": 0,
        "şubat": 1,
        "mart": 2,
        "nisan": 3,
        "mayıs": 4,
        "haziran": 5,
        "temmuz": 6,
        "ağustos": 7,
        "eylül": 8,
        "ekim": 9,
        "kasım": 10,
        "aralık": 11
    };

    // Ay numaralarının Türkçe karşılıkları
    const monthNames: string[] = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];

    // Tarih kontrolü için yardımcı fonksiyon
    const matchesDate = (searchText: string, dateTimestamp: any): boolean => {
        if (!searchText || !dateTimestamp) return false;
        
        const date = dateTimestamp.toDate();
        const day = date.getDate();
        const month = date.getMonth(); // 0-11
        const year = date.getFullYear();
        
        // Gün kontrolü (sadece sayı ise)
        if (!isNaN(Number(searchText)) && parseInt(searchText) === day) {
            return true;
        }
        
        // Ay kontrolü (isim olarak)
        const monthText = searchText.toLowerCase();
        if (monthNames.includes(monthText) && months[monthText] === month) {
            return true;
        }
        
        // Kısmi ay ismi kontrolü (örn: "may" için "mayıs")
        for (const monthName of monthNames) {
            if (monthName.startsWith(monthText) && months[monthName] === month) {
                return true;
            }
        }
        
        // Yıl kontrolü
        if (searchText === year.toString() || searchText === year.toString().substring(2)) {
            return true;
        }
        
        // Gün-ay-yıl formatı kontrol (örn: 15.05, 15/05, 15 mayıs, mayıs 2023)
        if (searchText.includes('.') || searchText.includes('/')) {
            const parts = searchText.split(/[./]/);
            if (parts.length >= 2) {
                const dayPart = parseInt(parts[0]);
                const monthPart = parseInt(parts[1]) - 1; // Ay 0-11 indexleniyor
                
                if (dayPart === day && monthPart === month) {
                    return true;
                }
                
                if (parts.length === 3) {
                    const yearPart = parseInt(parts[2]);
                    const shortYear = year % 100;
                    
                    if (dayPart === day && monthPart === month && 
                        (yearPart === year || yearPart === shortYear)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    };

    const filteredTransactions = allTransactions?.filter((item) => {
        const searchText = search.trim().toLowerCase();
      
        // Açıklama içinde arama
        const matchesSearch = searchText.length > 0 ? item.description?.toLowerCase().includes(searchText) : true;
      
        // Tarih kontrolü
        const matchesDateFilter = searchText.length > 0 ? matchesDate(searchText, item.date) : true;
      
        // Dropdown'dan gelen işlem tipi
        const matchesType = typeFilter ? item.type === typeFilter : true;
      
        // Çoklu kategori filtresi
        const matchesCategory = categoryFilter.length > 0 ? categoryFilter.includes(item.category || '') : true;
      
        return (matchesSearch || matchesDateFilter) && matchesType && matchesCategory;
    });

    const resetFilters = () => {
        setTypeFilter('');
        setCategoryFilter([]);
    };

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
      <View style={styles.container}>
        <Header title={'Ara'} leftIcon={<BackButton />} style={{marginBottom: spacingY._10}} />

        <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.inputContainer}>
                <Input 
                    placeholder='Kelime veya tarih değeri girin'
                    placeholderTextColor={colors.neutral400}
                    value={search}
                    onChangeText={(value) => setSearch(value)}
                    icon={<Icons.MagnifyingGlass size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
                    containerStyle={{ backgroundColor: colors.neutral800 }}
                />
                {/* <Typo color={colors.primary} fontWeight='600'>Filtreleme</Typo> */}
                <Dropdown
                    style={styles.dropdownContainer}
                    activeColor={colors.neutral700}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    data={transactionTypes}
                    // search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    itemTextStyle={styles.dropdownItemText}
                    itemContainerStyle={styles.dropdownItemContainer}
                    containerStyle={styles.dropdownListContainer}
                    placeholder={'İşlem Tipini Seçin'}
                    // searchPlaceholder="Search..."
                    value={typeFilter}
                    onChange={item => {
                        setTypeFilter(item.value)
                        setCategoryFilter([]); // Gelir seçildiğinde kategoriyi temizle
                    }}
                />

                {typeFilter === 'expense' && (
                    <MultiSelect
                        style={styles.dropdownContainer}
                        activeColor={colors.neutral700}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        iconStyle={styles.dropdownIcon}
                        data={Object.values(expenseCategories)}
                        // search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        itemTextStyle={styles.dropdownItemText}
                        itemContainerStyle={styles.dropdownItemContainer}
                        containerStyle={styles.dropdownListContainer}
                        placeholder={'Kategori Seçin'}
                        // searchPlaceholder="Search..."
                        value={categoryFilter}
                        onChange={item => {
                            setCategoryFilter(item)
                        }}
                        selectedStyle={{
                            backgroundColor: colors.neutral500,
                            borderRadius: radius._10,
                            gap: spacingX._5,
                            paddingVertical: spacingY._5,
                            paddingHorizontal: spacingX._7,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    />
                )}

                {(typeFilter !== '' || categoryFilter.length > 0 ) &&(
                    <Button onPress={resetFilters}>
                        <Typo fontWeight='700' color={colors.black}>Filtreyi Temizle</Typo>
                    </Button>
                )}

            </View>

            <View>
                <TransactionList
                    data={filteredTransactions}
                    loading={transactionLoading}
                    emptyListMessage='Girilen kelimeye uygun bir işlem bulunamadı.'
                />
            </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  )
}

export default SearchModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacingY._20
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    inputContainer: {
        gap: spacingY._10
    },
    dropdownContainer: {
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._15,
        borderCurve: "continuous"
    },
    dropdownItemText: {
        color: colors.white
    },
    dropdownSelectedText: {
        color: colors.white,
        fontSize: verticalScale(14)
    },
    dropdownListContainer: {
        backgroundColor: colors.neutral900,
        borderRadius: radius._15,
        borderCurve: 'continuous',
        paddingVertical: spacingY._7,
        top: 5,
        borderColor: colors.neutral500,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 5
    },
    dropdownPlaceholder: {
        color: colors.white
    },
    dropdownItemContainer: {
        borderRadius: radius._15,
        marginHorizontal: spacingY._7
    },
    dropdownIcon: {
        height: verticalScale(30),
        tintColor: colors.neutral300
    }
})