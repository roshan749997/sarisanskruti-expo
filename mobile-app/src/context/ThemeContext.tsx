import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

interface ThemeContextData {
    darkMode: boolean;
    toggleDarkMode: () => void;
    colors: {
        background: string;
        card: string;
        text: string;
        subText: string;
        border: string;
        primary: string;
        tint: string;
    };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const stored = await AsyncStorage.getItem('dark_mode');
            if (stored) setDarkMode(JSON.parse(stored));
        } catch (e) {
            console.log('Failed to load theme');
        }
    };

    const toggleDarkMode = async () => {
        const newVal = !darkMode;
        setDarkMode(newVal);
        await AsyncStorage.setItem('dark_mode', JSON.stringify(newVal));
    };

    const theme = {
        darkMode,
        toggleDarkMode,
        colors: darkMode ? {
            // Dark Colors
            background: '#121212',
            card: '#1E1E1E',
            text: '#FFFFFF',
            subText: '#B0B0B0',
            border: '#333333',
            primary: '#2874F0',
            tint: '#FFFFFF'
        } : {
            // Light Colors
            background: '#f5f5f5', // or #fff generally
            card: '#FFFFFF',
            text: '#000000',
            subText: '#666666',
            border: '#f0f0f0',
            primary: '#2874F0',
            tint: '#000000'
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.card}
            />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
