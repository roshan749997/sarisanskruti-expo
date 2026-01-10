import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import AddressScreen from '../screens/AddressScreen';
import SearchScreen from '../screens/SearchScreen';
import PaymentScreen from '../screens/PaymentScreen';
import StaticScreen from '../screens/StaticScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrderFailureScreen from '../screens/OrderFailureScreen';
import InvoiceDownloadScreen from '../screens/InvoiceDownloadScreen';

// Icons (using basic text or vector icons if available, assuming vector-icons might be needed for polish later)
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
    const insets = useSafeAreaInsets();
    const { cart } = useCart();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Shop') iconName = focused ? 'grid' : 'grid-outline';
                    else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#D4AF37', // Gold-ish for Saree Sanskruti
                tabBarInactiveTintColor: darkMode ? '#999' : 'gray',
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(insets.bottom, 10),
                    paddingTop: 8,
                    height: 60 + Math.max(insets.bottom, 10),
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: t('home') }}
            />
            <Tab.Screen
                name="Shop"
                component={ShopScreen}
                options={{ title: t('shop') }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: t('cart'), tabBarBadge: cart.length > 0 ? cart.length : undefined }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: t('profile') }}
            />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        // We could return a splash screen here
        return null;
    }

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="MainTab"
        >
            {/* Main App - This is the initial route */}
            <Stack.Screen
                name="MainTab"
                component={MainTabs}
                options={{
                    // Prevent going back from MainTab
                    gestureEnabled: false,
                }}
            />

            {/* Auth Screens - Modal presentation to prevent back navigation issues */}
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    presentation: 'card',
                    gestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                    presentation: 'card',
                    gestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                    presentation: 'card',
                    gestureEnabled: true,
                }}
            />

            {/* Product Flow */}
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />

            {/* Checkout Flow */}
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen as any} />
            <Stack.Screen name="OrderFailure" component={OrderFailureScreen as any} />

            {/* Static Pages */}
            <Stack.Screen name="Static" component={StaticScreen} />
            <Stack.Screen name="InvoiceDownload" component={InvoiceDownloadScreen} />
        </Stack.Navigator>
    );
};

export default RootNavigator;
