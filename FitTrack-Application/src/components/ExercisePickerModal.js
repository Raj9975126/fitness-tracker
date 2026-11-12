import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import Chip from './Chip';
import Input from './Input';
import { fetchExercises } from '../services/exercises';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatEnum } from '../utils/format';

const MUSCLE_FILTERS = [
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'CORE',
    'QUADS',
    'HAMSTRINGS',
    'GLUTES',
];

export default function ExercisePickerModal({
    visible,
    selectedExerciseIds,
    onClose,
    onSelectExercise,
}) {
    const [search, setSearch] = useState('');
    const [muscle, setMuscle] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadExercises = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { items } = await fetchExercises({
                search: search.trim() || undefined,
                muscle: muscle || undefined,
                limit: 50,
            });
            setExercises(items);
        } catch (err) {
            setError(err.message || 'Could not load exercises');
        } finally {
            setLoading(false);
        }
    }, [search, muscle]);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            loadExercises();
        }, 250);
        return () => clearTimeout(timer);
    }, [visible, loadExercises]);

    const handleClose = () => {
        setSearch('');
        setMuscle(null);
        setError(null);
        onClose();
    };

    const selectedSet = new Set(selectedExerciseIds || []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add Exercise</Text>
                    <Pressable onPress={handleClose} accessibilityRole="button">
                        <Ionicons name="close" size={24} color={colors.text} />
                    </Pressable>
                </View>

                <View style={styles.controls}>
                    <Input
                        placeholder="Search exercises..."
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                        containerStyle={styles.searchInput}
                    />

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                    >
                        <Chip
                            label="All"
                            selected={muscle === null}
                            onPress={() => setMuscle(null)}
                        />
                        {MUSCLE_FILTERS.map((group) => (
                            <Chip
                                key={group}
                                label={formatEnum(group)}
                                selected={muscle === group}
                                onPress={() => setMuscle(muscle === group ? null : group)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <ActivityIndicator style={styles.stateBox} color={colors.primary} />
                ) : error ? (
                    <View style={styles.stateBox}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button
                            title="Retry"
                            variant="outline"
                            size="sm"
                            onPress={loadExercises}
                        />
                    </View>
                ) : (
                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.stateBox}>
                                <Text style={styles.emptyText}>
                                    No exercises found. Add exercises in the Exercises tab or seed the database.
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const alreadyAdded = selectedSet.has(item.id);

                            return (
                                <Pressable
                                    disabled={alreadyAdded}
                                    onPress={() => {
                                        onSelectExercise(item);
                                        handleClose();
                                    }}
                                    style={({ pressed }) => [
                                        styles.itemRow,
                                        alreadyAdded && styles.itemDisabled,
                                        pressed && !alreadyAdded && { opacity: 0.75 },
                                    ]}
                                >
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemMeta}>
                                            {[formatEnum(item.primaryMuscle), formatEnum(item.equipment)]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </Text>
                                    </View>
                                    <Text style={styles.actionText}>
                                        {alreadyAdded ? 'Added' : 'Add'}
                                    </Text>
                                </Pressable>
                            );
                        }}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h3,
    },
    controls: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    searchInput: {
        marginBottom: spacing.xs,
    },
    chipRow: {
        paddingBottom: spacing.sm,
    },
    list: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.card,
    },
    itemDisabled: {
        opacity: 0.5,
        backgroundColor: colors.surface,
    },
    itemInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    itemMeta: {
        ...typography.caption,
        marginTop: 2,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    stateBox: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.caption,
        textAlign: 'center',
    },
});

