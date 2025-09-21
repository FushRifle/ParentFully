import { useNotificationCount } from '@/hooks/notification/useNotificationCount'
import { useTheme } from '@/styles/ThemeContext'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from 'tamagui'

export function NotificationBell() {
    const count = useNotificationCount()
    const { colors } = useTheme();
    const navigation = useNavigation()

    return (
        <Button
            unstyled
            onPress={() => navigation.navigate('Notifications' as never)}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <Feather name="bell" size={24} color="#fff" />

                {typeof count === 'number' && count > 0 && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            minWidth: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: 'red',
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
