import { useMilestones } from '@/hooks/milestone/useMilestones';

const MilestoneList = ({ childId }: { childId: string }) => {
    const {
        milestones,
        loading,
        error,
        markAchieved,
        deleteMilestone
    } = useMilestones(childId);

    if (loading) return <div>Loading milestones...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-4">
            {milestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{milestone.title}</h3>
                    <p className="text-sm text-gray-600">{milestone.description}</p>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">
                            {milestone.achieved
                                ? `Achieved on ${new Date(milestone.achieved_at!).toLocaleDateString()}`
                                : `Expected by ${new Date(milestone.expected_date!).toLocaleDateString()}`}
                        </span>

                        <div className="space-x-2">
                            {!milestone.achieved && (
                                <button
                                    onClick={() => markAchieved(milestone.id)}
                                    className="px-3 py-1 text-sm bg-green-500 text-white rounded"
                                >
                                    Mark Achieved
                                </button>
                            )}
                            <button
                                onClick={() => deleteMilestone(milestone.id)}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};