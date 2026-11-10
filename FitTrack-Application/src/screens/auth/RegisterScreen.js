import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { authStyles as styles } from './LoginScreen';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenContainer style={styles.center}>
      <Text style={styles.title}>Create account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Sign up" onPress={() => signUp({ name, email, password })} />
      <Button title="I already have an account" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
