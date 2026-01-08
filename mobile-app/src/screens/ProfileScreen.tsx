import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AVATARS = [
    'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140051.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140040.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140052.png',
];

const OrderCard = ({ order }: { order: any }) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Get first item image for preview
    const firstItem = order.items?.[0];
    const previewImage = firstItem?.product?.images?.image1;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                {previewImage ? (
                    <Image source={{ uri: previewImage }} style={styles.orderPreviewImg} />
                ) : (
                    <View style={styles.orderIconPlaceholder}>
                        <Ionicons name="cube-outline" size={20} color="#2874F0" />
                    </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.orderStatus, { color: getStatusColor(order.status).text }]}>
                            {order.status || 'Processing'}
                        </Text>
                        <Text style={styles.orderAmount}>₹{order.amount}</Text>
                    </View>
                    <Text style={styles.orderDate}>Ordered on {new Date(order.createdAt).toDateString()}</Text>
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-forward"} size={20} color="#ccc" style={{ marginLeft: 8 }} />
            </View>

            {/* Expanded items list */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <Text style={styles.expandedSectionTitle}>Items</Text>
                    {order.items.map((item: any, idx: number) => (
                        <View key={idx} style={styles.itemRow}>
                            {item.product?.images?.image1 && <Image source={{ uri: item.product.images.image1 }} style={styles.itemSmallImg} />}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.itemName} numberOfLines={2}>{item.product?.title}</Text>
                                <Text style={styles.itemMeta}>Qty: {item.quantity}  •  ₹{item.price}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.divider} />
                    <Text style={styles.expandedSectionTitle}>Delivery Details</Text>
                    <Text style={styles.addressText}>
                        <Ionicons name="location-outline" size={14} /> {order.address?.fullName}, {order.address?.city} - {order.address?.pincode}
                    </Text>
                    <Text style={styles.paymentText}>
                        <Ionicons name="card-outline" size={14} /> {order.paymentMethod || 'Online'}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Delivered': return { text: '#2E7D32', bg: '#E8F5E9' };
        case 'Cancelled': return { text: '#C62828', bg: '#FFEBEE' };
        default: return { text: '#2874F0', bg: '#E3F2FD' };
    }
};

