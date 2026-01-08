import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, loading } = useCart();
    const { user } = useAuth();

    const handleQuantityChange = (itemId: string, newQty: number) => {
        if (newQty < 1) {
            Alert.alert('Remove Item', 'Do you want to remove this item from your cart?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' }
            ]);
        } else {
            updateQuantity(itemId, newQty);
        }
    };

    const confirmRemove = (itemId: string) => {
        Alert.alert('Remove Item', 'Do you want to remove this item from your cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' }
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
        <View style={styles.stepContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                    <Ionicons name="cart" size={16} color="#fff" />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>Cart</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepInactive]}>
                    <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={[styles.stepText, styles.stepTextInactive]}>Address</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineInactive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepInactive]}>
                    <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={[styles.stepText, styles.stepTextInactive]}>Payment</Text>
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
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemSubtitle}>{item.color || 'Multicolor'} {item.size ? `| Size: ${item.size}` : ''}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.sellingPrice}>₹{itemPrice.toLocaleString()}</Text>
                            {discountPercentage > 0 && (
                                <>
                                    <Text style={styles.mrpPrice}>₹{itemMRP.toLocaleString()}</Text>
                                    <Text style={styles.discountText}>{discountPercentage}% Off</Text>
                                </>
                            )}
                        </View>
                        <Text style={styles.deliveryText}>Delivery by {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | <Text style={{ color: '#009688' }}>FREE</Text></Text>
                    </View>
                </View>

                {/* Actions Row */}
                <View style={styles.cardActions}>
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading}
                        >
                            <Ionicons name="remove" size={16} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.qtyValueContainer}>
                            <Text style={styles.qtyValue}>{item.quantity}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                        >
                            <Ionicons name="add" size={16} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => confirmRemove(item.id)}>
                        <Ionicons name="trash-outline" size={18} color="#666" />
                        <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer} edges={['top', 'left', 'right']}>
                <StepIndicator />
                <View style={styles.emptyContent}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }}
                        style={styles.emptyImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
                    <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.shopNowText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart ({cart.length})</Text>
            </View>

            <StepIndicator />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Delivery Bar */}
                {cartTotal < 1000 && (
                    <View style={styles.deliveryBar}>
                        <Text style={styles.deliveryBarText}>Add items worth <Text style={{ fontWeight: 'bold' }}>₹{1000 - cartTotal}</Text> for <Text style={{ color: '#009688', fontWeight: 'bold' }}>FREE Delivery</Text></Text>
                    </View>
                )}

                {/* Items */}
                <View style={styles.itemsList}>
                    {cart.map(item => <View key={item.id}>{renderItem({ item })}</View>)}
                </View>

                {/* Price Details */}
                <View style={styles.priceDetailsCard}>
                    <Text style={styles.priceTitle}>Price Details ({cart.length} items)</Text>
                    <View style={styles.priceRowDetails}>
                        <Text style={styles.priceLabel}>Total MRP</Text>
                        <Text style={styles.priceValue}>₹{totalMRP.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRowDetails}>
                        <Text style={styles.priceLabel}>Discount on MRP</Text>
                        <Text style={[styles.priceValue, styles.greenText]}>-₹{totalDiscount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRowDetails}>
                        <Text style={styles.priceLabel}>Shipping Fee</Text>
                        <Text style={[styles.priceValue, shippingCost === 0 ? styles.greenText : styles.priceValue]}>
                            {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{finalAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.savingsContainer}>
                        <Text style={styles.savingsText}>You will save ₹{totalDiscount.toLocaleString()} on this order</Text>
                    </View>
                </View>

                {/* Trust Badges */}
                <View style={styles.trustContainer}>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="shield-check-outline" size={24} color="#666" />
                        <Text style={styles.trustText}>100% Secure Payments</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="cached" size={24} color="#666" />
                        <Text style={styles.trustText}>Easy Returns</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="check-decagram-outline" size={24} color="#666" />
                        <Text style={styles.trustText}>Authentic Products</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomTotalLabel}>Total Amount</Text>
                    <Text style={styles.bottomTotalValue}>₹{finalAmount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderBtn}
                    onPress={() => navigation.navigate('Address')} // Assuming Address screen exists
                >
                    <Text style={styles.placeOrderText}>Place Order</Text>
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
