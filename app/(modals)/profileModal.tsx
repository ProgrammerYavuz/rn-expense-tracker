import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { UserDataType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { updateUser } from '@/services/userService'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker';

/**
 * ProfileModal Bileşeni:
 * - Kullanıcı profilini düzenlemek için modal olarak açılan sayfa.
 * - Kullanıcı adını ve profil resmini düzenleyebilir.
 * - Düzenleme işlemi Firebase'e kaydedilir.
 */
const ProfileModal = () => {
    // Auth Context'ten kullanıcı verilerini ve update fonksiyonunu çekiyoruz
    const {user, updateUserData} = useAuth();

    // State: Kullanıcı bilgilerini tutar (`name`, `image`)
    const [userData, setUserData] = useState<UserDataType>({
        name: '',
        image: null
    })

    const [loading , setLoading] = useState(false);
    const router = useRouter();

    // `user` değiştiğinde `userData` state'ini günceller.
    useEffect(() => {
        setUserData({
          name: user?.name || '',
          image: user?.image || null  
        })
    }, [user]);

    /**
     * onPickImage:
     * - Expo ImagePicker kullanılarak galeriden resim seçer.
     * - Seçilen resim `userData.image` state'inde tutulur.
     */
    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Sadece resimler gösterilir
            allowsEditing: true, // Resim düzenleme aktif
            aspect: [4, 3], // Resim kırpma oranı
            quality: 0.5, // Resim kalitesi (%50)
        });
        // console.log(result);

         // Resim seçildiyse `userData.image` state'i güncellenir
        if (!result.canceled) {
            setUserData({...userData, image: result.assets[0]});
        }
    }

    /**
     * onSubmit:
     * - Kullanıcı verilerini kaydeder.
     * - `updateUser()` fonksiyonunu çağırarak Firestore'da günceller.
     * - İşlem başarılı olursa modal kapatılır ve kullanıcı verisi yenilenir.
     */
    const onSubmit = async () => {
        let {name, image} = userData;
        if (!name.trim()){ // Eğer ad boşsa uyarı gösterilir
            return Alert.alert('Hata', 'Lütfen adınızı girin.', [{text: 'Tamam'}]);
        }
        setLoading(true);
        const res = await updateUser(user?.uid as string, userData); // Firebase'de güncelleme işlemi
        setLoading(false);
        if (res.success) { // Başarılı olursa veriyi yenileyip modal kapatıyoruz
            updateUserData(user?.uid as string);
            router.back();
        } else {
            Alert.alert('Hata', res.msg, [{text: 'Tamam'}]);
        }
    }
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title="Profilini Düzenle" leftIcon={<BackButton />} style={{marginBottom: spacingY._10}} />

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarContainer}>
                <Image
                    style={styles.avatar}
                    source={getProfileImage(userData.image)}
                    contentFit="cover"
                    transition={100}
                />

                <TouchableOpacity onPress={onPickImage} style={styles.editIcon}>
                    <Icons.Pencil size={24} color={colors.neutral800} weight="regular" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Typo color={colors.primary} fontWeight='600'>Adınız</Typo>
                <Input 
                    placeholder='Adınızı girin' 
                    value={userData.name}
                    onChangeText={(value) => setUserData({ ...userData, name: value })}
                    icon={<Icons.User size={verticalScale(26)} color={colors.neutral300} weight="bold" />}
                />
            </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Button onPress={onSubmit} loading={loading} style={{flex: 1}}>
            <Typo fontWeight='700' color={colors.black}>Kaydet</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default ProfileModal

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
    avatarContainer: {
        position: 'relative',
        alignSelf: 'center'
    },
    avatar: {
      alignSelf: 'center',
      width: verticalScale(135),
      height: verticalScale(135),
      backgroundColor: colors.neutral300,
      borderRadius: 200,
      borderWidth: 1,
      borderColor: colors.neutral500  
    },
    editIcon: {
        position: 'absolute',
        bottom: spacingY._5,
        right: spacingY._5,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: {
          width: 0,
          height: 0
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._7
    },
    inputContainer: {
        gap: spacingY._10
    }
})