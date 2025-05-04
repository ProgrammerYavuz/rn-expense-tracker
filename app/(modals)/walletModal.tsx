import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'


const WalletModal = () => {
    const {user, updateUserData} = useAuth();
    const [wallet, setWallet] = useState<WalletType>({
        name: '',
        image: null
    })

    const [loading , setLoading] = useState(false);
    const router = useRouter();

    const oldWallet: {name: string, image: string, id: string} = useLocalSearchParams();

    useEffect(() => {
        if(oldWallet?.id){
            setWallet({
                name: oldWallet?.name,
                image: oldWallet?.image
            })
        }
    }, [])

    const onSubmit = async () => {
        let {name, image} = wallet;
        if (!name.trim() || !image){
            return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.', [{text: 'Tamam'}]);
        }

        const data: WalletType = {
            name,
            image,
            uid: user?.uid
        }

        if (oldWallet?.id) data.id = oldWallet?.id;

        setLoading(true);
        const res = await createOrUpdateWallet(data);
        setLoading(false);
        console.log('kayıt sonucu:', res);
        if (res.success) { 
            router.back();
        } else {
            Alert.alert('Hata', res.msg, [{text: 'Tamam'}]);
        }
    }

    const onDelete = async () => {
        if(!oldWallet?.id) return;
        setLoading(true);
        const res = await deleteWallet(oldWallet?.id);
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
            'Cüzdanı Sil',
            'Cüzdanı silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.',
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
        <Header title={oldWallet?.id ? "Cüzdanı Düzenle" : "Yeni Cüzdan"} leftIcon={<BackButton />} style={{marginBottom: spacingY._10}} />

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Cüzdan Adı</Typo>
                <Input 
                    placeholder='Cüzdan Adı' 
                    value={wallet.name}
                    onChangeText={(value) => setWallet({ ...wallet, name: value })}
                    icon={<Icons.Wallet size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
                />
            </View>
            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Cüzdan Resmi</Typo>
                <ImageUpload file={wallet.image} onSelect={file => setWallet({ ...wallet, image: file })} onClear={() => setWallet({ ...wallet, image: null })} placeholder='Görsel Yükle' />
            </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldWallet?.id && !loading && (
            <Button onPress={showDeleteAlert} style={{backgroundColor: colors.rose, paddingHorizontal: spacingX._15}}>
                <Icons.Trash size={verticalScale(24)} color={colors.white} weight="bold" />
            </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{flex: 1}}>
            <Typo fontWeight='700' color={colors.black}>{oldWallet?.id ? "Cüzdanı Düzenle" : "Cüzdan Ekle"}</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default WalletModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacingY._20
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
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    inputContainer: {
        gap: spacingY._10
    }
})