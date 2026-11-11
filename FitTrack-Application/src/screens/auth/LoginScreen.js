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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) return setError('Please enter your email and password');
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setLoading(false); // on success this screen unmounts, so only reset on failure
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={authStyles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={authStyles.title}>FitTrack</Text>
        <Text style={authStyles.subtitle}>Log in to continue your training</Text>
        <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        <Button title="Log in" onPress={onSubmit} loading={loading} />
        <Button title="Create an account" variant="secondary" onPress={() => navigation.navigate(ROUTES.REGISTER)} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export const authStyles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  error: { color: colors.error, textAlign: 'center', marginTop: spacing.xs },
});
