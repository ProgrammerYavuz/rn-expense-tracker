import { Alert, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { TransactionType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { Dropdown } from 'react-native-element-dropdown';
import { expenseCategories, transactionTypes } from '@/constants/data'
import useFetchData from '@/hooks/useFetchData'
import { orderBy, where } from 'firebase/firestore'
import DateTimePicker from '@react-native-community/datetimepicker';
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'

const TransactionModal = () => {
    const { user } = useAuth();
    const [transaction, setTransaction] = useState<TransactionType>({
        type: 'expense',
        amount: 0,
        description: '',
        category: '',
        date: new Date(),
        walletId: '',
        image: null
    })

    const [loading , setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    const { data: wallets, loading: walletLoading, error: walletError } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc")
    ]);
    type paramType = {
        id: string;
        type: string;
        amount: string;
        category?: string;
        date: string;
        description?: string;
        image?: string;
        uid?: string;
        walletId: string;
    };
    const oldTransaction: paramType = useLocalSearchParams();

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || transaction.date;
        setTransaction({ ...transaction, date: currentDate });
        setShowDatePicker(Platform.OS === 'ios' ? true : false);
    };

    useEffect(() => {
        if (oldTransaction?.id) {
            setTransaction({
                type: oldTransaction?.type,
                amount: Number(oldTransaction.amount),
                description: oldTransaction.description || '',
                category: oldTransaction.category || '',
                date: new Date(oldTransaction.date),
                walletId: oldTransaction?.walletId,
                image: oldTransaction?.image
            })
        }
    }, []);

    const onSubmit = async () => {
        const {type, amount, description, category, date, walletId, image} = transaction;

        if (!walletId || !date || !amount || (type === 'expense' && !category)){
            Alert.alert('İşlem Bilgileri Eksik', 'Lütfen tüm alanları doldurunuz.', [{text: 'Tamam'}]);
            return;
        }

        let transactionData: TransactionType = {
            type,
            amount,
            description,
            category,
            date,
            walletId,
            image: image ? image : null,
            uid: user?.uid
        }

        if (oldTransaction?.id) transactionData.id = oldTransaction.id;

        setLoading(true);
        const res = await createOrUpdateTransaction(transactionData);
        setLoading(false);
        if (res.success) {
            router.back();
        } else {
            Alert.alert('Hata', res.msg, [{text: 'Tamam'}]);
        }
    }

    const onDelete = async () => {
        if(!oldTransaction?.id) return;
        setLoading(true);
        const res = await deleteTransaction(oldTransaction?.id, oldTransaction?.walletId);
        setLoading(false);
        console.log('silme sonucu:', res);
        if (res.success) {
            router.back();
        } else {
            Alert.alert('Hata', res.msg, [{text: 'Tamam'}]);
        }
    }

    const showDeleteAlert = () => {
        Alert.alert(
            'İşlemi Sil',
            'Bu işlemi silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.',
            [
                {
                    text: 'Iptal',
                    style: 'cancel'
                },
                {
                    text: 'Sil',
                    onPress: () => {
                        onDelete();
                    },
                    style: "destructive"
                }
            ]
        )
    }

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title={oldTransaction?.id ? "İşlemi Düzenle" : "Yeni İşlem"} leftIcon={<BackButton />} style={{marginBottom: spacingY._10}} />

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>İşlem Tipi</Typo>
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
                    value={transaction.type}
                    onChange={item => {
                        setTransaction({ ...transaction, type: item.value })
                    }}
                />
            </View>
            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Cüzdan</Typo>
                <Dropdown
                    style={styles.dropdownContainer}
                    activeColor={colors.neutral700}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    data={wallets.map(wallet => ({
                        label: `${wallet?.name} (₺${wallet.amount})`,
                        value: wallet.id
                    }))}
                    // search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    itemTextStyle={styles.dropdownItemText}
                    itemContainerStyle={styles.dropdownItemContainer}
                    containerStyle={styles.dropdownListContainer}
                    placeholder={'Cüzdan Seçin'}
                    // searchPlaceholder="Search..."
                    value={transaction.walletId}
                    onChange={item => {
                        setTransaction({ ...transaction, walletId: item.value })
                    }}
                />
            </View>

            {
                transaction.type == 'expense' && (
                    <View style={styles.inputContainer}>
                        <Typo color={colors.primary} fontWeight='600'>Gider Kategorisi</Typo>
                        <Dropdown
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
                            value={transaction.category}
                            onChange={item => {
                                setTransaction({ ...transaction, category: item.value })
                            }}
                        />
                    </View>
                )
            }

            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Tarih</Typo>
                {
                    !showDatePicker && (
                        <Pressable
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Typo size={14}>{(transaction.date as Date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Typo>
                        </Pressable>
                    )
                }

                {showDatePicker && (
                    <View style={Platform.OS === 'ios' && styles.iosDatePicker}>
                        <DateTimePicker
                            themeVariant='dark'
                            value={transaction.date as Date}
                            textColor={colors.white}
                            mode='date'
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            locale='tr-TR'
                        />
                        {
                            Platform.OS === 'ios' && (
                                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(false)}>
                                    <Typo size={15} fontWeight='600'>Seç</Typo>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                )}
            </View>

            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Tutar</Typo>
                <Input
                    keyboardType='numeric'
                    value={transaction.amount.toString()}
                    onChangeText={(value) => setTransaction({ ...transaction, amount: Number(value.replace(/[^0-9]/g, '')) })}
                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.flexRow}>
                    <Typo color={colors.primary} fontWeight='600'>Açıklama</Typo>
                    <Typo color={colors.neutral500} size={14} fontWeight='600'>(opsiyonel)</Typo>
                </View>
                <Input
                    value={transaction.description}
                    multiline
                    containerStyle={{
                        flexDirection: 'row',
                        height: verticalScale(100),
                        alignItems: 'flex-start',
                        paddingVertical: 15
                    }}
                    onChangeText={(value) => setTransaction({ ...transaction, description: value })}
                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.flexRow}>
                    <Typo color={colors.primary} fontWeight='600'>Fiş</Typo>
                    <Typo color={colors.neutral500} size={14} fontWeight='600'>(opsiyonel)</Typo>
                </View>
                <ImageUpload file={transaction.image} onSelect={file => setTransaction({ ...transaction, image: file })} onClear={() => setTransaction({ ...transaction, image: null })} placeholder='Görsel Yükle' />
            </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldTransaction?.id && !loading && (
            <Button onPress={showDeleteAlert} style={{backgroundColor: colors.rose, paddingHorizontal: spacingX._15}}>
                <Icons.Trash size={verticalScale(24)} color={colors.white} weight="bold" />
            </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{flex: 1}}>
            <Typo fontWeight='700' color={colors.black}>{oldTransaction?.id ? "Düzenle" : "Ekle"}</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
    iosDatePicker: {
        // backgroundColor: colors.primary
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
    },
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20
    },
    form: {
        gap: spacingY._20,
        paddingVertical: spacingY._15,
        paddingBottom: spacingY._40
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(12),
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._5,
        borderTopColor: colors.neutral700,
        borderBottomColor: 'transparent',
        marginBottom: spacingY._5,
        borderWidth: 1
    },
    inputContainer: {
        gap: spacingY._10
    },
    iosDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(54),
        fontSize: verticalScale(14),
        color: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: 'continuous',
        paddingHorizontal: spacingX._15
    },
    androidDropdown: {
        height: verticalScale(54),
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: verticalScale(14),
        color: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: 'continuous'
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: 'continuous',
        paddingHorizontal: spacingX._15
    },
    datePickerButton: {
        backgroundColor: colors.primary,
        padding: spacingY._7,
        marginRight: spacingX._7,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._10
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