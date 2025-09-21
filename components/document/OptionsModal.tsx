import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Adapt, Button, Dialog, Sheet, Spinner, Text, XStack, YStack } from 'tamagui';

type FileOptionsSheetProps = {
    onPreview: () => void;
    onDownload: () => Promise<void>;
    onDelete: () => void;
    onShare: () => Promise<void>;
};

export const useFileOptionsSheet = ({
    onPreview,
    onDownload,
    onDelete,
    onShare,
}: FileOptionsSheetProps) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [action, setAction] = React.useState<'download' | 'share' | null>(null);

    const openOptionsSheet = () => setOpen(true);
    const closeOptionsSheet = () => setOpen(false);

    const handleAction = async (actionType: 'download' | 'share') => {
        try {
            setLoading(true);
            setAction(actionType);

            if (actionType === 'download') {
                await onDownload();
            } else {
                await onShare();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setAction(null);
            closeOptionsSheet();
        }
    };

    const OptionsSheet = () => (
        <Dialog modal open={open} onOpenChange={setOpen}>
            <Adapt when="sm" platform="touch">
                <Sheet animation="medium" zIndex={200000}
                    snapPoints={[25]}
                    modal dismissOnSnapToBottom>
                    <Sheet.Frame padding="$4" space>
                        <Adapt.Contents />
                    </Sheet.Frame>
                    <Sheet.Overlay
                        animation="lazy"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                </Sheet>
            </Adapt>

            <Dialog.Portal>
                <Dialog.Content
                    bordered
                    elevate
                    key="content"
                    animateOnly={['transform', 'opacity']}
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                    exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                    space
                    width="90%"
                >
                    <YStack space="$3">
                        <Text>File Options</Text>

                        {loading ? (
                            <YStack alignItems="center" padding="$4" space="$2">
                                <Spinner size="large" />
                                <Text>
                                    {action === 'download' ? 'Downloading...' : 'Sharing...'}
                                </Text>
                            </YStack>
                        ) : (
                            <>
                                <XStack space="$2" justifyContent="center" mb="$3">
                                    <Button
                                        icon={<MaterialIcons name="visibility" size={20} />}
                                        onPress={() => {
                                            onPreview();
                                            closeOptionsSheet();
                                        }}
                                        theme="blue"
                                        flex={1}
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        icon={<MaterialIcons name="file-download" size={20} />}
                                        onPress={() => handleAction('download')}
                                        theme="green"
                                        flex={1}
                                    >
                                        Download
                                    </Button>
                                </XStack>

                                <XStack space="$2" justifyContent="center">
                                    <Button
                                        icon={<MaterialIcons name="share" size={20} />}
                                        onPress={() => handleAction('share')}
                                        theme="purple"
                                        flex={1}
                                    >
                                        Share
                                    </Button>
                                    <Button
                                        icon={<MaterialIcons name="delete" size={20} />}
                                        onPress={() => {
                                            onDelete();
                                            closeOptionsSheet();
                                        }}
                                        theme="red"
                                        flex={1}
                                    >
                                        Delete
                                    </Button>
                                </XStack>
                            </>
                        )}

                        <Dialog.Close asChild>
                            <Button
                                position="absolute"
                                top="$3"
                                right="$3"
                                size="$2"
                                circular
                                icon={<MaterialIcons name="close" size={16} />}
                            />
                        </Dialog.Close>
                    </YStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );

    return {
        openOptionsSheet,
        closeOptionsSheet,
        OptionsSheet,
    };
};