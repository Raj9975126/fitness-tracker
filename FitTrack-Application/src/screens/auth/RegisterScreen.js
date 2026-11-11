import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { authStyles as styles } from './LoginScreen';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim()) return setError('Please enter your name and email');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError(null);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start tracking your workouts</Text>
        <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} />
        <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input label="Password" placeholder="At least 8 characters" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Sign up" onPress={onSubmit} loading={loading} />
        <Button title="I already have an account" variant="secondary" onPress={() => navigation.goBack()} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
