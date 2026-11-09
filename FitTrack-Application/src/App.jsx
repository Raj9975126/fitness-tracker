import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Button } from 'react-native';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './src/store';
import { checkAuth, loginUser, logoutUser } from './src/store/slices/authSlice';

const MainNavigator = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading, user, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Initializing FitTrack...</Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.title}>FitTrack Login</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
                <Button
                    title="Sign In with Demo Account"
                    onPress={() => dispatch(loginUser({ email: 'user@fittrack.com', password: 'password123' }))}
                />
            </View>
        );
    }

    return (
        <View style={styles.centerContainer}>
            <Text style={styles.title}>Welcome back, {user?.name || user?.email}!</Text>
            <Text style={styles.subtitle}>You are securely authenticated.</Text>
            <Button title="Logout" color="#FF3B30" onPress={() => dispatch(logoutUser())} />
        </View>
    );
};

export default function App() {
    return (
        <Provider store={store}>
            <MainNavigator />
        </Provider>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#8E8E93',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#636366',
        marginBottom: 20,
    },
    errorText: {
        color: '#FF3B30',
        marginBottom: 12,
        textAlign: 'center',
    },
});
