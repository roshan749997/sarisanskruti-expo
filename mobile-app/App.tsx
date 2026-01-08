import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AnimatedSplash from './src/components/AnimatedSplash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
    const [appIsReady, setAppIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load fonts, make any API calls you need to do here
                // Simulate app initialization
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (e) {
                console.warn(e);
            } finally {
                // Tell the application to render
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    const handleAnimationComplete = () => {
        setShowSplash(false);
    };

    if (!appIsReady) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                    {showSplash ? (
                        <AnimatedSplash onAnimationComplete={handleAnimationComplete} />
                    ) : (
                        <NavigationContainer>
                            <AuthProvider>
                                <WishlistProvider>
                                    <CartProvider>
                                        <RootNavigator />
                                    </CartProvider>
                                </WishlistProvider>
                            </AuthProvider>
                        </NavigationContainer>
                    )}
                </View>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
