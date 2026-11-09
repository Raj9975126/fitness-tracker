let SecureStore = null;
try {
    SecureStore = require('expo-secure-store');
} catch (e) {
    // Graceful fallback if expo-secure-store is not yet installed
}

const SECURE_STORE_TOKEN_KEY = 'fittrack_auth_token';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (handler) => {
    onUnauthorizedCallback = handler;
};

export const apiClient = async (endpoint, options = {}) => {
    const { params, skipAuth = false, headers: customHeaders, ...customConfig } = options;

    let url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth && SecureStore) {
        try {
            const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        } catch (e) {}
    }

    const config = {
        ...customConfig,
        headers,
    };

    let response;
    try {
        response = await fetch(url, config);
    } catch (error) {
        throw new ApiError(error.message || 'Network request failed', 0);
    }

    if (response.status === 401) {
        if (SecureStore) {
            try {
                await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
            } catch (e) {}
        }

        if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
        }
    }

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : null;
    } else {
        responseData = await response.text();
    }

    if (!response.ok) {
        const errorMessage =
            responseData?.message ||
            responseData?.error ||
            response.statusText ||
            `Request failed with status ${response.status}`;

        throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData?.data !== undefined ? responseData.data : responseData;
};

export const api = {
    get: (endpoint, options) =>
        apiClient(endpoint, { ...options, method: 'GET' }),

    post: (endpoint, body, options) =>
        apiClient(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    put: (endpoint, body, options) =>
        apiClient(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    patch: (endpoint, body, options) =>
        apiClient(endpoint, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    delete: (endpoint, options) =>
        apiClient(endpoint, { ...options, method: 'DELETE' }),
};
