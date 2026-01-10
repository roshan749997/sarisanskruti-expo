import React, { useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<any>(null);
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, loading } = useCart();
    const { user } = useAuth();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    // Enable scroll to top when tab is pressed
    useScrollToTop(scrollViewRef);

    const handleQuantityChange = (itemId: string, newQty: number) => {
        if (newQty < 1) {
            Alert.alert(t('remove_item'), t('remove_item_msg'), [
                { text: t('cancel'), style: 'cancel' },
                { text: t('remove'), onPress: () => removeFromCart(itemId), style: 'destructive' }
            ]);
        } else {
            updateQuantity(itemId, newQty);
        }
    };

    const confirmRemove = (itemId: string) => {
        Alert.alert(t('remove_item'), t('remove_item_msg'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('remove'), onPress: () => removeFromCart(itemId), style: 'destructive' }
        ]);
    };

    // Calculations
    const shippingCost = cartTotal >= 1000 ? 0 : 99;
    const tax = Math.round(cartTotal * 0.05); // EST 5%
    const calculateMRP = (item: any) => (item.originalPrice || item.mrp || item.price * 1.2) * item.quantity;
    const totalMRP = cart.reduce((sum, item) => sum + calculateMRP(item), 0);
    const totalDiscount = Math.max(0, totalMRP - cartTotal);
    const finalAmount = cartTotal + shippingCost; // Tax usually included in price in India, strictly speaking

    const StepIndicator = () => (
        <View style={[styles.stepContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                    <Ionicons name="cart" size={16} color="#fff" />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>{t('step_cart')}</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepInactive, { backgroundColor: darkMode ? '#333' : '#eee' }]}>
                    <Text style={[styles.stepNumber, { color: colors.subText }]}>2</Text>
                </View>
                <Text style={[styles.stepText, styles.stepTextInactive]}>{t('step_address')}</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineInactive, { backgroundColor: darkMode ? '#333' : '#eee' }]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepInactive, { backgroundColor: darkMode ? '#333' : '#eee' }]}>
                    <Text style={[styles.stepNumber, { color: colors.subText }]}>3</Text>
                </View>
                <Text style={[styles.stepText, styles.stepTextInactive]}>{t('step_payment')}</Text>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        const itemMRP = item.originalPrice || item.mrp || Math.round(item.price * 1.25);
        const itemPrice = item.price;
        const discountPercentage = itemMRP > itemPrice
            ? Math.round(((itemMRP - itemPrice) / itemMRP) * 100)
            : 0;

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.cardContent}>
                    <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.itemSubtitle, { color: colors.subText }]}>{item.color || 'Multicolor'} {item.size ? `| ${t('size')}: ${item.size}` : ''}</Text>

                        <View style={styles.priceRow}>
                            <Text style={[styles.sellingPrice, { color: colors.text }]}>₹{itemPrice.toLocaleString()}</Text>
                            {discountPercentage > 0 && (
                                <>
                                    <Text style={styles.mrpPrice}>₹{itemMRP.toLocaleString()}</Text>
                                    <Text style={styles.discountText}>{discountPercentage}% {t('discount_off')}</Text>
                                </>
                            )}
                        </View>
                        <Text style={styles.deliveryText}>{t('delivery_by')} {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | <Text style={{ color: '#009688' }}>{t('free')}</Text></Text>
                    </View>
                </View>

                {/* Actions Row */}
                <View style={styles.cardActions}>
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled, { borderColor: colors.border, backgroundColor: colors.background }]}
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading}
                        >
                            <Ionicons name="remove" size={16} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.qtyValueContainer}>
                            <Text style={[styles.qtyValue, { color: colors.text }]}>{item.quantity}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                        >
                            <Ionicons name="add" size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => confirmRemove(item.id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.subText} />
                        <Text style={[styles.removeText, { color: colors.subText }]}>{t('remove')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <StepIndicator />
                <View style={[styles.emptyContent, { backgroundColor: colors.background }]}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }}
                        style={styles.emptyImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('empty_cart')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.subText }]}>{t('empty_cart_msg')}</Text>
                    <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.shopNowText}>{t('start_shopping')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('cart_title')} ({cart.length})</Text>
            </View>

            <StepIndicator />

            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Delivery Bar */}
                {cartTotal < 1000 && (
                    <View style={[styles.deliveryBar, { backgroundColor: darkMode ? '#2C2C1E' : '#FFF8E1' }]}>
                        <Text style={[styles.deliveryBarText, { color: colors.text }]}>{t('add_items_worth')}<Text style={{ fontWeight: 'bold' }}>₹{1000 - cartTotal}</Text>{t('for_free_delivery')}</Text>
                    </View>
                )}

                {/* Items */}
                <View style={styles.itemsList}>
                    {cart.map(item => <View key={item.id}>{renderItem({ item })}</View>)}
                </View>

                {/* Price Details */}
                <View style={[styles.priceDetailsCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.priceTitle, { color: colors.subText }]}>{t('price_details')} ({cart.length} items)</Text>
                    <View style={styles.priceRowDetails}>
                        <Text style={[styles.priceLabel, { color: colors.text }]}>{t('total_mrp')}</Text>
                        <Text style={[styles.priceValue, { color: colors.text }]}>₹{totalMRP.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRowDetails}>
                        <Text style={[styles.priceLabel, { color: colors.text }]}>{t('discount_on_mrp')}</Text>
                        <Text style={[styles.priceValue, styles.greenText]}>-₹{totalDiscount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRowDetails}>
                        <Text style={[styles.priceLabel, { color: colors.text }]}>{t('shipping_fee')}</Text>
                        <Text style={[styles.priceValue, shippingCost === 0 ? styles.greenText : { color: colors.text }]}>
                            {shippingCost === 0 ? t('free') : `₹${shippingCost}`}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total_amount')}</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>₹{finalAmount.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.savingsContainer}>
                        <Text style={styles.savingsText}>{t('you_save')}{totalDiscount.toLocaleString()}{t('on_order')}</Text>
                    </View>
                </View>

                {/* Trust Badges */}
                <View style={[styles.trustContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.subText} />
                        <Text style={[styles.trustText, { color: colors.subText }]}>{t('secure_payments')}</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="cached" size={24} color={colors.subText} />
                        <Text style={[styles.trustText, { color: colors.subText }]}>{t('easy_returns')}</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="check-decagram-outline" size={24} color={colors.subText} />
                        <Text style={[styles.trustText, { color: colors.subText }]}>{t('authentic_products')}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View>
                    <Text style={[styles.bottomTotalLabel, { color: colors.subText }]}>{t('total_amount')}</Text>
                    <Text style={[styles.bottomTotalValue, { color: colors.text }]}>₹{finalAmount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderBtn}
                    onPress={() => navigation.navigate('Address')} // Assuming Address screen exists
                >
                    <Text style={styles.placeOrderText}>{t('place_order')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    // Stepper
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 8,
    },
    step: {
        alignItems: 'center',
        width: 60,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepActive: {
        backgroundColor: '#E91E63',
    },
    stepInactive: {
        backgroundColor: '#eee',
    },
    stepNumber: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    stepText: {
        fontSize: 10,
        fontWeight: '600',
    },
    stepTextActive: {
        color: '#E91E63',
    },
    stepTextInactive: {
        color: '#888',
    },
    stepLine: {
        width: 40,
        height: 2,
        marginBottom: 14, // align with circle
    },
    stepLineActive: {
        backgroundColor: '#E91E63',
    },
    stepLineInactive: {
        backgroundColor: '#eee',
    },

    scrollContent: {
        paddingBottom: 20,
    },
    itemsList: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 8,
        padding: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    cardContent: {
        flexDirection: 'row',
    },
    imageContainer: {
        width: 80,
        height: 100,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
        marginRight: 12,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'space-around',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    sellingPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginRight: 8,
    },
    mrpPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 6,
    },
    discountText: {
        fontSize: 12,
        color: '#009688',
        fontWeight: '600',
    },
    deliveryText: {
        fontSize: 11,
        color: '#666',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    qtyBtnDisabled: {
        borderColor: '#eee',
        backgroundColor: '#f9f9f9',
    },
    qtyValueContainer: {
        width: 32,
        alignItems: 'center',
    },
    qtyValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },

    // Price Details
    priceDetailsCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        elevation: 1,
    },
    priceTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    priceRowDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#333',
    },
    priceValue: {
        fontSize: 14,
        color: '#333',
    },
    greenText: {
        color: '#009688',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    savingsContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#E0F2F1', // Light Teal
        borderRadius: 4,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#009688',
    },
    savingsText: {
        fontSize: 12,
        color: '#009688',
        textAlign: 'center',
        fontWeight: '600',
    },

    // Empty
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    shopNowBtn: {
        backgroundColor: '#E91E63',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 4,
    },
    shopNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Trust
    trustContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    trustItem: {
        alignItems: 'center',
    },
    trustText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        width: 80,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
    },
    bottomTotalLabel: {
        fontSize: 12,
        color: '#888',
    },
    bottomTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    placeOrderBtn: {
        flex: 1,
        backgroundColor: '#000', // Black as requested previously for buttons
        paddingVertical: 14,
        borderRadius: 4,
        alignItems: 'center',
        marginLeft: 24,
    },
    placeOrderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deliveryBar: {
        backgroundColor: '#FFF8E1',
        padding: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    deliveryBarText: {
        fontSize: 12,
        color: '#333',
    }
});

export default CartScreen;
