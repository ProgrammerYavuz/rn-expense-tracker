import { View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native';

/**
 * CustomTabs Bileşeni:
 * - React Navigation kullanılarak özelleştirilmiş bir Bottom Tab Bar oluşturuyoruz.
 * - Phosphor Icons ile her bir sekmeye özel ikonlar ekleniyor.
 */

export default function CustomTabs({ state, descriptors, navigation }: BottomTabBarProps) {

    /**
     * tabbarIcons:
     * - Her bir sekme için özel ikon bileşenleri burada tanımlanıyor.
     * - `isFocused` parametresi sekmenin seçili olup olmadığını kontrol eder.
     * - Seçili olduğunda `fill`, değilse `regular` ikon tarzı kullanılır.
     */
    const tabbarIcons: any = {
        index: (isFocused: boolean) => (
            <Icons.House
                size={verticalScale(30)}
                color={isFocused ? colors.primary : colors.neutral300}
                weight={isFocused ? 'fill' : 'regular'}
            />
        ),
        statistics: (isFocused: boolean) => (
            <Icons.ChartBar
                size={verticalScale(30)}
                color={isFocused ? colors.primary : colors.neutral300}
                weight={isFocused ? 'fill' : 'regular'}
            />
        ),
        wallet: (isFocused: boolean) => (
            <Icons.Wallet
                size={verticalScale(30)}
                color={isFocused ? colors.primary : colors.neutral300}
                weight={isFocused ? 'fill' : 'regular'}
            />
        ),
        profile: (isFocused: boolean) => (
            <Icons.User
                size={verticalScale(30)}
                color={isFocused ? colors.primary : colors.neutral300}
                weight={isFocused ? 'fill' : 'regular'}
            />
        ),
    };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {

        // Her bir sekme için `options` bilgilerini alıyoruz
        const { options } = descriptors[route.key];

        // Sekmenin adı veya tabBarLabel bilgisini belirleme
        const label: any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        // Şu anki sekmenin aktif olup olmadığını kontrol ediyoruz
        const isFocused = state.index === index;

        /**
         * onPress:
         * - Sekmeye tıklanınca çalışır.
         * - Eğer sekme zaten seçili değilse ve `defaultPrevented` false ise, `navigation.navigate()` ile sekmeye yönlendirme yapılır.
         */
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        /**
         * onLongPress:
         * - Sekmeye uzun basıldığında çalışır.
         * - `tabLongPress` event'i tetiklenir.
         */
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        /**
         * Her bir sekme elemanını `TouchableOpacity` ile oluşturuyoruz.
         * - accessibilityState: Erişilebilirlik için sekmenin seçili olup olmadığını belirtir.
         * - onPress: Tıklanınca sekmeye yönlendirir.
         * - onLongPress: Uzun basıldığında özel aksiyon yapabilir.
         */
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {
                tabbarIcons && tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    tabbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        height: Platform.OS === 'ios' ? verticalScale(73) : verticalScale(50),
        backgroundColor: colors.neutral800,
        borderTopColor: colors.neutral700,
        borderTopWidth: 1,
    },
    tabbarItem: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? spacingY._10 : spacingY._5
    }
})