import { StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';

export default function WorkoutsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Workouts</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
});
