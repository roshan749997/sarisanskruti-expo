import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OrderSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const fadeValue = useRef(new Animated.Value(0)).current;

    // Animation refs for Checkmark
    const scaleValue = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(1)).current;
    const ring1Opacity = useRef(new Animated.Value(0.5)).current;

    // Safety check for params
    const { orderId } = route.params || {};

    useEffect(() => {
        // Main Content Fade In
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic)
        }).start();

        // Checkmark Pop
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
        }).start();

        // Pulse Ring Animation
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.timing(ring1Scale, {
                    toValue: 1.5,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
                Animated.timing(ring1Opacity, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                })
            ])
        );
        pulse.start();

    }, []);

    const handleViewOrders = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab', params: { screen: 'Profile', params: { tab: 'orders' } } }],
        });
    };

    const handleContinueShopping = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab', params: { screen: 'Home' } }],
        });
    };

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const dateStr = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            <View style={styles.content}>

                <Animated.View style={[styles.card, { opacity: fadeValue }]}>

                    {/* Success Checkmark Animation */}
                    <View style={styles.iconWrapper}>
                        {/* Pulse Ring */}
                        <Animated.View style={[
                            styles.ring,
                            {
                                transform: [{ scale: ring1Scale }],
                                opacity: ring1Opacity
                            }
                        ]} />

                        {/* Main Circle */}
                        <Animated.View style={[styles.circle, { transform: [{ scale: scaleValue }] }]}>
                            <Ionicons name="checkmark" size={48} color="#fff" />
                        </Animated.View>
                    </View>

                    <Text style={styles.title}>Order Placed!</Text>
                    <Text style={styles.subtitle}>
                        Your order has been confirmed successfully.
                    </Text>

                    {orderId && (
                        <View style={styles.orderIdContainer}>
                            <Text style={styles.orderIdLabel}>Order ID</Text>
                            <Text style={styles.orderIdValue}>#{orderId}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Delivery Info */}
                <Animated.View style={[styles.detailsContainer, { opacity: fadeValue }]}>
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name="truck-delivery-outline" size={28} color="#2874f0" />
                    </View>
                    <View style={styles.deliveryTextContainer}>
                        <Text style={styles.estimateLabel}>Estimated Delivery</Text>
                        <Text style={styles.estimateDate}>by {dateStr}</Text>
                    </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View style={[styles.actions, { opacity: fadeValue }]}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleViewOrders}>
                        <Text style={styles.primaryBtnText}>Check Order Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleContinueShopping}>
                        <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    card: {
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: 16,
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    iconWrapper: {
        width: 100,
        height: 100,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50', // Success Green
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        elevation: 5,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    ring: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        zIndex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    orderIdContainer: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    orderIdLabel: {
        fontSize: 11,
        color: '#878787',
        textTransform: 'uppercase',
    },
    orderIdValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#212121',
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
        elevation: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deliveryTextContainer: {
        marginLeft: 16,
    },
    estimateLabel: {
        fontSize: 12,
        color: '#666',
    },
    estimateDate: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212121',
        marginTop: 2,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        elevation: 2,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    secondaryBtn: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    secondaryBtnText: {
        color: '#212121',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default OrderSuccessScreen;
