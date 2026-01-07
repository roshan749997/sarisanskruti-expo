import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface AuthContextType {
    token: string | null;
    user: any | null;
    isLoading: boolean;
    signIn: (token: string, user?: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on app launch
        const bootstrapAsync = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('auth_token');
                const storedUser = await AsyncStorage.getItem('user_data');

                if (storedToken) {
                    setToken(storedToken);
                    // Optionally validate token with backend here
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        try {
                            const userData = await api.me();
                            setUser(userData);
                            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                        } catch (e) {
                            // Token might be invalid
                            await AsyncStorage.removeItem('auth_token');
                            setToken(null);
                        }
                    }
                }
            } catch (e) {
                console.error('Auth restoration failed', e);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const signIn = async (newToken: string, newUser?: any) => {
        setToken(newToken);
        await AsyncStorage.setItem('auth_token', newToken);

        if (newUser) {
            setUser(newUser);
            await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
        } else {
            // Fetch user data if not provided
            try {
                const userData = await api.me();
                setUser(userData);
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            } catch (e) {
                console.error('Failed to fetch user data', e);
            }
        }
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
