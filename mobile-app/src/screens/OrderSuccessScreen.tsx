import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const scaleValue = useRef(new Animated.Value(0)).current;
    // Optional: get orderId from params if needed for display
    // const { orderId } = route.params; 

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();

        // Optional: Auto-redirect after some time? 
        // setTimeout(() => handleContinue(), 5000);
    }, []);

    const handleContinue = () => {
        // Reset navigation stack or just navigate
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab', params: { screen: 'Profile', params: { tab: 'orders' } } }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}>
                    <View style={styles.circle}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: scaleValue }}>
                    <Text style={styles.title}>Order Placed Successfully!</Text>
                    <Text style={styles.subtitle}>
                        Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                    </Text>
                </Animated.View>

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>VIEW MY ORDERS</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('MainTab', { screen: 'Home' })}>
                    <Text style={styles.secondaryButtonText}>CONTINUE SHOPPING</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    iconContainer: {
        marginBottom: 30,
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4CAF50', // Success Green
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingVertical: 15,
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderSuccessScreen;
