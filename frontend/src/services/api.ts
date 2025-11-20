import axios from 'axios';
import { LoginResponse, User, Restaurant, Order, Payment, MenuItem, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests with debugging
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    console.log('🔍 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔍 Token being sent:', token ? 'Yes' : 'No');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle responses with debugging
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);

        if (error.response?.status === 401) {
            console.log('🔍 Token expired or invalid, logging out...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);



// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
};

export const restaurantsAPI = {
    getAll: async (): Promise<Restaurant[]> => {
        const response = await api.get('/restaurants');
        return response.data;
    },

    getById: async (id: string): Promise<Restaurant> => {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    },

    create: async (data: Partial<Restaurant>): Promise<Restaurant> => {
        const response = await api.post('/restaurants', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
        const response = await api.patch(`/restaurants/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/restaurants/${id}`);
    },
};

export const ordersAPI = {
    getAll: async (): Promise<Order[]> => {
        const response = await api.get('/orders');
        return response.data;
    },

    getById: async (id: string): Promise<Order> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    create: async (items: { menuItemId: string; quantity: number }[]): Promise<Order> => {
        const response = await api.post('/orders', { items });
        return response.data;
    },

    cancel: async (id: string): Promise<Order> => {
        const response = await api.patch(`/orders/${id}/cancel`);
        return response.data;
    },
};

export const paymentsAPI = {
    getAll: async (): Promise<Payment[]> => {
        const response = await api.get('/payments');
        return response.data;
    },

    create: async (data: Partial<Payment>): Promise<Payment> => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Payment>): Promise<Payment> => {
        const response = await api.patch(`/payments/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/payments/${id}`);
    },

    setDefault: async (id: string): Promise<Payment> => {
        const response = await api.patch(`/payments/${id}/set-default`);
        return response.data;
    },
};

export default api;