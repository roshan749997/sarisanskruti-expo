import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Platform, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const OrderSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();
    const fadeValue = useRef(new Animated.Value(0)).current;

    // Animation refs for Checkmark
    const scaleValue = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(1)).current;
    const ring1Opacity = useRef(new Animated.Value(0.5)).current;

    // Confetti animation
    const [confetti, setConfetti] = useState<any[]>([]);

    // Safety check for params
    const { orderId, orderAmount } = route.params || {};

    useEffect(() => {
        // Party Popper Animation - Multiple burst points with different particle types
        const createPartyBurst = (centerX: number, centerY: number, startDelay: number, particleCount: number) => {
            return Array.from({ length: particleCount }, (_, i) => {
                const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
                const velocity = 80 + Math.random() * 180;
                const particleTypes = ['sparkle', 'ribbon', 'confetti', 'star', 'circle'];
                const colors = [
                    '#FFD700', '#FF1493', '#00CED1', '#FF69B4', '#FFA500',
                    '#9370DB', '#32CD32', '#FF6347', '#1E90FF', '#FFB6C1',
                    '#F0E68C', '#DDA0DD', '#87CEEB', '#98FB98', '#FFC0CB'
                ];

                return {
                    id: `${centerX}-${centerY}-${i}`,
                    x: new Animated.Value(centerX),
                    y: new Animated.Value(centerY),
                    rotation: new Animated.Value(0),
                    scale: new Animated.Value(0),
                    opacity: new Animated.Value(1),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
                    angle: angle,
                    velocity: velocity,
                    size: 6 + Math.random() * 10,
                    startDelay: startDelay,
                };
            });
        };

        // Create multiple party poppers at different positions
        const leftPopper = createPartyBurst(width * 0.2, height * 0.25, 0, 40);
        const rightPopper = createPartyBurst(width * 0.8, height * 0.25, 150, 40);
        const centerPopper = createPartyBurst(width * 0.5, height * 0.35, 300, 50);
        const leftBottomPopper = createPartyBurst(width * 0.3, height * 0.5, 450, 30);
        const rightBottomPopper = createPartyBurst(width * 0.7, height * 0.5, 450, 30);

        const allParticles = [
            ...leftPopper,
            ...rightPopper,
            ...centerPopper,
            ...leftBottomPopper,
            ...rightBottomPopper,
        ];

        setConfetti(allParticles);

        // Animate all particles
        allParticles.forEach((particle, index) => {
            const startX = typeof particle.x === 'number' ? particle.x : (particle.x as any)._value || 0;
            const startY = typeof particle.y === 'number' ? particle.y : (particle.y as any)._value || 0;
            const endX = startX + Math.cos(particle.angle) * particle.velocity;
            const endY = startY + Math.sin(particle.angle) * particle.velocity;
            const duration = 1500 + Math.random() * 1000;
            const rotations = particle.type === 'ribbon' ? 8 : 4;

            Animated.parallel([
                // Pop out with scale
                Animated.sequence([
                    Animated.timing(particle.scale, {
                        toValue: 1.2,
                        duration: 150,
                        delay: particle.startDelay + index * 2,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.back(2)),
                    }),
                    Animated.timing(particle.scale, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.scale, {
                        toValue: 0,
                        duration: duration - 250,
                        useNativeDriver: true,
                        easing: Easing.in(Easing.quad),
                    }),
                ]),
                // Move outward
                Animated.timing(particle.x, {
                    toValue: endX,
                    duration: duration,
                    delay: particle.startDelay + index * 2,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                // Move with gravity
                Animated.timing(particle.y, {
                    toValue: endY + 150, // Strong gravity
                    duration: duration,
                    delay: particle.startDelay + index * 2,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.quad),
                }),
                // Rotation for ribbons and confetti
                Animated.timing(particle.rotation, {
                    toValue: 360 * rotations,
                    duration: duration,
                    delay: particle.startDelay + index * 2,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
                // Fade out
                Animated.sequence([
                    Animated.delay(duration * 0.6),
                    Animated.timing(particle.opacity, {
                        toValue: 0,
                        duration: duration * 0.4,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        });

        // Add sparkle trails
        setTimeout(() => {
            const sparkleTrails = Array.from({ length: 30 }, (_, i) => ({
                id: `sparkle-${i}`,
                x: new Animated.Value(width * Math.random()),
                y: new Animated.Value(height * 0.2 + Math.random() * height * 0.3),
                scale: new Animated.Value(0),
                opacity: new Animated.Value(1),
                color: ['#FFD700', '#FFF', '#FFFF00'][Math.floor(Math.random() * 3)],
                type: 'sparkle',
                size: 3 + Math.random() * 5,
                startDelay: 0,
                angle: 0,
                velocity: 0,
                rotation: new Animated.Value(0),
            }));

            setConfetti(prev => [...prev, ...sparkleTrails]);

            sparkleTrails.forEach((sparkle, index) => {
                Animated.sequence([
                    Animated.timing(sparkle.scale, {
                        toValue: 1,
                        duration: 200,
                        delay: index * 20,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.elastic(2)),
                    }),
                    Animated.parallel([
                        Animated.timing(sparkle.scale, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(sparkle.opacity, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start();
            });
        }, 200);

        // Main Content Fade In
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 800,
            delay: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic)
        }).start();

        // Checkmark Pop with extra bounce
        Animated.sequence([
            Animated.delay(400),
            Animated.spring(scaleValue, {
                toValue: 1.2,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start();

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

    const handleShareOrder = async () => {
        try {
            await Share.share({
                message: `🎉 I just placed an order on Sari Sanskruti! Order ID: #${orderId}`,
                title: 'Order Placed Successfully',
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const dateStr = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            {/* Party Popper Animation */}
            {confetti.map((particle) => {
                const getParticleStyle = () => {
                    const baseStyle = {
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                    };

                    switch (particle.type) {
                        case 'sparkle':
                            return {
                                ...baseStyle,
                                borderRadius: particle.size / 2,
                                shadowColor: particle.color,
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 5,
                            };
                        case 'ribbon':
                            return {
                                ...baseStyle,
                                width: particle.size * 0.4,
                                height: particle.size * 1.5,
                                borderRadius: 2,
                            };
                        case 'confetti':
                            return {
                                ...baseStyle,
                                borderRadius: 2,
                            };
                        case 'star':
                            return {
                                ...baseStyle,
                                borderRadius: 2,
                            };
                        case 'circle':
                        default:
                            return {
                                ...baseStyle,
                                borderRadius: particle.size / 2,
                            };
                    }
                };

                return (
                    <Animated.View
                        key={particle.id}
                        style={[
                            styles.confettiParticle,
                            getParticleStyle(),
                            {
                                opacity: particle.opacity,
                                transform: [
                                    { translateX: particle.x },
                                    { translateY: particle.y },
                                    { scale: particle.scale },
                                    {
                                        rotate: particle.rotation.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }
                                ],
                            },
                        ]}
                    />
                );
            })}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>

                    <Animated.View style={[styles.card, { opacity: fadeValue, backgroundColor: colors.card }]}>

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

                        <Text style={[styles.title, { color: colors.text }]}>🎉 {t('order_placed')}!</Text>
                        <Text style={[styles.subtitle, { color: colors.subText }]}>
                            {t('order_confirmed_msg') || 'Thank you for shopping with us!'}
                        </Text>

                        {orderId && (
                            <View style={[styles.orderIdContainer, { backgroundColor: darkMode ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border }]}>
                                <Text style={[styles.orderIdLabel, { color: colors.subText }]}>{t('order_id') || 'Order ID'}</Text>
                                <Text style={[styles.orderIdValue, { color: colors.text }]}>#{orderId}</Text>
                            </View>
                        )}

                        {orderAmount && (
                            <View style={styles.amountContainer}>
                                <Text style={[styles.amountLabel, { color: colors.subText }]}>Total Amount</Text>
                                <Text style={[styles.amountValue, { color: '#4CAF50' }]}>₹{orderAmount.toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* Delivery Info */}
                    <Animated.View style={[styles.detailsContainer, { opacity: fadeValue, backgroundColor: colors.card }]}>
                        <View style={[styles.iconBox, { backgroundColor: darkMode ? '#1E3A5F' : '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={28} color="#2874f0" />
                        </View>
                        <View style={styles.deliveryTextContainer}>
                            <Text style={[styles.estimateLabel, { color: colors.subText }]}>{t('estimated_delivery') || 'Estimated Delivery'}</Text>
                            <Text style={[styles.estimateDate, { color: colors.text }]}>{t('delivery_by') || 'by'} {dateStr}</Text>
                        </View>
                    </Animated.View>

                    {/* Quick Actions */}
                    <Animated.View style={[styles.quickActionsContainer, { opacity: fadeValue }]}>
                        <Text style={[styles.quickActionsTitle, { color: colors.text }]}>What's Next?</Text>

                        <View style={styles.quickActionsGrid}>
                            <TouchableOpacity
                                style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                                onPress={handleViewOrders}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.text }]}>Track Order</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                                onPress={handleShareOrder}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                                    <Ionicons name="share-social-outline" size={24} color="#FF9800" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.text }]}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                                onPress={() => navigation.navigate('Static', { type: 'contact' })}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="help-circle-outline" size={24} color="#2196F3" />
                                </View>
                                <Text style={[styles.quickActionText, { color: colors.text }]}>Help</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Actions */}
                    <Animated.View style={[styles.actions, { opacity: fadeValue }]}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleViewOrders}>
                            <Ionicons name="receipt-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryBtnText}>{t('check_status') || 'View Order Details'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleContinueShopping}>
                            <Ionicons name="arrow-back" size={20} color={colors.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{t('continue_shopping') || 'Continue Shopping'}</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Thank You Message */}
                    <Animated.View style={[styles.thankYouContainer, { opacity: fadeValue }]}>
                        <Text style={[styles.thankYouText, { color: colors.subText }]}>
                            Thank you for choosing Sari Sanskruti! 🙏
                        </Text>
                        <Text style={[styles.thankYouSubtext, { color: colors.subText }]}>
                            We'll send you updates about your order via email and SMS
                        </Text>
                    </Animated.View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    content: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    confettiParticle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        zIndex: 9999,
        elevation: 9999,
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
        backgroundColor: '#4CAF50',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
        textAlign: 'center',
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 12,
    },
    orderIdLabel: {
        fontSize: 11,
        color: '#878787',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    orderIdValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    amountContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    amountLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
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
    quickActionsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#212121',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#212121',
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        gap: 12,
        marginBottom: 20,
    },
    primaryBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        elevation: 2,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
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
    thankYouContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    thankYouText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    thankYouSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default OrderSuccessScreen;
