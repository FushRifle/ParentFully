import DotsIndicator from '@/components/ui/DotsIndicator'
import { useAuth } from '@/context/AuthContext'
import { copyDefaultGoalsToUser } from '@/hooks/goals/useOnSignUP'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { OnboardingSlide } from '@/types'
import { ArrowRight } from '@tamagui/lucide-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Dimensions, Image, PanResponder } from 'react-native'
import { Button, Text, XStack, YStack } from 'tamagui'


interface OnboardingScreenProps {
    onComplete?: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = 50

const SLIDES: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Your Parenting Companion',
        text: "Expert advice tailored to your child's age and needs",
        image: require('@/assets/onboarding/bro.png'),
    },
    {
        id: 2,
        title: 'Track Milestones',
        text: "Monitor your child's development with our interactive tools",
        image: require('@/assets/onboarding/amico_1.png'),
    },
    {
        id: 3,
        title: 'Get Advice From Experts.',
        text: 'Access articles and videos from pediatric specialists.',
        image: require('@/assets/onboarding/amico.png'),
    },
]

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { colors } = useTheme()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const scrollX = useRef(new Animated.Value(0)).current
    const scrollViewRef = useRef<typeof Animated.ScrollView>(null)

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index)
        const scrollView = scrollViewRef.current
        if (scrollView && typeof (scrollView as any).scrollTo === 'function') {
            (scrollView as any).scrollTo({ x: SCREEN_WIDTH * index, animated: true })
        } else if (scrollView && typeof (scrollView as any).getNode === 'function') {
            (scrollView as any).getNode().scrollTo({ x: SCREEN_WIDTH * index, animated: true })
        }
    }, [])

    const finishOnboarding = useCallback(async () => {
        try {
            setLoading(true)
            if (user?.id) {
                await supabase
                    .from('users')
                    .update({ has_completed_onboarding: true })
                    .eq('id', user.id)

                await copyDefaultGoalsToUser(user.id)
            }

            if (onComplete) onComplete()
        } catch (error) {
            console.error('Error completing onboarding:', error)
        } finally {
            setLoading(false)
        }
    }, [user, onComplete])

    const goToNext = useCallback(() => {
        const nextSlide = currentSlide + 1
        if (nextSlide < SLIDES.length) {
            goToSlide(nextSlide)
        } else {
            finishOnboarding()
        }
    }, [currentSlide, finishOnboarding])

    const goToPrev = useCallback(() => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1)
        }
    }, [currentSlide])

    const handleSkip = () => {
        setCurrentSlide(SLIDES.length - 1);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > Math.abs(dy * 3),
            onPanResponderRelease: (_, { dx }) => {
                if (dx < -SWIPE_THRESHOLD) {
                    goToNext()
                } else if (dx > SWIPE_THRESHOLD) {
                    goToPrev()
                }
            },
        })
    ).current

    const renderSlide = useCallback(
        (slide: OnboardingSlide) => (
            <YStack
                key={slide.id}
                width={SCREEN_WIDTH}
                height="100%"
                ai="center"
                jc="center"
                px="$6"
                pt="$6"
                position="relative"
            >
                {/* Skip button in top-right corner */}
                <Text
                    position="absolute"
                    top={50}
                    right={30}
                    fontSize="$6"
                    fontWeight="700"
                    color={colors.primary}
                    onPress={handleSkip}
                >
                    Skip
                </Text>

                <YStack
                    shadowColor="#000"
                    shadowOpacity={0.1}
                    shadowRadius={6}
                    elevation={5}
                    my="$6"
                    ai="center"
                >
                    <Image
                        source={slide.image}
                        style={{
                            width: 377.21,
                            height: 358.19,
                            borderRadius: 30,
                        }}
                        resizeMode="contain"
                    />
                </YStack>

                <Text
                    fontSize="$8"
                    fontWeight="700"
                    textAlign="center"
                    lineHeight={34}
                    color={colors.primaryDark}
                >
                    {slide.title}
                </Text>

                <Text
                    fontSize="$7"
                    textAlign="center"
                    lineHeight={24}
                    opacity={0.8}
                    color={colors.text}
                >
                    {slide.text}
                </Text>
            </YStack>
        ),
        [colors]
    );

    const renderSlides = useMemo(() => SLIDES.map(renderSlide), [renderSlide])

    const handleScrollEnd = useCallback((e: any) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
        setCurrentSlide(newIndex)
    }, [])

    const isLastSlide = currentSlide === SLIDES.length - 1

    return (
        <YStack f={1} bg="white">
            <Animated.ScrollView
                ref={scrollViewRef as React.RefObject<any>}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={handleScrollEnd}
                {...panResponder.panHandlers}
            >
                {renderSlides}
            </Animated.ScrollView>

            <XStack jc="space-between" ai="center" px="$6" pb="$10" width="100%">
                {/* Dots indicator on the left (hide on last slide) */}
                {!isLastSlide && (
                    <DotsIndicator
                        count={SLIDES.length}
                        activeIndex={currentSlide}
                        scrollX={scrollX}
                    />
                )}

                {/* Next arrow or Get Started button */}
                {isLastSlide ? (
                    <Button
                        bg={colors.primary}
                        color="white"
                        borderRadius='$10'
                        size='$5'
                        w='100%'
                        onPress={finishOnboarding}
                        jc="center"
                        ai="center"
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text fontWeight="700" fontSize='$5' color="white">
                                GET STARTED
                            </Text>
                        )}
                    </Button>
                ) : (
                    <Button
                        w={50}
                        h={50}
                        br={9999}
                        onPress={goToNext}
                        jc="center"
                        ai="center"
                        overflow="hidden"
                        p={0}
                    >
                        <LinearGradient
                            colors={['#13E500', '#FF8C01']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <ArrowRight size={20} color="white" />
                        </LinearGradient>
                    </Button>
                )}
            </XStack>


        </YStack>
    )
}

export default OnboardingScreen
