import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { Goal } from '@/types/goals'
import { useEffect, useState } from 'react'
import {
    Button,
    Input,
    Label,
    Sheet,
    Slider,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui'

type SelectedGoal = {
    id: string;
    goal_id: string;
    user_id: string;
    child_id: string;
    goals_plan: Goal;
    created_at: string;
    child_name?: string;
    timeframe?: string;
    target_date?: string;
    priority?: 'low' | 'medium' | 'high';
    reminders?: boolean;
    notes?: string;
    child?: Child;
    points?: number;
};

type Child = {
    id: string;
    name: string;
    age: number;
};

type GoalPointsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    goal: SelectedGoal | null //s
    maxPoints?: number
}

export function GoalPointsModal({
    open,
    onOpenChange,
    goal,
    maxPoints = 100
}: GoalPointsModalProps) {
    const { colors } = useTheme()

    const [points, setPoints] = useState(0)
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Fetch latest progress from Supabase when modal opens
    useEffect(() => {
        const fetchProgress = async () => {
            if (!goal?.id) return
            const { data, error } = await supabase
                .from('selected_goals')
                .select('progress, notes')
                .eq('id', goal.id)
                .single()

            if (!error && data) {
                setPoints(data.progress || 0)
                setNotes(data.notes || '')
            } else {
                console.error('Error fetching progress:', error)
            }
        }

        if (open) {
            fetchProgress()
        }
    }, [open, goal?.id])

    const handleSave = async () => {
        if (!goal) return

        setIsLoading(true)

        const { error, data } = await supabase
            .from('selected_goals')
            .update({ progress: points, notes })
            .eq('id', goal.id)
            .select()

        setIsLoading(false)

        if (error) {
            console.error('❌ Supabase update error:', error)
        } else {
            console.log('✅ Progress updated:', data)
            onOpenChange(false)
            setPoints(0)
            setNotes('')
        }
    }


    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[75]}
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
                backgroundColor="transparent"
            />
            <Sheet.Handle backgroundColor="$border" />

            <Sheet.Frame
                padding="$5"
                space="$4"
                backgroundColor="$background"
                borderTopLeftRadius="$6"
                borderTopRightRadius="$6"
            >
                <YStack space="$4">
                    <Text fontSize="$7" fontWeight="700" textAlign="center" color="$color">
                        🎯 Goal Progress
                    </Text>

                    {goal && (
                        <>
                            {/* Slider for Points */}
                            <YStack space="$2" marginTop="$2">
                                <Label color="$color">Assign Points</Label>
                                <Slider
                                    value={[points]}
                                    max={maxPoints}
                                    step={1}
                                    onValueChange={([val]) => setPoints(val)}
                                >
                                    <Slider.Track height={4} backgroundColor={colors.border as any} borderRadius={999}>
                                        <Slider.TrackActive backgroundColor={colors.secondary as any} />
                                    </Slider.Track>
                                    <Slider.Thumb index={0} circular size="$3" backgroundColor={colors.primary as any} />
                                </Slider>
                                <Text fontSize="$4" fontWeight="bold"
                                    marginTop="$6" color={colors.text as any}
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    borderRadius="$4"
                                    width="100"
                                    padding="$3"
                                >
                                    {points} / {maxPoints} Points
                                </Text>
                            </YStack>

                            {/* Notes Input */}
                            <YStack space="$2" marginTop="$3">
                                <Label color="$color">Notes (Optional)</Label>
                                <Input
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Describe the child's performance"
                                    multiline
                                    numberOfLines={4}
                                    backgroundColor={colors.background as any}
                                    borderColor={colors.border as any}
                                    borderWidth={1}
                                    borderRadius="$4"
                                    padding="$3"
                                    color={colors.text as any}
                                />
                            </YStack>

                            {/* Progress Preview */}
                            <YStack space="$1" marginTop="$3">
                                <Label color="$color">Progress Bar</Label>
                                <View
                                    height={10}
                                    backgroundColor="$gray4"
                                    borderRadius={999}
                                    overflow="hidden"
                                >
                                    <View
                                        width={`${(points / maxPoints) * 100}%`}
                                        height="100%"
                                        backgroundColor="$green10"
                                    />
                                </View>
                            </YStack>

                            {/* Action Buttons */}
                            <XStack space="$3" justifyContent="flex-end" marginTop="$5" marginBottom="$6">
                                <Button
                                    onPress={() => onOpenChange(false)}
                                    backgroundColor={colors.error as any}
                                    color={colors.onPrimary as any}
                                    borderRadius="$10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onPress={handleSave}
                                    disabled={isLoading}
                                    backgroundColor="$green10"
                                    color="white"
                                    borderRadius="$10"
                                >
                                    {isLoading ? <Spinner color="white" /> : 'Save Progress'}
                                </Button>
                            </XStack>
                        </>
                    )}
                </YStack>
            </Sheet.Frame>
        </Sheet>
    )
}
