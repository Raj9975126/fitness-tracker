import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../constants/theme';

const formatCountdown = (totalSeconds) => {
    const clamped = Math.max(0, totalSeconds);
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function RestTimerBar({
    secondsLeft,
    totalSeconds,
    isRunning,
    onAdjust,
    onTogglePause,
    onSkip,
}) {
    const progress =
        totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
    const isDone = secondsLeft === 0;

    return (
        <View style={[styles.container, isDone && styles.containerDone]}>
            <View style={styles.topRow}>
                <View style={styles.timerLeft}>
                    <Ionicons
                        name={isDone ? 'checkmark-circle' : 'timer-outline'}
                        size={20}
                        color={isDone ? colors.success : colors.primary}
                    />
                    <View>
                        <Text style={styles.label}>
                            {isDone ? 'Rest complete' : 'Rest Timer'}
                        </Text>
                        <Text style={styles.timeText}>{formatCountdown(secondsLeft)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <Pressable
                        onPress={() => onAdjust(-15)}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.controlPill, pressed && { opacity: 0.7 }]}
                    >
                        <Text style={styles.controlText}>-15s</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => onAdjust(15)}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.controlPill, pressed && { opacity: 0.7 }]}
                    >
                        <Text style={styles.controlText}>+15s</Text>
                    </Pressable>

                    {!isDone ? (
                        <Pressable
                            onPress={onTogglePause}
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                        >
                            <Ionicons
                                name={isRunning ? 'pause' : 'play'}
                                size={16}
                                color={colors.text}
                            />
                        </Pressable>
                    ) : null}

                    <Pressable
                        onPress={onSkip}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.skipPill, pressed && { opacity: 0.7 }]}
                    >
                        <Text style={styles.skipText}>{isDone ? 'Done' : 'Skip'}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        { width: `${Math.round(progress * 100)}%` },
                        isDone && styles.fillDone,
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    containerDone: {
        backgroundColor: '#F0FDF4',
        borderColor: colors.success,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    timerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
    timeText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    controlPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: radius.sm,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    controlText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    iconBtn: {
        width: 30,
        height: 30,
        borderRadius: radius.sm,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipPill: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 6,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    skipText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textInverse,
    },
    track: {
        height: 5,
        borderRadius: radius.pill,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    fillDone: {
        backgroundColor: colors.success,
    },
});

