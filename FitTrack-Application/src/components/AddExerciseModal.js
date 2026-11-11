import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from './Button';
import Chip from './Chip';
import Input from './Input';
import { colors, spacing, typography } from '../constants/theme';
import { formatEnum } from '../utils/format';

const EMPTY_FORM = { name: '', category: 'STRENGTH', primaryMuscle: null, equipment: 'NONE' };

function ChipGroup({ label, values, selected, onSelect }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chipWrap}>
        {values.map((value) => (
          <Chip key={value} label={formatEnum(value)} selected={selected === value} onPress={() => onSelect(value)} />
        ))}
      </View>
    </View>
  );
}

/**
 * Form for creating a custom exercise.
 * `onSubmit(exercise)` should throw on failure; the error message is shown in the form.
 */
export default function AddExerciseModal({ visible, options, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const close = () => {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!form.name.trim()) return setError('Please enter an exercise name');
    if (!form.primaryMuscle) return setError('Please pick the main muscle worked');

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={typography.h2}>New custom exercise</Text>

            <Input
              label="Name"
              placeholder="e.g. Incline Cable Fly"
              value={form.name}
              onChangeText={update('name')}
              maxLength={80}
              containerStyle={styles.nameInput}
            />
            <ChipGroup
              label="Main muscle"
              values={options.muscleGroups}
              selected={form.primaryMuscle}
              onSelect={update('primaryMuscle')}
            />
            <ChipGroup label="Category" values={options.categories} selected={form.category} onSelect={update('category')} />
            <ChipGroup label="Equipment" values={options.equipment} selected={form.equipment} onSelect={update('equipment')} />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Save exercise" onPress={submit} loading={saving} />
            <Button title="Cancel" variant="secondary" onPress={close} disabled={saving} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  nameInput: { marginTop: spacing.md },
  group: { marginTop: spacing.sm },
  groupLabel: { ...typography.label, marginBottom: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: colors.error, marginTop: spacing.sm },
});
