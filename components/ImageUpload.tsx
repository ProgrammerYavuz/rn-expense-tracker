import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ImageUploadProps } from '@/types'
import * as Icons from 'phosphor-react-native'
import { colors, radius } from '@/constants/theme'
import Typo from './Typo'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { getFilePath } from '@/services/imageService'
import * as ImagePicker from 'expo-image-picker';

/**
 * ImageUpload:
 * - Kullanıcıların cihazlarından resim seçmelerine olanak tanır.
 * - Seçilen resmi gösterir ve kullanıcıya silme imkanı sunar.
 * - Eğer resim seçilmemişse, kullanıcıdan bir resim yüklemesini ister.
 */

const ImageUpload = ({
    file = null,
    onSelect,
    onClear,
    containerStyle,
    imageStyle,
    placeholder = "",
}: ImageUploadProps) => {

    /**
     * pickImage:
     * - Kullanıcının cihaz galerisini açar ve resim seçme işlemini sunar.
     * - Seçilen resmi onSelect fonksiyonuna gönderir.
     * - Eğer seçilen resim yoksa, kullanıcıya bir resim yüklemesini ister.
     */

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Sadece resimler seçilebilir
            allowsEditing: false, // Resim düzenleme kapalı
            aspect: [4, 3], // Resim kırpma oranı
            quality: 0.5, // Resim kalitesi (%50)
        });

        if (!result.canceled) {
            onSelect(result.assets[0]);
        }
    }

    /**
     * clearImage:
     * - Seçili olan resmi kaldırır.
     * - `onClear` fonksiyonunu çağırarak dışarıya bildirir.
     */
    const clearImage = () => {
        onClear();
    }

    /**
     * JSX Render:
     * - Eğer resim yüklenmemişse, kullanıcıdan yükleme yapmasını isteyen bir buton gösterilir.
     * - Eğer resim yüklenmişse, resmi gösteren bir alan oluşturulur ve silme butonu eklenir.
     */
  return (
    <View>
        {!file && (
            <TouchableOpacity style={[styles.inputContainer, containerStyle && containerStyle]} onPress={pickImage}>
                <Icons.UploadSimple color={colors.neutral200} weight='regular' />
                {placeholder && <Typo size={15} color={colors.neutral300} fontWeight='500'>{placeholder}</Typo>}
            </TouchableOpacity>
        )}

        {file && (
            <View style={[styles.image, imageStyle && imageStyle]}>
                <Image 
                    style={{flex: 1}}
                    source={getFilePath(file)}
                    contentFit='cover'
                    transition={100}
                />
                <TouchableOpacity style={styles.deleteIcon} onPress={onClear}>
                    <Icons.XCircle size={verticalScale(24)} weight='fill' color={colors.white} />
                </TouchableOpacity>
            </View>
        )}
    </View>
  )
}

export default ImageUpload

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(54),
        backgroundColor: colors.neutral700,
        gap: 10,
        borderRadius: radius._15,
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderStyle: 'dashed'
    },
    image: {
        height: scale(150),
        width: scale(150),
        borderRadius: radius._15,
        borderCurve: 'continuous',
        overflow: 'hidden',
    },
    deleteIcon: {
        position: 'absolute',
        top: scale(6),
        right: scale(6),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10
    }
})