import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';

const ProfileScreen = () => {
    const { signOut } = useAuth();
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();

    // State
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // Start false for instant UI
    const [refreshing, setRefreshing] = useState(false);
    const route = useRoute<any>();
    const initialTab = route.params?.tab || 'profile';
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>(initialTab);

    useEffect(() => {
        if (route.params?.tab) {
            setActiveTab(route.params.tab);
        }
    }, [route.params?.tab]);

    useEffect(() => {
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const loadData = async () => {
        try {
            // Load all data in parallel for faster performance
            const [userResult, ordersResult, addressResult] = await Promise.allSettled([
                api.me(),
                api.getMyOrders(),
                api.getMyAddress()
            ]);

            // Process user data
            if (userResult.status === 'fulfilled') {
                setUser(userResult.value.user || {});
            }

            // Process orders data
            if (ordersResult.status === 'fulfilled') {
                setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
            } else {
                setOrders([]);
            }

            // Process address data
            if (addressResult.status === 'fulfilled') {
                setAddresses(addressResult.value ? [addressResult.value] : []);
            } else {
                setAddresses([]);
            }

        } catch (e) {
            console.log('Error loading profile data', e);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Show loading
                            setLoading(true);

                            // Sign out
                            await signOut();

                            // Navigate to Login screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderProfileTab = () => (
        <View style={styles.section}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{user?.name || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
                </View>
            </View>

            <View style={[styles.infoCard, { marginTop: 20 }]}>
                <Text style={styles.cardTitle}>Support & Legal</Text>
                {[
                    { label: 'About Us', type: 'about' },
                    { label: 'Contact Us', type: 'contact' },
                    { label: 'Shipping Policy', type: 'shipping' },
                    { label: 'Returns & Refunds', type: 'returns' },
                    { label: 'Terms & Conditions', type: 'terms' },
                    { label: 'Privacy Policy', type: 'privacy' },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Static', { type: item.type })}
                    >
                        <Text style={styles.menuText}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderOrdersTab = () => (
        <View style={styles.section}>
            {orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="bag-handle-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No orders yet</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Shop')} style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                orders.map((item, index) => (
                    <View key={item._id || index} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderId}>Order #{String(item._id).slice(-6)}</Text>
                            <Text style={styles.orderStatus}>{item.status || 'Pending'}</Text>
                        </View>
                        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        <View style={styles.divider} />
                        {item.items?.map((prod: any, idx: number) => (
                            <View key={idx} style={styles.orderItem}>
                                <Text style={styles.prodName} numberOfLines={1}>{prod.product?.title || 'Product'}</Text>
                                <Text style={styles.prodMeta}>Qty: {prod.quantity} • ₹{prod.price}</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.orderFooter}>
                            <Text style={styles.orderTotalLabel}>Total Amount</Text>
                            <Text style={styles.orderTotalValue}>₹{item.amount}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderAddressesTab = () => (
        <View style={styles.section}>
            {addresses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No saved addresses</Text>
                </View>
            ) : (
                addresses.map((addr, idx) => (
                    <View key={idx} style={styles.addressCard}>
                        <View style={styles.addrHeader}>
                            <Text style={styles.addrName}>{addr.fullName}</Text>
                            <View style={styles.tag}><Text style={styles.tagText}>{addr.addressType}</Text></View>
                        </View>
                        <Text style={styles.addrText}>{addr.address}</Text>
                        <Text style={styles.addrText}>{addr.locality}, {addr.city}</Text>
                        <Text style={styles.addrText}>{addr.state} - {addr.pincode}</Text>
                        <Text style={styles.addrText}>Phone: {addr.mobileNumber}</Text>
                    </View>
                ))
            )}
        </View>
    );


    // Removed full-screen loading - show UI immediately for instant perceived load

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <View>
                    <Text style={styles.welcome}>Hello,</Text>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
                    onPress={() => setActiveTab('orders')}
                >
                    <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'addresses' && styles.activeTab]}
                    onPress={() => setActiveTab('addresses')}
                >
                    <Text style={[styles.tabText, activeTab === 'addresses' && styles.activeTabText]}>Addresses</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'orders' && renderOrdersTab()}
                {activeTab === 'addresses' && renderAddressesTab()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 20, // Status bar area
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    welcome: {
        fontSize: 12,
        color: '#666',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    logoutBtn: {
        marginLeft: 'auto',
        padding: 10,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#000',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    content: {
        padding: 15,
        paddingBottom: 50,
    },
    section: {
        flex: 1,
    },
    // Cards
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    infoRow: {
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#999',
        marginTop: 10,
        fontSize: 16,
    },
    actionBtn: {
        marginTop: 20,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Orders
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    orderStatus: {
        fontSize: 12,
        color: 'green',
        fontWeight: '600',
        backgroundColor: '#e6ffe6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    prodName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginRight: 10,
    },
    prodMeta: {
        fontSize: 14,
        color: '#666',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    orderTotalLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    // Addresses
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    addrHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    addrName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    addrText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
});

export default ProfileScreen;
