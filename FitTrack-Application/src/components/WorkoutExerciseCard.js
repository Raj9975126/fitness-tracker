import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatEnum } from '../utils/format';

export default function WorkoutExerciseCard({
    entry,
    onChangeSetField,
    onRemoveExercise,
}) {
    const { exercise, targetSets, targetReps, sets } = entry;
    const detailParts = [
        exercise?.primaryMuscle ? formatEnum(exercise.primaryMuscle) : null,
        exercise?.equipment && exercise.equipment !== 'NONE'
            ? formatEnum(exercise.equipment)
            : null,
    ].filter(Boolean);

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{exercise?.name || 'Exercise'}</Text>
                    <View style={styles.metaRow}>
                        {detailParts.length > 0 && (
                            <Text style={styles.subtitle}>{detailParts.join(' · ')}</Text>
                        )}
                        {targetSets ? (
                            <View style={styles.targetPill}>
                                <Text style={styles.targetText}>
                                    Target: {targetSets} × {targetReps || '8-12'}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {onRemoveExercise ? (
                    <Pressable
                        onPress={() => onRemoveExercise(entry.exerciseId)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove exercise"
                        style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
                    >
                        <Ionicons name="close" size={18} color={colors.textMuted} />
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, styles.setCol]}>SET</Text>
                <Text style={[styles.colHeader, styles.inputCol]}>KG</Text>
                <Text style={[styles.colHeader, styles.inputCol]}>REPS</Text>
                <Text style={[styles.colHeader, styles.statusCol]}>LOG</Text>
            </View>

            {sets.map((setRow) => {
                const isSaved = Boolean(setRow.id);

                return (
                    <View
                        key={`${entry.exerciseId}-${setRow.setNumber}`}
                        style={[styles.setRow, isSaved && styles.setRowSaved]}
                    >
                        <View style={styles.setCol}>
                            <View style={styles.setBadge}>
                                <Text style={styles.setNumber}>{setRow.setNumber}</Text>
                            </View>
                        </View>

                        <View style={styles.inputCol}>
                            <TextInput
                                style={styles.numberInput}
                                value={setRow.weight}
                                onChangeText={(value) =>
                                    onChangeSetField(entry.exerciseId, setRow.setNumber, 'weight', value)
                                }
                                placeholder="0"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                                selectTextOnFocus
                            />
                        </View>

                        <View style={styles.inputCol}>
                            <TextInput
                                style={styles.numberInput}
                                value={setRow.reps}
                                onChangeText={(value) =>
                                    onChangeSetField(entry.exerciseId, setRow.setNumber, 'reps', value)
                                }
                                placeholder="0"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="number-pad"
                                selectTextOnFocus
                            />
                        </View>

                        <View style={styles.statusCol}>
                            <Ionicons
                                name={isSaved ? 'checkmark-circle' : 'ellipse-outline'}
                                size={20}
                                color={isSaved ? colors.success : colors.border}
                            />
                        </View>
                    </View>
                );
            })}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    headerInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    title: {
        ...typography.h3,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: 4,
    },
    subtitle: {
        ...typography.caption,
    },
    targetPill: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    targetText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primaryDark,
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.xs,
    },
    colHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.sm,
    },
    setRowSaved: {
        backgroundColor: '#F0FDF4',
    },
    setCol: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setBadge: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setNumber: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
    },
    inputCol: {
        flex: 1,
        paddingHorizontal: spacing.xs,
    },
    numberInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        backgroundColor: colors.background,
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.sm,
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    statusCol: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

