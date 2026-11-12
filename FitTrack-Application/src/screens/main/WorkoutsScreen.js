import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ExercisePickerModal from '../../components/ExercisePickerModal';
import ScreenContainer from '../../components/ScreenContainer';
import WorkoutExerciseCard from '../../components/WorkoutExerciseCard';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
    getSessionDetails,
    saveSessionSets,
    startWorkoutSession,
} from '../../services/workoutService';

const DEFAULT_STARTER_SETS = 3;

const createEmptySetRow = (setNumber) => ({
    id: null,
    setNumber,
    weight: '',
    reps: '',
    isCompleted: true,
});

const buildExerciseEntriesFromSession = (sessionData) => {
    if (!sessionData) return [];

    const entryMap = new Map();

    const routineExercises = sessionData.routine?.routineExercises || [];
    for (const routineItem of routineExercises) {
        const count = routineItem.targetSets || DEFAULT_STARTER_SETS;
        entryMap.set(routineItem.exerciseId, {
            exerciseId: routineItem.exerciseId,
            exercise: routineItem.exercise || { id: routineItem.exerciseId, name: 'Exercise' },
            targetSets: routineItem.targetSets || null,
            targetReps: routineItem.targetReps || null,
            sets: Array.from({ length: count }, (_, index) => createEmptySetRow(index + 1)),
        });
    }

    const setLogs = sessionData.setLogs || [];
    const loggedByExercise = new Map();

    for (const log of setLogs) {
        if (!loggedByExercise.has(log.exerciseId)) {
            loggedByExercise.set(log.exerciseId, {
                exercise: log.exercise,
                logs: [],
            });
        }
        loggedByExercise.get(log.exerciseId).logs.push(log);
    }

    for (const [exerciseId, group] of loggedByExercise.entries()) {
        const sortedLogs = [...group.logs].sort((a, b) => a.setNumber - b.setNumber);
        const mappedLogs = sortedLogs.map((log) => ({
            id: log.id,
            setNumber: log.setNumber,
            weight: String(log.weight ?? ''),
            reps: String(log.reps ?? ''),
            isCompleted: log.isCompleted ?? true,
        }));

        if (entryMap.has(exerciseId)) {
            const existing = entryMap.get(exerciseId);
            const targetCount = existing.targetSets || DEFAULT_STARTER_SETS;
            const mergedSets = [...mappedLogs];

            while (mergedSets.length < targetCount) {
                mergedSets.push(createEmptySetRow(mergedSets.length + 1));
            }

            existing.sets = mergedSets;
        } else {
            entryMap.set(exerciseId, {
                exerciseId,
                exercise: group.exercise || { id: exerciseId, name: 'Exercise' },
                targetSets: null,
                targetReps: null,
                sets: mappedLogs,
            });
        }
    }

    return Array.from(entryMap.values());
};

