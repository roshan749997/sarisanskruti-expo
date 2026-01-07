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
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const AddressScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, cartTotal, loading: cartLoading, clearCart } = useCart();

    // State
    const [loading, setLoading] = useState(false); // Start false for instant UI
    const [address, setAddress] = useState<any>(null); // Saved address
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        pincode: '110034',
        locality: 'Netaji Subhash Place',
        address: '365, 3rd Floor, H9, Vardhman Corporate Plaza',
        city: 'Pitampura',
        state: 'Delhi',
        landmark: '',
        alternatePhone: '',
        addressType: 'Home'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'payu' | 'cod'>('payu');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadAddress();
    }, []);

    const loadAddress = async () => {
        try {
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
            setIsEditing(true); // If no address, show form
        }
    };

    const handleSaveAddress = async () => {
        // Basic validation
        if (!formData.fullName || !formData.mobileNumber || !formData.pincode || !formData.address || !formData.city || !formData.state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setProcessing(true);
            // If address exists, update? API docs show saveMyAddress (POST) generally creates/overwrites
            // Frontend uses saveMyAddress (POST) which likely handles upsert or logic.
            const res = await api.saveMyAddress(formData);
            setAddress(res.data ? res.data : res); // Depending on API response structure
            setIsEditing(false);

            // Refresh address data clearly
            const fresh = await api.getMyAddress();
            setAddress(fresh);

            Alert.alert('Success', 'Address saved successfully');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save address');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (!address?._id) return;
        try {
            setProcessing(true);
            await api.deleteAddressById(address._id);
            setAddress(null);
            setFormData({ ...formData, fullName: '', mobileNumber: '' }); // Clear some fields
            setIsEditing(true);
        } catch (e) {
            Alert.alert('Error', 'Failed to delete address');
        } finally {
            setProcessing(false);
        }
    };

    // Price Calculation Logic from Frontend
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
                // PayU
                // We need email, often from user profile
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

    const renderInput = (label, field, placeholder, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={formData[field]}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                placeholder={placeholder}
                keyboardType={keyboardType as any}
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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f1f3f6" />
            <ScrollView style={styles.container}>
                {/* Steps Header */}
                <View style={styles.stepHeader}>
                    <Text style={styles.stepText}>1. DELIVERY ADDRESS</Text>
                </View>

                <View style={styles.card}>
                    {address && !isEditing ? (
                        <View>
                            <View style={styles.addressHeader}>
                                <Text style={styles.nameText}>{address.fullName}</Text>
                                <View style={styles.tag}><Text style={styles.tagText}>{address.addressType}</Text></View>
                            </View>
                            <Text style={styles.addressText}>{address.address}, {address.locality}</Text>
                            <Text style={styles.addressText}>{address.city}, {address.state} - {address.pincode}</Text>
                            <Text style={styles.addressText}>Mobile: {address.mobileNumber}</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                                    <Text style={styles.editBtnText}>EDIT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.formTitle}>Add New Address</Text>
                            {renderInput('Full Name', 'fullName', 'Enter Name')}
                            {renderInput('Mobile', 'mobileNumber', '10-digit number', 'phone-pad')}

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>{renderInput('Pincode', 'pincode', '6-digit', 'numeric')}</View>
                                <View style={{ flex: 1 }}>{renderInput('Locality', 'locality', 'Locality')}</View>
                            </View>

                            {renderInput('Address (Area and Street)', 'address', 'Address', 'default')}

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>{renderInput('City', 'city', 'City')}</View>
                                <View style={{ flex: 1 }}>{renderInput('State', 'state', 'State')}</View>
                            </View>

                            {renderInput('Landmark (Optional)', 'landmark', 'Landmark')}
                            {renderInput('Alt Phone (Optional)', 'alternatePhone', 'Alt Phone', 'phone-pad')}

                            <Text style={styles.label}>Address Type</Text>
                            <View style={styles.radioRow}>
                                <TouchableOpacity
                                    style={[styles.radioBtn, formData.addressType === 'Home' && styles.radioSelected]}
                                    onPress={() => setFormData({ ...formData, addressType: 'Home' })}
                                >
                                    <Text style={[styles.radioText, formData.addressType === 'Home' && styles.radioTextSelected]}>Home</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.radioBtn, formData.addressType === 'Work' && styles.radioSelected]}
                                    onPress={() => setFormData({ ...formData, addressType: 'Work' })}
                                >
                                    <Text style={[styles.radioText, formData.addressType === 'Work' && styles.radioTextSelected]}>Work</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formActions}>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={processing}>
                                    <Text style={styles.saveBtnText}>{processing ? 'Saving...' : 'SAVE ADDRESS'}</Text>
                                </TouchableOpacity>
                                {address && (
                                    <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                                        <Text style={styles.cancelBtnText}>CANCEL</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Step 2: Payment */}
                <View style={[styles.stepHeader, { marginTop: 20 }]}>
                    <Text style={styles.stepText}>2. PRICE DETAILS & PAYMENT</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Price ({cart.length} items)</Text>
                        <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Shipping</Text>
                        <Text style={[styles.priceValue, shippingCharge === 0 && { color: 'green' }]}>
                            {shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tax (5%)</Text>
                        <Text style={styles.priceValue}>₹{tax.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{totalPayable.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subHeader}>Select Payment Method</Text>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'payu' && styles.paymentSelected]}
                        onPress={() => setPaymentMethod('payu')}
                    >
                        <View style={[styles.radioCircle, paymentMethod === 'payu' && styles.radioCircleSelected]} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentTitle}>Online Payment (PayU)</Text>
                            <Text style={styles.paymentSub}>Credit/Debit Card, UPI, NetBanking</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentSelected]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <View style={[styles.radioCircle, paymentMethod === 'cod' && styles.radioCircleSelected]} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
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

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f3f6',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#f1f3f6',
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stepHeader: {
        backgroundColor: '#000',
        padding: 15,
        marginBottom: 0,
        borderRadius: 4,
    },
    stepText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
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
    addressText: {
        color: '#333',
        marginBottom: 4,
        fontSize: 14,
    },
    actionRow: {
        marginTop: 15,
        flexDirection: 'row',
    },
    editBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 4,
    },
    editBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Form Styles
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
    },
    radioRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 4,
    },
    radioSelected: {
        borderColor: '#000',
        backgroundColor: '#f9f9f9',
    },
    radioText: {
        fontSize: 14,
        color: '#333',
    },
    radioTextSelected: {
        fontWeight: 'bold',
    },
    formActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 4,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: 'bold',
    },
    // Price Styles
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceLabel: {
        color: '#333',
        fontSize: 14,
    },
    priceValue: {
        color: '#000',
        fontSize: 14,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    totalValue: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Payment Method Styles
    subHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#666',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 10,
    },
    paymentSelected: {
        borderColor: '#000',
        backgroundColor: '#fefefe',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    radioCircleSelected: {
        borderColor: '#000',
        backgroundColor: '#000',
    },
    paymentTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    paymentSub: {
        fontSize: 12,
        color: '#666',
    },
    footer: {
        marginTop: 20,
        marginBottom: 20,
    },
    placeOrderBtn: {
        backgroundColor: '#fb641b', // Flipkart orange roughly, distinct from save btn
        paddingVertical: 15,
        borderRadius: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    placeOrderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        elevation: 0,
    },
});

export default AddressScreen;
