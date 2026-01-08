import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    Platform,
    Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const AddressScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { cart, cartTotal, loading: cartLoading, clearCart } = useCart();
    const { colors, darkMode } = useTheme();

    // State
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        alternatePhone: '',
        addressType: 'Home'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'payu' | 'cod'>('cod');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadAddress();
    }, []);

    const loadAddress = async () => {
        try {
            setLoading(true);
            const data = await api.getMyAddress();
            if (data && data._id) {
                setAddress(data);
                setFormData({
                    fullName: data.fullName || '',
                    mobileNumber: data.mobileNumber || '',
                    pincode: data.pincode || '',
                    locality: data.locality || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    landmark: data.landmark || '',
                    alternatePhone: data.alternatePhone || '',
                    addressType: data.addressType || 'Home'
                });
            } else {
                setIsEditing(true);
            }
        } catch (e) {
            console.log('Error loading address', e);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!formData.fullName || !formData.mobileNumber || !formData.pincode || !formData.address || !formData.city || !formData.state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setProcessing(true);
            const res = await api.saveMyAddress(formData);
            setAddress(res.data ? res.data : res);
            setIsEditing(false);
            const fresh = await api.getMyAddress();
            setAddress(fresh);
            // Alert.alert('Success', 'Address saved successfully'); 
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save address');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (!address?._id) return;
        Alert.alert('Delete Address', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setProcessing(true);
                        await api.deleteAddressById(address._id);
                        setAddress(null);
                        setFormData({ ...formData, fullName: '', mobileNumber: '' });
                        setIsEditing(true);
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete address');
                    } finally {
                        setProcessing(false);
                    }
                }
            }
        ]);
    };

    // Price Calculation
    const subtotal = cartTotal || 0;
    const shippingCharge = subtotal < 5000 ? 99 : 0;
    const tax = Math.round(subtotal * 0.05);
    const totalPayable = subtotal + shippingCharge + tax;

    const handlePlaceOrder = async () => {
        if (!address) {
            Alert.alert('Error', 'Please save delivery address first');
            return;
        }
        try {
            setProcessing(true);
            if (paymentMethod === 'cod') {
                await api.createCODOrder();
                await clearCart();
                navigation.navigate('OrderSuccess', { orderId: 'COD' });
            } else {
                const user = await api.me().catch(() => ({}));
                const email = user.email || 'guest@example.com';
                const payuData = await api.createPayUTxn(
                    totalPayable,
                    formData.fullName,
                    email,
                    formData.mobileNumber
                );
                navigation.navigate('Payment', { payuData });
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Order placement failed');
        } finally {
            setProcessing(false);
        }
    };

    const renderInput = (label: string, field: keyof typeof formData, placeholder: string, keyboardType: any = 'default', multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea, { borderColor: colors.border, color: colors.text }]}
                value={(formData as any)[field]}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                placeholder={placeholder}
                placeholderTextColor={colors.subText}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Review Order</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 115 }} showsVerticalScrollIndicator={false}>

                {/* Step 1: Address */}
                <View style={styles.sectionHeader}>
                    <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    {address && !isEditing && (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={styles.changeBtnText}>CHANGE</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {address && !isEditing ? (
                        <View>
                            <View style={styles.addressNameRow}>
                                <Text style={[styles.nameText, { color: colors.text }]}>{address.fullName}</Text>
                                <View style={styles.addrTypeBadge}>
                                    <Text style={styles.addrTypeText}>{address.addressType}</Text>
                                </View>
                            </View>
                            <Text style={[styles.addressText, { color: colors.text }]}>{address.address}, {address.locality}</Text>
                            <Text style={[styles.addressText, { color: colors.text }]}>{address.city}, {address.state} - {address.pincode}</Text>
                            <Text style={[styles.phoneText, { color: colors.text }]}>Phone: <Text style={{ fontWeight: '600' }}>{address.mobileNumber}</Text></Text>
                            {address.alternatePhone ? <Text style={[styles.phoneText, { color: colors.text }]}>Alt: {address.alternatePhone}</Text> : null}
                        </View>
                    ) : (
                        <View>
                            <Text style={[styles.formContextTitle, { color: colors.text }]}>{address ? 'Edit Address' : 'Add New Address'}</Text>

                            {renderInput('Full Name', 'fullName', 'Enter Name')}
                            {renderInput('Mobile Number', 'mobileNumber', '10-digit number', 'phone-pad')}

                            <View style={styles.twoCol}>
                                <View style={{ flex: 1, marginRight: 8 }}>{renderInput('Pincode', 'pincode', 'Pincode', 'numeric')}</View>
                                <View style={{ flex: 1 }}>{renderInput('Locality', 'locality', 'Locality')}</View>
                            </View>

                            {renderInput('Address (House No, Building, Street)', 'address', 'Address', 'default', true)}

                            <View style={styles.twoCol}>
                                <View style={{ flex: 1, marginRight: 8 }}>{renderInput('City', 'city', 'City')}</View>
                                <View style={{ flex: 1 }}>{renderInput('State', 'state', 'State')}</View>
                            </View>

                            {renderInput('Landmark (Optional)', 'landmark', 'Landmark')}
                            {renderInput('Alternate Phone (Optional)', 'alternatePhone', 'Phone', 'phone-pad')}

                            <Text style={[styles.label, { color: colors.subText }]}>Address Type</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, { borderColor: colors.border }, formData.addressType === 'Home' && styles.typeBtnSelected]}
                                    onPress={() => setFormData({ ...formData, addressType: 'Home' })}
                                >
                                    <Text style={[styles.typeBtnText, { color: colors.subText }, formData.addressType === 'Home' && { color: colors.text }]}>Home</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, { borderColor: colors.border }, formData.addressType === 'Work' && styles.typeBtnSelected]}
                                    onPress={() => setFormData({ ...formData, addressType: 'Work' })}
                                >
                                    <Text style={[styles.typeBtnText, { color: colors.subText }, formData.addressType === 'Work' && { color: colors.text }]}>Work</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formFooter}>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={processing}>
                                    {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE ADDRESS</Text>}
                                </TouchableOpacity>
                                {address && (
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                        <Text style={styles.cancelBtnText}>CANCEL</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {address && (
                                <TouchableOpacity style={styles.deleteLink} onPress={handleDeleteAddress}>
                                    <Text style={styles.deleteLinkText}>Delete this address</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Step 2: Order Summary */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.subText }]}>Total Items</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{cart.length}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.subText }]}>Total Price</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>₹{totalPayable.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Step 3: Payment */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
                    <Text style={styles.sectionTitle}>Payment Options</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[styles.paymentMethod, paymentMethod === 'payu' && styles.paymentMethodSelected]}
                        onPress={() => setPaymentMethod('payu')}
                    >
                        <View style={[styles.radioOuter, { borderColor: colors.subText }]}>
                            {paymentMethod === 'payu' && <View style={[styles.radioInner, { backgroundColor: colors.text }]} />}
                        </View>
                        <View style={styles.paymentContent}>
                            <Text style={[styles.paymentName, { color: colors.text }]}>UPI / Credit / Debit / NetBanking</Text>
                            <Text style={[styles.paymentDesc, { color: colors.subText }]}>Pay securely via PayU</Text>
                        </View>
                        <FontAwesome5 name="cc-visa" size={20} color={colors.text} style={{ marginRight: 5 }} />
                        <FontAwesome5 name="cc-mastercard" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <TouchableOpacity
                        style={[styles.paymentMethod, paymentMethod === 'cod' && styles.paymentMethodSelected]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <View style={[styles.radioOuter, { borderColor: colors.subText }]}>
                            {paymentMethod === 'cod' && <View style={[styles.radioInner, { backgroundColor: colors.text }]} />}
                        </View>
                        <View style={styles.paymentContent}>
                            <Text style={[styles.paymentName, { color: colors.text }]}>Cash on Delivery</Text>
                            <Text style={[styles.paymentDesc, { color: colors.subText }]}>Pay when you receive the order</Text>
                        </View>
                        <MaterialIcons name="money" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Price Details Summary for Final Check */}
                <View style={[styles.billCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.billTitle, { color: colors.subText }]}>Price Details</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.text }]}>Price ({cart.length} items)</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.text }]}>Delivery Charges</Text>
                        <Text style={[styles.billValue, shippingCharge === 0 && { color: 'green' }]}>
                            {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                        </Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.text }]}>Tax (5%)</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>+ ₹{tax.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.billTotalRow}>
                        <Text style={[styles.billTotalLabel, { color: colors.text }]}>Amount Payable</Text>
                        <Text style={[styles.billTotalValue, { color: colors.text }]}>₹{totalPayable.toLocaleString()}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(12, insets.bottom + 12), backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View style={styles.bottomTotal}>
                    <Text style={styles.bottomTotalLabel}>{cart.length} items</Text>
                    <Text style={[styles.bottomTotalValue, { color: colors.text }]}>₹{totalPayable.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderBtn, (!address || processing) && styles.disabledBtn]}
                    onPress={handlePlaceOrder}
                    disabled={!address || processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.placeOrderText}>PLACE ORDER</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f3f6',
    },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 2,
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
    },
    container: {
        padding: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Sections
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    stepBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2874f0', // Flipkart blue
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#878787',
        flex: 1,
        textTransform: 'uppercase',
    },
    changeBtnText: {
        color: '#2874f0',
        fontWeight: '600',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 16,
        elevation: 1,
        marginBottom: 8,
    },
    // Address View
    addressNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginRight: 12,
    },
    addrTypeBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    addrTypeText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 14,
        color: '#212121',
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 14,
        color: '#212121',
        marginTop: 4,
    },
    // Form
    formContextTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#878787',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 10,
        fontSize: 14,
        color: '#212121',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    twoCol: {
        flexDirection: 'row',
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    typeBtn: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    typeBtnSelected: {
        borderColor: '#000',
        backgroundColor: '#f9f9f9',
    },
    typeBtnText: {
        fontSize: 12,
        color: '#666',
    },
    typeBtnTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
    formFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: '#fb641b', // Orange for save
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 2,
        flex: 1,
        alignItems: 'center',
        marginRight: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelBtn: {
        padding: 12,
    },
    cancelBtnText: {
        color: '#2874f0',
        fontWeight: '600',
    },
    deleteLink: {
        alignSelf: 'center',
        marginTop: 16,
    },
    deleteLinkText: {
        color: '#d32f2f',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    // Summary
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#212121',
        fontWeight: '500',
    },
    // Payment
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    paymentMethodSelected: {
        // backgroundColor: '#f9f9f9',
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#878787',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000',
    },
    paymentContent: {
        flex: 1,
    },
    paymentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212121',
    },
    paymentDesc: {
        fontSize: 12,
        color: '#878787',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    // Bill Card
    billCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 8,
        elevation: 1,
        marginBottom: 20,
    },
    billTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#878787',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 14,
        color: '#212121',
    },
    billValue: {
        fontSize: 14,
        color: '#212121',
    },
    billTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    billTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    billTotalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    // Bottom Bar (Sticky)
    bottomBar: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        elevation: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomTotal: {
        flex: 1,
        paddingLeft: 4,
    },
    bottomTotalLabel: {
        fontSize: 12,
        color: '#878787',
    },
    bottomTotalValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
    },
    placeOrderBtn: {
        backgroundColor: '#000', // Black as requested
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 2,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        elevation: 0,
    },
});

export default AddressScreen;
