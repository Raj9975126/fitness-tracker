import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { colors, spacing } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenContainer style={styles.center}>
      <Text style={styles.title}>FitTrack</Text>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Log in" onPress={() => signIn(email, password)} />
      <Button title="Create an account" variant="secondary" onPress={() => navigation.navigate(ROUTES.REGISTER)} />
    </ScreenContainer>
  );
}

export const authStyles = StyleSheet.create({
  center: { justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, fontSize: 16 },
});
const styles = authStyles;
