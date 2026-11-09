import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function Button({ title, onPress, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, isPrimary ? styles.primary : styles.secondary, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.text, { color: isPrimary ? '#fff' : colors.primary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.md, borderRadius: 10, alignItems: 'center', marginTop: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent' },
  text: { fontSize: 16, fontWeight: '600' },
});
