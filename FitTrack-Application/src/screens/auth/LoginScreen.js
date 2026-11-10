import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { colors, spacing, typography } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={authStyles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={authStyles.title}>FitTrack</Text>
        <Text style={authStyles.subtitle}>Log in to continue your training</Text>
        <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Log in" onPress={() => signIn(email, password)} />
        <Button title="Create an account" variant="secondary" onPress={() => navigation.navigate(ROUTES.REGISTER)} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export const authStyles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
});
