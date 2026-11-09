import { StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>{user?.email}</Text>
      <Button title="Log out" onPress={signOut} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, marginVertical: 8 },
});
