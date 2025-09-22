import { useTheme } from '@/styles/ThemeContext'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Button, Input, XStack, YStack } from 'tamagui'

type SearchProps = {
    value: string
    onChange: (text: string) => void
    placeholder?: string
    onClear?: () => void
}

const Search = ({ value, onChange, placeholder = 'Search...', onClear }: SearchProps) => {
    const { colors } = useTheme();

    return (
        <YStack width="100%" paddingHorizontal="$2">
            <XStack
                width="100%"
                flex={1}
                borderRadius="$6"
                borderWidth={1}
                borderColor={colors.primary}
                paddingHorizontal="$3"
                alignItems="center"
                space="$2"
            >
                <Feather name="search" size={18} color="#888" />

                <Input
                    flex={1}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    unstyled
                    fontSize="$4"
                    backgroundColor="transparent"
                    paddingVertical="$2"
                />

                {value.length > 0 && (
                    <Button
                        unstyled
                        onPress={onClear || (() => onChange(''))}
                        padding="$0"
                        icon={<Feather name="x" size={18} color="#888" />}
                    />
                )}
            </XStack>
        </YStack>
    )
}

export default Search
