import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

let SecureStore = null;
try {
    SecureStore = require('expo-secure-store');
} catch (e) {}

const SECURE_STORE_TOKEN_KEY = 'fittrack_auth_token';

const initialState = {
    token: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await api.post('/auth/login', credentials, { skipAuth: true });
            if (SecureStore && data.token) {
                await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, data.token);
            }
            return data;
        } catch (err) {
            return rejectWithValue(err.message || 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            try {
                await api.post('/auth/logout');
            } catch (e) {}

            if (SecureStore) {
                await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
            }
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to logout cleanly');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            if (!SecureStore) {
                return null;
            }

            const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
            if (!token) {
                return null;
            }

            const user = await api.get('/auth/me');
            return { token, user };
        } catch (err) {
            if (SecureStore) {
                try {
                    await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
                } catch (e) {}
            }
            return rejectWithValue(err.message || 'Session expired');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearAuth: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.error = null;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = action.payload || 'Login failed';
        });

        builder.addCase(logoutUser.fulfilled, (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        });

        builder.addCase(checkAuth.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            } else {
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
            }
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.isLoading = false;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        });
    },
});

export const { setCredentials, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
