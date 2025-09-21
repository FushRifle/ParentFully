import { useNotificationCount } from '@/hooks/notification/useNotificationCount'
import { useTheme } from '@/styles/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from 'tamagui'

export function NotificationBell() {
    const { count } = useNotificationCount()
    const { colors } = useTheme()
    const navigation = useNavigation()

    return (
        <Button
            unstyled
            onPress={() => navigation.navigate('Notifications' as never)}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
            >
                <MaterialCommunityIcons name="bell" size={24} color='white' />

                {count > 0 && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            minWidth: 18,
                            height: 20,
                            borderRadius: 9,
                            backgroundColor: colors.primaryDark,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 4,
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                            {count > 99 ? '99+' : count}
                        </Text>
                    </View>
                )}
            </View>
        </Button>
    )
}
