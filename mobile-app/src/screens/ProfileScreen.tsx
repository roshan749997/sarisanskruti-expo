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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

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
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Get first item image for preview
    const firstItem = order.items?.[0];
    const previewImage = firstItem?.product?.images?.image1;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand} style={[styles.orderCard, { backgroundColor: colors.card }]}>
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
                        <Text style={[styles.orderAmount, { color: colors.text }]}>₹{order.amount}</Text>
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
                                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.product?.title}</Text>
                                <Text style={[styles.itemMeta, { color: colors.subText }]}>Qty: {item.quantity}  •  ₹{item.price}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.divider} />
                    <Text style={styles.expandedSectionTitle}>Delivery Details</Text>
                    <Text style={[styles.addressText, { color: colors.subText }]}>
                        <Ionicons name="location-outline" size={14} color={colors.subText} /> {order.address?.fullName}, {order.address?.city} - {order.address?.pincode}
                    </Text>
                    <Text style={[styles.paymentText, { color: colors.subText }]}>
                        <Ionicons name="card-outline" size={14} color={colors.subText} /> {order.paymentMethod || 'Online'}
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

    // Account Settings Modals
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [securityModalVisible, setSecurityModalVisible] = useState(false);
    const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    // Notification Settings
    const [notifOrders, setNotifOrders] = useState(true);
    const [notifOffers, setNotifOffers] = useState(true);
    const [notifUpdates, setNotifUpdates] = useState(false);

    // Language
    const { language, setLanguage, t } = useLanguage();

    // Theme
    const { darkMode, toggleDarkMode, colors } = useTheme();

    // Password Change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (route.params?.tab) setViewMode(route.params.tab === 'profile' ? 'menu' : route.params.tab);
    }, [route.params?.tab]);

    useEffect(() => {
        // Language settings handled by context now
    }, []);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await api.changePassword({ currentPassword, newPassword });
            setSecurityModalVisible(false);
            Alert.alert('Success', 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    // Language application is now direct via context in modal

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
            <Text style={[styles.quickLabel, { color: colors.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    const MenuItem = ({ icon, label, onPress, color = '#2874F0' }: any) => (
        <TouchableOpacity style={[styles.menuItem, darkMode && styles.borderDark]} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={22} color={color} style={{ marginRight: 16 }} />
            <Text style={[styles.menuLabel, darkMode && styles.textDark]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? "#555" : "#bbb"} />
        </TouchableOpacity>
    );

    const HeaderSubHandler = ({ title }: any) => (
        <View style={[styles.subHeader, { backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => setViewMode('menu')} style={{ padding: 8, marginLeft: -8 }}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.subHeaderTitle, { color: colors.text }]}>{title}</Text>
        </View>
    );

    const renderMenu = () => (
        <>
            <View style={[styles.header, darkMode && styles.headerDark]}>
                <View style={styles.userInfo}>
                    <Text style={styles.heyText}>{t('hello')},</Text>
                    <Text style={[styles.userName, darkMode && styles.textDark]}>{user?.name || t('guest_user')}</Text>
                </View>
                <TouchableOpacity onPress={openEditProfile} activeOpacity={0.8}>
                    <Image source={{ uri: user?.avatar || AVATARS[0] }} style={styles.profilePic} />
                    <View style={styles.editIconBadge}><Ionicons name="pencil" size={12} color="#fff" /></View>
                </TouchableOpacity>
            </View>

            <View style={[styles.gridContainer, darkMode && styles.menuGroupDark]}>
                <QuickBtn icon="cube-outline" label={t('my_orders')} onPress={() => setViewMode('orders')} color="#2874F0" />
                <QuickBtn icon="heart-outline" label={t('my_wishlist')} onPress={() => setViewMode('wishlist')} color="#FF4081" />
                <QuickBtn icon="gift-outline" label="Coupons" onPress={() => Alert.alert("No Coupons")} color="#FF9800" />
                <QuickBtn icon="headset-outline" label="Help" onPress={() => navigation.navigate('Static', { type: 'contact' })} color="#4CAF50" />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Text style={[styles.sectionHeader, darkMode && styles.subTextDark]}>{t('account_settings')}</Text>
                <View style={[styles.menuGroup, darkMode && styles.menuGroupDark]}>
                    <MenuItem icon="person-outline" label={t('edit_profile')} onPress={openEditProfile} />
                    <MenuItem icon="location-outline" label={t('saved_addresses')} onPress={() => setViewMode('addresses')} />
                    <MenuItem icon="card-outline" label={t('payment_methods')} onPress={() => setPaymentModalVisible(true)} color="#00897B" />
                    <MenuItem icon="lock-closed-outline" label={t('security_password')} onPress={() => setSecurityModalVisible(true)} color="#E91E63" />
                    <MenuItem icon="notifications-outline" label={t('notifications')} onPress={() => setNotificationsModalVisible(true)} color="#FF6F00" />
                    <MenuItem icon="language-outline" label={t('select_language')} onPress={() => setLanguageModalVisible(true)} />
                </View>

                <Text style={[styles.sectionHeader, darkMode && styles.subTextDark]}>{t('app_preferences')}</Text>
                <View style={[styles.menuGroup, darkMode && styles.menuGroupDark]}>
                    <TouchableOpacity style={[styles.menuItem, darkMode && styles.borderDark]} onPress={toggleDarkMode}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="moon-outline" size={22} color="#5E35B1" />
                            <Text style={[styles.menuLabel, { marginLeft: 16 }, darkMode && styles.textDark]}>{t('dark_mode')}</Text>
                        </View>
                        <View style={[styles.switch, darkMode && styles.switchActive]}>
                            <View style={[styles.switchThumb, darkMode && styles.switchThumbActive]} />
                        </View>
                    </TouchableOpacity>
                    <MenuItem icon="download-outline" label={t('download_invoices')} onPress={() => Alert.alert("Invoices", "View and download your order invoices")} color="#1976D2" />
                </View>

                <Text style={[styles.sectionHeader, { color: colors.subText }]}>{t('my_activity')}</Text>
                <View style={[styles.menuGroup, { backgroundColor: colors.card }]}>
                    <MenuItem icon="star-outline" label={t('reviews_ratings')} onPress={() => Alert.alert("Reviews", "No reviews yet")} color="#FFC107" />
                    <MenuItem icon="help-circle-outline" label={t('questions_answers')} onPress={() => navigation.navigate('Static', { type: 'about' })} color="#673AB7" />
                    <MenuItem icon="chatbubbles-outline" label={t('my_chats')} onPress={() => Alert.alert("Chats", "View your conversations with sellers")} color="#00ACC1" />
                </View>

                <Text style={[styles.sectionHeader, { color: colors.subText }]}>{t('earn_rewards')}</Text>
                <View style={[styles.menuGroup, { backgroundColor: colors.card }]}>
                    <MenuItem icon="gift-outline" label={t('refer_earn')} onPress={() => Alert.alert("Refer & Earn", "Invite friends and earn rewards!\n\nShare your referral code: SARI2026")} color="#8E24AA" />
                    <MenuItem icon="wallet-outline" label={t('my_wallet')} onPress={() => Alert.alert("Wallet", "Balance: ₹0\n\nEarn cashback on purchases!")} color="#43A047" />
                </View>

                <Text style={[styles.sectionHeader, { color: colors.subText }]}>{t('feedback_info')}</Text>
                <View style={[styles.menuGroup, { backgroundColor: colors.card }]}>
                    <MenuItem icon="document-text-outline" label={t('terms_policies')} onPress={() => navigation.navigate('Static', { type: 'terms' })} color="#607D8B" />
                    <MenuItem icon="shield-checkmark-outline" label={t('privacy_policy')} onPress={() => navigation.navigate('Static', { type: 'privacy' })} color="#607D8B" />
                    <MenuItem icon="information-circle-outline" label={t('about_us')} onPress={() => navigation.navigate('Static', { type: 'about' })} color="#607D8B" />
                </View>

                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleLogout}>
                    <Text style={styles.logoutText}>{t('log_out')}</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Sari Sanskruti v2.1.0</Text>
            </ScrollView>
        </>
    );

    const renderOrdersView = () => (
        <View style={[styles.subView, { backgroundColor: colors.background }]}>
            <HeaderSubHandler title={`My Orders (${orders.length})`} />
            <ScrollView contentContainerStyle={styles.subScroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {orders.length === 0 ? <EmptyState lottie="https://assets9.lottiefiles.com/packages/lf20_sif17k.json" title="No orders yet" subtitle="Items you buy will appear here" /> :
                    orders.map((o, i) => <OrderCard key={i} order={o} />)}
            </ScrollView>
        </View>
    );

    const renderAddressesView = () => (
        <View style={[styles.subView, { backgroundColor: colors.background }]}>
            <HeaderSubHandler title="My Addresses" />
            <ScrollView contentContainerStyle={styles.subScroll}>
                <TouchableOpacity style={[styles.addNewAddressBtn, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Address')}>
                    <Ionicons name="add-circle-outline" size={24} color="#2874F0" />
                    <Text style={styles.addNewAddressText}>Add a new address</Text>
                </TouchableOpacity>
                {addresses.map((a, i) => (
                    <View key={i} style={[styles.addressCard, { backgroundColor: colors.card }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={[styles.addrType, { backgroundColor: colors.background, color: colors.subText }]}>{a.addressType}</Text>
                                <Text style={[styles.addrName, { color: colors.text }]}>{a.fullName}</Text>
                            </View>
                            <TouchableOpacity style={{ padding: 5 }} onPress={() => navigation.navigate('Address')}>
                                <Ionicons name="create-outline" size={20} color={colors.subText} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.addrText, { color: colors.subText }]}>{a.address}, {a.city}</Text>
                        <Text style={[styles.addrText, { color: colors.subText }]}>{a.state} - {a.pincode}</Text>
                        <Text style={[styles.addrText, { marginTop: 5, fontWeight: '600', color: colors.subText }]}>Mobile: {a.mobileNumber}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderWishlistView = () => (
        <View style={[styles.subView, { backgroundColor: colors.background }]}>
            <HeaderSubHandler title={`My Wishlist (${wishlist.length})`} />
            <ScrollView contentContainerStyle={styles.subScroll}>
                {wishlist.length === 0 ? <EmptyState lottie="https://assets5.lottiefiles.com/packages/lf20_jbrw3hcz.json" title="Wishlist is empty" subtitle="Save your favorite items here" /> :
                    wishlist.map((item, i) => (
                        <TouchableOpacity key={i} style={[styles.wishlistItem, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('ProductDetail', { id: item._id })} activeOpacity={0.8}>
                            <Image source={{ uri: item.images?.image1 }} style={styles.wishlistImg} />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text numberOfLines={1} style={[styles.wishlistTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.wishlistPrice, { color: colors.text }]}>₹{item.price}</Text>
                                <Text style={{ color: '#388E3C', fontSize: 12, marginTop: 4, fontWeight: '600' }}>In Stock</Text>
                            </View>
                            <TouchableOpacity style={{ padding: 10 }}>
                                <Ionicons name="trash-outline" size={22} color={colors.subText} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
            </ScrollView>
        </View>
    );

    const EmptyState = ({ lottie, title, subtitle }: any) => (
        <View style={{ alignItems: 'center', marginTop: 80 }}>
            <LottieView source={{ uri: lottie }} autoPlay loop style={{ width: 180, height: 180 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 20 }}>{title}</Text>
            {subtitle && <Text style={{ fontSize: 14, color: colors.subText, marginTop: 5 }}>{subtitle}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
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

            {/* Payment Methods Modal */}
            <Modal visible={paymentModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPaymentModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Payment Methods</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}><Ionicons name="close" size={24} color="#000" /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.paymentCard}>
                                <Ionicons name="card-outline" size={24} color="#00897B" />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.paymentTitle}>Add Debit/Credit Card</Text>
                                    <Text style={styles.paymentSubtitle}>Save cards for faster checkout</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={24} color="#2874F0" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.paymentCard}>
                                <Ionicons name="logo-google" size={24} color="#4285F4" />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.paymentTitle}>Google Pay</Text>
                                    <Text style={styles.paymentSubtitle}>Link your Google Pay account</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={24} color="#2874F0" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.paymentCard}>
                                <Ionicons name="wallet-outline" size={24} color="#8E24AA" />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.paymentTitle}>PhonePe / Paytm</Text>
                                    <Text style={styles.paymentSubtitle}>Add UPI payment methods</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={24} color="#2874F0" />
                            </TouchableOpacity>
                            <View style={styles.infoBox}>
                                <Ionicons name="shield-checkmark" size={20} color="#43A047" />
                                <Text style={styles.infoText}>Your payment information is encrypted and secure</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Security & Password Modal */}
            <Modal visible={securityModalVisible} animationType="slide" transparent={true} onRequestClose={() => setSecurityModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Security & Password</Text>
                            <TouchableOpacity onPress={() => setSecurityModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.inputLabel, { color: colors.subText }]}>Current Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.subText}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <Text style={[styles.inputLabel, { color: colors.subText }]}>New Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.subText}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <Text style={[styles.inputLabel, { color: colors.subText }]}>Confirm New Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.subText}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />

                            <View style={[styles.securityOption, { borderBottomColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.securityTitle, { color: colors.text }]}>Two-Factor Authentication</Text>
                                    <Text style={[styles.securitySubtitle, { color: colors.subText }]}>Add extra security to your account</Text>
                                </View>
                                <Text style={styles.securityLink}>Setup</Text>
                            </View>

                            <View style={[styles.securityOption, { borderBottomColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.securityTitle, { color: colors.text }]}>Login Activity</Text>
                                    <Text style={[styles.securitySubtitle, { color: colors.subText }]}>View recent login history</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword}>
                            <Text style={styles.saveBtnText}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Notifications Modal */}
            <Modal visible={notificationsModalVisible} animationType="slide" transparent={true} onRequestClose={() => setNotificationsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Settings</Text>
                            <TouchableOpacity onPress={() => setNotificationsModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.notifOption}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notifTitle}>Order Updates</Text>
                                    <Text style={styles.notifSubtitle}>Get notified about order status</Text>
                                </View>
                                <TouchableOpacity onPress={() => setNotifOrders(!notifOrders)} style={[styles.switch, notifOrders && styles.switchActive]}>
                                    <View style={[styles.switchThumb, notifOrders && styles.switchThumbActive]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.notifOption}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notifTitle}>Offers & Promotions</Text>
                                    <Text style={styles.notifSubtitle}>Exclusive deals and discounts</Text>
                                </View>
                                <TouchableOpacity onPress={() => setNotifOffers(!notifOffers)} style={[styles.switch, notifOffers && styles.switchActive]}>
                                    <View style={[styles.switchThumb, notifOffers && styles.switchThumbActive]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.notifOption}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notifTitle}>App Updates</Text>
                                    <Text style={styles.notifSubtitle}>New features and improvements</Text>
                                </View>
                                <TouchableOpacity onPress={() => setNotifUpdates(!notifUpdates)} style={[styles.switch, notifUpdates && styles.switchActive]}>
                                    <View style={[styles.switchThumb, notifUpdates && styles.switchThumbActive]} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => { setNotificationsModalVisible(false); Alert.alert('Saved', 'Notification preferences updated!'); }}>
                            <Text style={styles.saveBtnText}>Save Preferences</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Language Selection Modal */}
            <Modal visible={languageModalVisible} animationType="slide" transparent={true} onRequestClose={() => setLanguageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_language')}</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {LANGUAGES.map((lang, i) => (
                                <TouchableOpacity key={i} style={[styles.langOption, { borderBottomColor: colors.border }]} onPress={async () => { await setLanguage(lang.code); setLanguageModalVisible(false); }}>
                                    <Text style={[styles.langText, { color: colors.text }]}>{lang.label}</Text>
                                    {language === lang.code && <Ionicons name="checkmark-circle" size={24} color="#2874F0" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={styles.saveBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    menuLabel: { flex: 1, fontSize: 15, color: '#212121' },

    logoutBtn: { backgroundColor: '#fff', marginVertical: 20, marginHorizontal: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 4 },
    logoutText: { color: '#2874F0', fontWeight: 'bold', fontSize: 15 },
    version: { textAlign: 'center', color: '#ccc', marginBottom: 30, fontSize: 12 },

    // Dark Mode Styles
    containerDark: { backgroundColor: '#121212' },
    headerDark: { backgroundColor: '#1E1E1E' },
    menuGroupDark: { backgroundColor: '#1E1E1E' },
    textDark: { color: '#E0E0E0' },
    subTextDark: { color: '#B0B0B0' },
    borderDark: { borderBottomColor: '#333' },

    // Sub Views
    subView: { flex: 1, backgroundColor: '#f1f3f6' },
    subHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, elevation: 2 },
    subHeaderTitle: { fontSize: 18, fontWeight: '500', marginLeft: 16, color: '#000' },
    subScroll: { padding: 10, paddingBottom: 40 },

    // Orders
    orderCard: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
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

    // Payment Methods
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 12 },
    paymentTitle: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 4 },
    paymentSubtitle: { fontSize: 13, color: '#666' },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginTop: 10 },
    infoText: { fontSize: 13, color: '#2E7D32', marginLeft: 10, flex: 1 },

    // Security
    securityOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    securityTitle: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 4 },
    securitySubtitle: { fontSize: 13, color: '#666' },
    securityLink: { fontSize: 14, color: '#2874F0', fontWeight: '600' },

    // Notifications
    notifOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    notifTitle: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 4 },
    notifSubtitle: { fontSize: 13, color: '#666' },
    switch: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#ccc', padding: 2, justifyContent: 'center' },
    switchActive: { backgroundColor: '#2874F0' },
    switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
    switchThumbActive: { alignSelf: 'flex-end' },

    // Language
    langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    langText: { fontSize: 15, color: '#212121' },

    loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }
});

export default ProfileScreen;
