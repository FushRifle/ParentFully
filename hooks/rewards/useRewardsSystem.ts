import { ChildPoints, Reward } from '@/types/rewards';
import { useState } from 'react';

export const useRewardsSystem = () => {
    const [rewards, setRewards] = useState<Reward[]>([
        {
            id: '1',
            name: 'Extra Screen Time',
            description: '30 minutes of additional screen time',
            pointsRequired: 50,
            isClaimed: false,
            image: '🎮'
        },
        {
            id: '2',
            name: 'Special Treat',
            description: 'Choose a favorite dessert',
            pointsRequired: 75,
            isClaimed: false,
            image: '🍰'
        },
        {
            id: '3',
            name: 'Toy Store Visit',
            description: 'Pick one small toy',
            pointsRequired: 150,
            isClaimed: false,
            image: '🧸'
        },
        {
            id: '4',
            name: 'Stay Up Late',
            description: 'Stay up 30 minutes past bedtime',
            pointsRequired: 100,
            isClaimed: false,
            image: '🌙'
        }
    ]);

    const [childPoints, setChildPoints] = useState<ChildPoints>({
        currentPoints: 120,
        totalPointsEarned: 300,
        stickers: ['⭐', '🌟', '🎉', '👍', '🏆']
    });

    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

    const claimReward = (rewardId: string) => {
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward || reward.pointsRequired > childPoints.currentPoints) return;

        setRewards(rewards.map(r =>
            r.id === rewardId ? { ...r, isClaimed: true } : r
        ));

        setChildPoints({
            ...childPoints,
            currentPoints: childPoints.currentPoints - reward.pointsRequired
        });

        // Add a celebration sticker
        const newSticker = getRandomSticker();
        setChildPoints(prev => ({
            ...prev,
            stickers: [...prev.stickers, newSticker]
        }));
    };

    const getRandomSticker = () => {
        const stickers = ['⭐', '🌟', '🎉', '👍', '🏆', '💯', '👏', '🎁', '🏅', '✨'];
        return stickers[Math.floor(Math.random() * stickers.length)];
    };

    const addPoints = (points: number) => {
        setChildPoints({
            ...childPoints,
            currentPoints: childPoints.currentPoints + points,
            totalPointsEarned: childPoints.totalPointsEarned + points
        });

        // Add a sticker for every 50 points
        if ((childPoints.currentPoints + points) % 50 === 0) {
            const newSticker = getRandomSticker();
            setChildPoints(prev => ({
                ...prev,
                stickers: [...prev.stickers, newSticker]
            }));
        }
    };

    return {
        rewards,
        childPoints,
        selectedReward,
        setSelectedReward,
        claimReward,
        addPoints
    };
};