const ProfileScreen = () => {
    const { user: contextUser, token, signOut, signIn } = useAuth();
    const user = contextUser?.user || contextUser;

    // View Mode
    const [viewMode, setViewMode] = useState('menu');

    // Data
    const { wishlist } = useWishlist();
    const { clearCart } = useCart();
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const route = useRoute<any>();

    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (route.params?.tab) setViewMode(route.params.tab === 'profile' ? 'menu' : route.params.tab);
    }, [route.params?.tab]);

    useEffect(() => {
        if (isFocused) loadData();
    }, [isFocused]);

    useEffect(() => {
        const backAction = () => {
            if (viewMode !== 'menu') { setViewMode('menu'); return true; }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [viewMode]);

    const loadData = async () => {
        try {
            const [ordersRes, addressRes] = await Promise.allSettled([api.getMyOrders(), api.getMyAddress()]);
            if (ordersRes.status === 'fulfilled') setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
            if (addressRes.status === 'fulfilled') setAddresses(addressRes.value ? [addressRes.value] : []);
        } catch (e) { console.error(e); }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        if (token) {
            try { const updatedUser = await api.me(); if (updatedUser) signIn(token, updatedUser); } catch (e) { }
        }
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure?', [{ text: 'Cancel' }, {
            text: 'Log Out', style: 'destructive', onPress: async () => {
                setLoading(true); await signOut(); clearCart(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); setLoading(false);
            }
        }]);
    };

    const openEditProfile = () => {
        setEditName(user?.name || '');
        setEditPhone(user?.phone || '');
        setEditAvatar(user?.avatar || AVATARS[0]);
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        if (!editName.trim()) { Alert.alert('Invalid Name'); return; }
        setUpdating(true);
        try {
            await api.updateProfile({ name: editName, phone: editPhone, avatar: editAvatar });
            if (token) { const u = await api.me(); signIn(token, u); }
            setEditModalVisible(false); onRefresh(); Alert.alert("Updated");
        } catch { Alert.alert("Error updating profile"); } finally { setUpdating(false); }
    };

    // --- Render Components ---
    const QuickBtn = ({ icon, label, onPress, color = '#2874F0' }: any) => (
        <TouchableOpacity style={styles.quickBtn} onPress={onPress}>
            <View style={[styles.quickIconCircle, { borderColor: color + '40', backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const MenuItem = ({ icon, label, onPress, color = '#2874F0' }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={22} color={color} style={{ marginRight: 16 }} />
            <Text style={styles.menuLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#bbb" />
        </TouchableOpacity>
    );

    const HeaderSubHandler = ({ title }: any) => (
        <View style={styles.subHeader}>
            <TouchableOpacity onPress={() => setViewMode('menu')} style={{ padding: 8, marginLeft: -8 }}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.subHeaderTitle}>{title}</Text>
        </View>
    );

    const renderMenu = () => (
        <>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Text style={styles.heyText}>Hello,</Text>
                    <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                </View>
                <TouchableOpacity onPress={openEditProfile} activeOpacity={0.8}>
                    <Image source={{ uri: user?.avatar || AVATARS[0] }} style={styles.profilePic} />
                    <View style={styles.editIconBadge}><Ionicons name="pencil" size={12} color="#fff" /></View>
                </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
                <QuickBtn icon="cube-outline" label="Orders" onPress={() => setViewMode('orders')} color="#2874F0" />
                <QuickBtn icon="heart-outline" label="Wishlist" onPress={() => setViewMode('wishlist')} color="#FF4081" />
                <QuickBtn icon="gift-outline" label="Coupons" onPress={() => Alert.alert("No Coupons")} color="#FF9800" />
                <QuickBtn icon="headset-outline" label="Help" onPress={() => navigation.navigate('Static', { type: 'contact' })} color="#4CAF50" />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Text style={styles.sectionHeader}>Account Settings</Text>
                <View style={styles.menuGroup}>
                    <MenuItem icon="person-outline" label="Edit Profile" onPress={openEditProfile} />
                    <MenuItem icon="location-outline" label="Saved Addresses" onPress={() => setViewMode('addresses')} />
                    <MenuItem icon="language-outline" label="Select Language" onPress={() => Alert.alert("English selected")} />
                </View>

                <Text style={styles.sectionHeader}>My Activity</Text>
                <View style={styles.menuGroup}>
                    <MenuItem icon="star-outline" label="Reviews" onPress={() => Alert.alert("No reviews yet")} color="#FFC107" />
                    <MenuItem icon="help-circle-outline" label="Q & A" onPress={() => navigation.navigate('Static', { type: 'about' })} color="#673AB7" />
                </View>

                <Text style={styles.sectionHeader}>Feedback & Information</Text>
                <View style={styles.menuGroup}>
                    <MenuItem icon="document-text-outline" label="Terms, Policies and Licenses" onPress={() => navigation.navigate('Static', { type: 'terms' })} color="#607D8B" />
                    <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Static', { type: 'privacy' })} color="#607D8B" />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Sari Sanskruti v2.1.0</Text>
            </ScrollView>
        </>
    );

    const renderOrdersView = () => (
        <View style={styles.subView}>
            <HeaderSubHandler title={`My Orders (${orders.length})`} />
            <ScrollView contentContainerStyle={styles.subScroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {orders.length === 0 ? <EmptyState lottie="https://assets9.lottiefiles.com/packages/lf20_sif17k.json" title="No orders yet" subtitle="Items you buy will appear here" /> :
                    orders.map((o, i) => <OrderCard key={i} order={o} />)}
            </ScrollView>
        </View>
    );

    const renderAddressesView = () => (
        <View style={styles.subView}>
            <HeaderSubHandler title="My Addresses" />
            <ScrollView contentContainerStyle={styles.subScroll}>
                <TouchableOpacity style={styles.addNewAddressBtn} onPress={() => navigation.navigate('Address')}>
                    <Ionicons name="add-circle-outline" size={24} color="#2874F0" />
                    <Text style={styles.addNewAddressText}>Add a new address</Text>
                </TouchableOpacity>
                {addresses.map((a, i) => (
                    <View key={i} style={styles.addressCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={styles.addrType}>{a.addressType}</Text>
                                <Text style={styles.addrName}>{a.fullName}</Text>
                            </View>
                            <TouchableOpacity style={{ padding: 5 }} onPress={() => navigation.navigate('Address')}>
                                <Ionicons name="create-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.addrText}>{a.address}, {a.city}</Text>
                        <Text style={styles.addrText}>{a.state} - {a.pincode}</Text>
                        <Text style={[styles.addrText, { marginTop: 5, fontWeight: '600' }]}>Mobile: {a.mobileNumber}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderWishlistView = () => (
        <View style={styles.subView}>
            <HeaderSubHandler title={`My Wishlist (${wishlist.length})`} />
            <ScrollView contentContainerStyle={styles.subScroll}>
                {wishlist.length === 0 ? <EmptyState lottie="https://assets5.lottiefiles.com/packages/lf20_jbrw3hcz.json" title="Wishlist is empty" subtitle="Save your favorite items here" /> :
                    wishlist.map((item, i) => (
                        <TouchableOpacity key={i} style={styles.wishlistItem} onPress={() => navigation.navigate('ProductDetail', { id: item._id })} activeOpacity={0.8}>
                            <Image source={{ uri: item.images?.image1 }} style={styles.wishlistImg} />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text numberOfLines={1} style={styles.wishlistTitle}>{item.title}</Text>
                                <Text style={styles.wishlistPrice}>₹{item.price}</Text>
                                <Text style={{ color: '#388E3C', fontSize: 12, marginTop: 4, fontWeight: '600' }}>In Stock</Text>
                            </View>
                            <TouchableOpacity style={{ padding: 10 }}>
                                <Ionicons name="trash-outline" size={22} color="#aaa" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
            </ScrollView>
        </View>
    );

    const EmptyState = ({ lottie, title, subtitle }: any) => (
        <View style={{ alignItems: 'center', marginTop: 80 }}>
            <LottieView source={{ uri: lottie }} autoPlay loop style={{ width: 180, height: 180 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 }}>{title}</Text>
            {subtitle && <Text style={{ fontSize: 14, color: '#888', marginTop: 5 }}>{subtitle}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {viewMode === 'menu' && renderMenu()}
            {viewMode === 'orders' && renderOrdersView()}
            {viewMode === 'addresses' && renderAddressesView()}
            {viewMode === 'wishlist' && renderWishlistView()}

            <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}><Ionicons name="close" size={24} color="#000" /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Select Avatar</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {AVATARS.map((u, i) => <TouchableOpacity key={i} onPress={() => setEditAvatar(u)} style={[styles.avOpt, editAvatar === u && styles.avSel]}><Image source={{ uri: u }} style={styles.avImg} /></TouchableOpacity>)}
                            </ScrollView>
                            <Text style={styles.inputLabel}>Personal Details</Text>
                            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Full Name" />
                            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="Phone Number" keyboardType="phone-pad" />
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={updating}>
                            {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {loading && <View style={styles.loaderOverlay}><ActivityIndicator size="large" color="#2874F0" /></View>}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },

    // Header
    header: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    userInfo: { flex: 1 },
    heyText: { fontSize: 13, color: '#666' },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 2 },
    profilePic: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2874F0', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },

    // Quick Grid
    gridContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 20, justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
    quickBtn: { alignItems: 'center', width: width / 4.5 },
    quickIconCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    quickLabel: { fontSize: 11, color: '#333', fontWeight: '600', textAlign: 'center' },

    // Menu
    sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#878787', marginLeft: 20, marginTop: 15, marginBottom: 10, textTransform: 'uppercase' },
    menuGroup: { backgroundColor: '#fff', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
    menuLabel: { flex: 1, fontSize: 15, color: '#212121' },

    logoutBtn: { backgroundColor: '#fff', marginVertical: 20, marginHorizontal: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 4 },
    logoutText: { color: '#2874F0', fontWeight: 'bold', fontSize: 15 },
    version: { textAlign: 'center', color: '#ccc', marginBottom: 30, fontSize: 12 },

    // Sub Views
    subView: { flex: 1, backgroundColor: '#f1f3f6' },
    subHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, elevation: 2 },
    subHeaderTitle: { fontSize: 18, fontWeight: '500', marginLeft: 16, color: '#000' },
    subScroll: { padding: 10, paddingBottom: 40 },

    // Orders
    orderCard: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, radius: 4, elevation: 1 },
    orderHeader: { flexDirection: 'row', alignItems: 'center' },
    orderPreviewImg: { width: 50, height: 50, borderRadius: 4, marginRight: 12, backgroundColor: '#f0f0f0' },
    orderIconPlaceholder: { width: 50, height: 50, borderRadius: 4, marginRight: 12, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
    orderStatus: { fontWeight: 'bold', fontSize: 14 },
    orderAmount: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    orderDate: { fontSize: 11, color: '#888', marginTop: 2 },

    expandedContent: { marginTop: 15 },
    expandedSectionTitle: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
    itemRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
    itemSmallImg: { width: 30, height: 30, borderRadius: 4, marginRight: 10 },
    itemName: { flex: 1, fontSize: 13, color: '#333' },
    itemMeta: { fontSize: 12, color: '#666', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
    addressText: { fontSize: 13, color: '#444', marginBottom: 8 },
    paymentText: { fontSize: 13, color: '#444' },

    // Addresses
    addNewAddressBtn: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, marginBottom: 12, borderRadius: 4, alignItems: 'center', justifyContent: 'center', elevation: 1 },
    addNewAddressText: { color: '#2874F0', fontWeight: 'bold', marginLeft: 10, fontSize: 15 },
    addressCard: { backgroundColor: '#fff', padding: 18, marginBottom: 12, borderRadius: 4, elevation: 1 },
    addrType: { fontSize: 11, backgroundColor: '#f0f0f0', color: '#666', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold', marginBottom: 8 },
    addrName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    addrText: { fontSize: 14, color: '#555', marginBottom: 2 },

    // Wishlist
    wishlistItem: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 2, padding: 16, alignItems: 'center' },
    wishlistImg: { width: 80, height: 80, resizeMode: 'contain' },
    wishlistTitle: { fontSize: 14, color: '#212121', marginBottom: 6 },
    wishlistPrice: { fontWeight: 'bold', fontSize: 16, color: '#212121' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    inputLabel: { fontSize: 12, color: '#888', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    saveBtn: { backgroundColor: '#2874F0', padding: 16, alignItems: 'center', marginTop: 20, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    avOpt: { width: 56, height: 56, borderRadius: 28, marginRight: 12, borderWidth: 2, borderColor: 'transparent', padding: 2 },
    avSel: { borderColor: '#2874F0' },
    avImg: { width: '100%', height: '100%', borderRadius: 25 },

    loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }
});

export default ProfileScreen;
