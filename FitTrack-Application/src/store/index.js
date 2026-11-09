import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { clearAuth } from './slices/authSlice';
import { setUnauthorizedHandler } from '../api/client';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

setUnauthorizedHandler(() => {
    store.dispatch(clearAuth());
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