export default function WorkoutsScreen({ route }) {
    const { user } = useAuth();
    const incomingSession = route?.params?.session ?? null;

    const [session, setSession] = useState(incomingSession);
    const [exerciseEntries, setExerciseEntries] = useState(() =>
        buildExerciseEntriesFromSession(incomingSession)
    );
    const [loadingSession, setLoadingSession] = useState(false);
    const [startingWorkout, setStartingWorkout] = useState(false);
    const [savingSets, setSavingSets] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    const hydrateSession = useCallback(async (targetSession) => {
        setSession(targetSession);
        setExerciseEntries(buildExerciseEntriesFromSession(targetSession));
        setError(null);
        setStatusMessage(null);

        if (!targetSession?.id || String(targetSession.id).startsWith('local-')) {
            return;
        }

        setLoadingSession(true);
        try {
            const fullSession = await getSessionDetails(targetSession.id);
            setSession(fullSession);
            setExerciseEntries(buildExerciseEntriesFromSession(fullSession));
        } catch (_err) {
            setError('Showing cached workout data — backend unavailable.');
        } finally {
            setLoadingSession(false);
        }
    }, []);

    useEffect(() => {
        if (incomingSession && incomingSession.id !== session?.id) {
            hydrateSession(incomingSession);
        }
    }, [incomingSession, session?.id, hydrateSession]);

    const handleStartFreestyle = async () => {
        setStartingWorkout(true);
        setError(null);
        try {
            const created = await startWorkoutSession({
                userId: user?.id || 'demo-user-id',
                name: 'Freestyle Workout',
            });
            await hydrateSession(created);
        } catch (_err) {
            const draft = {
                id: `local-${Date.now()}`,
                userId: user?.id || 'demo-user-id',
                routineId: null,
                name: 'Freestyle Workout',
                startTime: new Date().toISOString(),
                status: 'IN_PROGRESS',
                totalVolumeKg: 0,
                setLogs: [],
            };
            await hydrateSession(draft);
            setError('Started offline draft — connect to backend to sync sets.');
        } finally {
            setStartingWorkout(false);
        }
    };

    const handleSelectExercise = (exercise) => {
        setStatusMessage(null);
        setError(null);
        setExerciseEntries((prev) => {
            if (prev.some((item) => item.exerciseId === exercise.id)) {
                return prev;
            }
            return [
                ...prev,
                {
                    exerciseId: exercise.id,
                    exercise,
                    targetSets: null,
                    targetReps: null,
                    sets: Array.from({ length: DEFAULT_STARTER_SETS }, (_, index) =>
                        createEmptySetRow(index + 1)
                    ),
                },
            ];
        });
    };

    const handleRemoveExercise = (exerciseId) => {
        setStatusMessage(null);
        setExerciseEntries((prev) => prev.filter((item) => item.exerciseId !== exerciseId));
    };

    const handleChangeSetField = (exerciseId, setNumber, field, value) => {
        setStatusMessage(null);
        setExerciseEntries((prev) =>
            prev.map((entry) => {
                if (entry.exerciseId !== exerciseId) return entry;
                return {
                    ...entry,
                    sets: entry.sets.map((row) =>
                        row.setNumber === setNumber ? { ...row, [field]: value } : row
                    ),
                };
            })
        );
    };

    const totals = useMemo(() => {
        let totalSets = 0;
        let volumeKg = 0;

        for (const entry of exerciseEntries) {
            for (const row of entry.sets) {
                const hasValues = row.weight.trim() !== '' || row.reps.trim() !== '' || row.id;
                if (!hasValues) continue;
                totalSets += 1;
                const w = Number(row.weight.replace(',', '.'));
                const r = Number(row.reps);
                if (Number.isFinite(w) && Number.isFinite(r) && w >= 0 && r >= 0) {
                    volumeKg += w * r;
                }
            }
        }

        return {
            exercisesCount: exerciseEntries.length,
            totalSets,
            volumeKg: Math.round(volumeKg * 100) / 100,
        };
    }, [exerciseEntries]);

    const handleSaveSets = async () => {
        if (!session) return;
        setError(null);
        setStatusMessage(null);

        const payload = [];
        for (const entry of exerciseEntries) {
            for (const row of entry.sets) {
                const weightText = row.weight.trim();
                const repsText = row.reps.trim();
                const isBlank = weightText === '' && repsText === '' && !row.id;
                if (isBlank) continue;

                const weight = weightText === '' ? 0 : Number(weightText.replace(',', '.'));
                const reps = repsText === '' ? 0 : Number(repsText);

                if (!Number.isFinite(weight) || weight < 0) {
                    setError(`${entry.exercise?.name || 'Exercise'} Set ${row.setNumber}: enter a valid weight.`);
                    return;
                }

                if (!Number.isInteger(reps) || reps < 0) {
                    setError(`${entry.exercise?.name || 'Exercise'} Set ${row.setNumber}: reps must be a whole number.`);
                    return;
                }

                payload.push({
                    ...(row.id ? { id: row.id } : {}),
                    exerciseId: entry.exerciseId,
                    setNumber: row.setNumber,
                    weight,
                    reps,
                    isCompleted: row.isCompleted ?? true,
                });
            }
        }

        if (payload.length === 0) {
            setError('Enter weight or reps for at least one set before saving.');
            return;
        }

        if (String(session.id).startsWith('local-')) {
            setSession((prev) => ({ ...prev, totalVolumeKg: totals.volumeKg }));
            setStatusMessage('Saved locally (offline draft).');
            return;
        }

        setSavingSets(true);
        try {
            const saved = await saveSessionSets(session.id, payload, false);
            setSession((prev) => ({
                ...prev,
                totalVolumeKg: saved.totalVolumeKg,
                setLogs: saved.setLogs,
            }));

            const returnedByKey = new Map(
                (saved.setLogs || []).map((item) => [`${item.exerciseId}:${item.setNumber}`, item])
            );

            setExerciseEntries((prev) =>
                prev.map((entry) => ({
                    ...entry,
                    sets: entry.sets.map((row) => {
                        const match = returnedByKey.get(`${entry.exerciseId}:${row.setNumber}`);
                        if (!match) return row;
                        return {
                            ...row,
                            id: match.id,
                            weight: String(match.weight),
                            reps: String(match.reps),
                            isCompleted: match.isCompleted,
                        };
                    }),
                }))
            );

            setStatusMessage(`Saved ${saved.setLogs?.length || payload.length} sets.`);
        } catch (err) {
            setError(err.message || 'Failed to save sets');
        } finally {
            setSavingSets(false);
        }
    };

    if (!session) {
        return (
            <ScreenContainer>
                <View style={styles.emptyWrapper}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="barbell-outline" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Active Workout Logger</Text>
                    <Text style={styles.emptySubtitle}>
                        Start a freestyle workout here or pick a saved routine from the Home tab.
                    </Text>
                    <Button
                        title="Start Empty Workout"
                        onPress={handleStartFreestyle}
                        loading={startingWorkout}
                        style={styles.emptyButton}
                    />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerCard}>
                        <View style={styles.headerTop}>
                            <View style={styles.headerTitleWrap}>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        {session.status === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}
                                    </Text>
                                </View>
                                <Text style={styles.workoutTitle}>{session.name}</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.exercisesCount}</Text>
                                <Text style={styles.statLabel}>Exercises</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.totalSets}</Text>
                                <Text style={styles.statLabel}>Logged Sets</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.volumeKg} kg</Text>
                                <Text style={styles.statLabel}>Volume</Text>
                            </View>
                        </View>
                    </View>

                    {loadingSession ? (
                        <ActivityIndicator style={styles.loader} color={colors.primary} />
                    ) : null}

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {statusMessage ? (
                        <View style={styles.successBanner}>
                            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                            <Text style={styles.successText}>{statusMessage}</Text>
                        </View>
                    ) : null}

                    {exerciseEntries.length === 0 ? (
                        <Card style={styles.promptCard}>
                            <Text style={styles.promptTitle}>No exercises added yet</Text>
                            <Text style={styles.promptSubtitle}>
                                Add exercises from the library to start logging sets and reps.
                            </Text>
                            <Button
                                title="+ Add Exercise"
                                variant="outline"
                                onPress={() => setPickerVisible(true)}
                            />
                        </Card>
                    ) : (
                        exerciseEntries.map((entry) => (
                            <WorkoutExerciseCard
                                key={entry.exerciseId}
                                entry={entry}
                                onChangeSetField={handleChangeSetField}
                                onRemoveExercise={handleRemoveExercise}
                            />
                        ))
                    )}

                    <View style={styles.actions}>
                        {exerciseEntries.length > 0 ? (
                            <Button
                                title="+ Add Exercise"
                                variant="outline"
                                onPress={() => setPickerVisible(true)}
                            />
                        ) : null}

                        {exerciseEntries.length > 0 ? (
                            <Button
                                title="Save Logged Sets"
                                onPress={handleSaveSets}
                                loading={savingSets}
                            />
                        ) : null}
                    </View>
                </ScrollView>

                <ExercisePickerModal
                    visible={pickerVisible}
                    selectedExerciseIds={exerciseEntries.map((item) => item.exerciseId)}
                    onClose={() => setPickerVisible(false)}
                    onSelectExercise={handleSelectExercise}
                />
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    emptyTitle: {
        ...typography.h2,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...typography.caption,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    emptyButton: {
        width: '100%',
    },
    headerCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitleWrap: {
        flex: 1,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
        marginBottom: spacing.xs,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primaryDark,
        letterSpacing: 0.4,
    },
    workoutTitle: {
        ...typography.h2,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        ...typography.caption,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: colors.border,
    },
    loader: {
        marginBottom: spacing.md,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: colors.error,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    successText: {
        flex: 1,
        fontSize: 13,
        color: colors.success,
        fontWeight: '500',
    },
    promptCard: {
        alignItems: 'center',
    },
    promptTitle: {
        ...typography.h3,
        marginBottom: spacing.xs,
    },
    promptSubtitle: {
        ...typography.caption,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    actions: {
        marginTop: spacing.xs,
    },
});
