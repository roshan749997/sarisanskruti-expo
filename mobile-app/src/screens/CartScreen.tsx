import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, loading } = useCart();

    const handleQuantityChange = (itemId: string, newQty: number) => {
        if (newQty < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQty);
        }
    };

    const shippingCost = cartTotal >= 1000 ? 0 : 99;
    const tax = Math.round(cartTotal * 0.05);
    const total = cartTotal + shippingCost + tax;

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.id })}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
                {item.color && <Text style={styles.itemColor}>Color: {item.color}</Text>}
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</Text>

                <View style={styles.actionRow}>
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading}
                            style={styles.qtyBtn}
                        >
                            <Ionicons name="remove" size={16} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                            style={styles.qtyBtn}
                        >
                            <Ionicons name="add" size={16} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => removeFromCart(item.id)} disabled={loading}>
                        <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.shopNowBtn}
                    onPress={() => navigation.navigate('MainTab', { screen: 'Shop' })}
                >
                    <Text style={styles.shopNowText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cart ({cart.length})</Text>
                <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Yes', onPress: clearCart }])} style={{ padding: 5 }}>
                    <Ionicons name="trash-bin-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={cart}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sub Total</Text>
                    <Text style={styles.summaryValue}>₹{cartTotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping & Tax</Text>
                    <Text style={styles.summaryValue}>₹{(shippingCost + tax).toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => navigation.navigate('Address')}
                >
                    <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50, // safe area mock
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 18,
        color: '#666',
    },
    shopNowBtn: {
        marginTop: 20,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    shopNowText: {
        color: '#fff',
        fontWeight: '600',
    },
    list: {
        padding: 15,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    itemImage: {
        width: 80,
        height: 100,
        resizeMode: 'contain',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-around',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    itemBrand: {
        fontSize: 12,
        color: 'blue',
    },
    itemColor: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
    },
    qtyBtn: {
        padding: 5,
    },
    qtyText: {
        paddingHorizontal: 10,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#666',
    },
    summaryValue: {
        color: '#333',
        fontWeight: '600',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkoutBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;
