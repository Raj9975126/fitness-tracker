import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';
import WorkoutsScreen from '../screens/main/WorkoutsScreen';
import ExercisesScreen from '../screens/main/ExercisesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { ROUTES } from '../constants/routes';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  [ROUTES.HOME]: 'home',
  [ROUTES.WORKOUTS]: 'barbell',
  [ROUTES.EXERCISES]: 'list',
  [ROUTES.PROFILE]: 'person',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.WORKOUTS} component={WorkoutsScreen} />
      <Tab.Screen name={ROUTES.EXERCISES} component={ExercisesScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
