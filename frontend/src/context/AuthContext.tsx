'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔄 AuthProvider mounted - checking localStorage');
        checkStoredAuth();
    }, []);

    const checkStoredAuth = () => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        console.log('📦 Stored token:', token ? 'YES' : 'NO');
        console.log('📦 Stored user:', userData ? 'YES' : 'NO');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('✅ Restoring user from localStorage:', parsedUser.email);
                setUser(parsedUser);
            } catch (error) {
                console.error('❌ Error parsing stored user:', error);
                clearStoredAuth();
            }
        }
        setLoading(false);
    };

    const clearStoredAuth = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const login = async (email: string, password: string) => {
        console.log('🔐 Login attempt for:', email);

        try {
            setLoading(true);

            console.log('📤 Sending login request to backend...');
            const response: LoginResponse = await authAPI.login(email, password);
            console.log('✅ Login response received:', response);

            // Store auth data
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));

            console.log('💾 Auth data stored in localStorage');
            console.log('👤 User to set:', response.user);

            // Update state
            setUser(response.user);

            console.log('✅ Login completed successfully!');

        } catch (error: any) {
            console.error('❌ Login failed:', error);

            if (error.response) {
                console.error('📡 Backend response:', error.response.data);
                console.error('📡 Status code:', error.response.status);
            } else if (error.request) {
                console.error('📡 No response received:', error.request);
            } else {
                console.error('📡 Request setup error:', error.message);
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('🚪 Logging out...');
        clearStoredAuth();
    };

    console.log('🔄 AuthProvider render - user:', user?.email, 'loading:', loading);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};