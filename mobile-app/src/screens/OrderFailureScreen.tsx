import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const OrderFailureScreen = () => {
    const navigation = useNavigation<any>();
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        // Shake animation sequence
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    }, []);

    const handleRetry = () => {
        navigation.goBack(); // Go back to payment/cart
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, { transform: [{ translateX: shakeAnimation }] }]}>
                    <View style={styles.circle}>
                        <Ionicons name="close" size={60} color="#fff" />
                    </View>
                </Animated.View>

                <Text style={[styles.title, { color: colors.text }]}>{t('payment_failed')}</Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>
                    {t('payment_failed_msg')}
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleRetry}>
                    <Text style={styles.buttonText}>{t('try_again')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('MainTab', { screen: 'Cart' })}>
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('go_to_cart')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        backgroundColor: '#FF5252', // Red for failure
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF5252',
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

export default OrderFailureScreen;
