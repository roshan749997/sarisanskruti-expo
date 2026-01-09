import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const InvoiceDownloadScreen = ({ navigation }: any) => {
    const { colors, darkMode } = useTheme();
    const { user: contextUser } = useAuth();
    const user = contextUser?.user || contextUser;

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [currentOrder, setCurrentOrder] = useState<any>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setRefreshing(true);
            const ordersData = await api.getMyOrders();
            setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return { text: '#2E7D32', bg: '#E8F5E9' };
            case 'Cancelled': return { text: '#C62828', bg: '#FFEBEE' };
            default: return { text: '#2874F0', bg: '#E3F2FD' };
        }
    };

    const generateInvoicePDF = async (order: any) => {
        try {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const itemsHTML = order.items.map((item: any, index: number) => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product?.title || 'Product'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.quantity * item.price}</td>
                </tr>
            `).join('');

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
                            margin: 0;
                            padding: 20px;
                            padding-top: 40px;
                            padding-bottom: 40px;
                            color: #333;
                            background: #fff;
                            font-size: 14px;
                            line-height: 1.6;
                        }
                        
                        .invoice-container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: white;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 4px solid #2874F0;
                            padding-bottom: 20px;
                        }
                        
                        .company-name {
                            font-size: 36px;
                            font-weight: bold;
                            color: #2874F0;
                            margin-bottom: 8px;
                            letter-spacing: 2px;
                        }
                        
                        .company-tagline {
                            font-size: 13px;
                            color: #666;
                            margin-bottom: 15px;
                            font-style: italic;
                        }
                        
                        .invoice-title {
                            font-size: 28px;
                            color: #444;
                            margin-top: 15px;
                            font-weight: 600;
                            letter-spacing: 1px;
                        }
                        
                        .info-section {
                            display: table;
                            width: 100%;
                            margin-bottom: 30px;
                        }
                        
                        .info-box {
                            display: table-cell;
                            width: 48%;
                            vertical-align: top;
                            padding: 15px;
                        }
                        
                        .info-box:first-child {
                            padding-left: 0;
                        }
                        
                        .info-box:last-child {
                            padding-right: 0;
                            text-align: right;
                        }
                        
                        .info-label {
                            font-weight: bold;
                            color: #2874F0;
                            margin-bottom: 12px;
                            font-size: 13px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-bottom: 2px solid #2874F0;
                            padding-bottom: 5px;
                            display: inline-block;
                        }
                        
                        .info-text {
                            margin: 6px 0;
                            font-size: 13px;
                            line-height: 1.8;
                            color: #555;
                        }
                        
                        .info-text strong {
                            color: #333;
                            font-weight: 600;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 25px 0;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        
                        thead {
                            background: linear-gradient(135deg, #2874F0 0%, #1565C0 100%);
                        }
                        
                        th {
                            color: white;
                            padding: 14px 12px;
                            text-align: left;
                            font-weight: 600;
                            font-size: 13px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        td {
                            padding: 12px;
                            border-bottom: 1px solid #e0e0e0;
                            font-size: 13px;
                        }
                        
                        tbody tr:hover {
                            background-color: #f5f5f5;
                        }
                        
                        tbody tr:last-child td {
                            border-bottom: 2px solid #2874F0;
                        }
                        
                        .text-center {
                            text-align: center;
                        }
                        
                        .text-right {
                            text-align: right;
                        }
                        
                        .total-section {
                            margin-top: 30px;
                            float: right;
                            width: 350px;
                        }
                        
                        .total-row {
                            display: table;
                            width: 100%;
                            margin: 10px 0;
                            font-size: 14px;
                        }
                        
                        .total-label {
                            display: table-cell;
                            text-align: right;
                            padding-right: 25px;
                            color: #666;
                            font-weight: 500;
                        }
                        
                        .total-value {
                            display: table-cell;
                            text-align: right;
                            font-weight: bold;
                            color: #333;
                            width: 120px;
                        }
                        
                        .grand-total {
                            font-size: 18px;
                            border-top: 3px solid #2874F0;
                            padding-top: 12px;
                            margin-top: 12px;
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 5px;
                        }
                        
                        .grand-total .total-label {
                            color: #2874F0;
                            font-weight: 700;
                        }
                        
                        .grand-total .total-value {
                            color: #2874F0;
                            font-size: 22px;
                        }
                        
                        .footer {
                            margin-top: 60px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-top: 2px solid #e0e0e0;
                            padding-top: 25px;
                            clear: both;
                        }
                        
                        .footer p {
                            margin: 8px 0;
                        }
                        
                        .footer strong {
                            color: #2874F0;
                            font-size: 14px;
                        }
                        
                        .status-badge {
                            display: inline-block;
                            padding: 6px 16px;
                            border-radius: 20px;
                            background-color: #4CAF50;
                            color: white;
                            font-size: 12px;
                            font-weight: bold;
                            margin-top: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .divider {
                            height: 2px;
                            background: linear-gradient(to right, transparent, #2874F0, transparent);
                            margin: 20px 0;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                            }
                            .invoice-container {
                                box-shadow: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <div class="header">
                            <div class="company-name">SARI SANSKRUTI</div>
                            <div class="company-tagline">Traditional Elegance, Modern Style</div>
                            <div class="invoice-title">TAX INVOICE</div>
                        </div>

                        <div class="info-section">
                            <div class="info-box">
                                <div class="info-label">Invoice To:</div>
                                <div class="info-text"><strong>${order.address?.fullName || user?.name || 'Customer'}</strong></div>
                                <div class="info-text">${order.address?.address || 'N/A'}</div>
                                <div class="info-text">${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}</div>
                                <div class="info-text"><strong>Mobile:</strong> ${order.address?.mobileNumber || user?.phone || 'N/A'}</div>
                                <div class="info-text"><strong>Email:</strong> ${user?.email || 'N/A'}</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">Invoice Details:</div>
                                <div class="info-text"><strong>Invoice #:</strong> ${order._id?.substring(0, 12).toUpperCase()}</div>
                                <div class="info-text"><strong>Order Date:</strong> ${orderDate}</div>
                                <div class="info-text"><strong>Payment:</strong> ${order.paymentMethod || 'Online'}</div>
                                <div class="status-badge">${order.status || 'Processing'}</div>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 8%;">S.No</th>
                                    <th style="width: 42%;">Product Description</th>
                                    <th style="width: 15%; text-align: center;">Quantity</th>
                                    <th style="width: 17%; text-align: right;">Unit Price</th>
                                    <th style="width: 18%; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>

                        <div class="total-section">
                            <div class="total-row">
                                <div class="total-label">Subtotal:</div>
                                <div class="total-value">₹${order.amount.toFixed(2)}</div>
                            </div>
                            <div class="total-row">
                                <div class="total-label">Shipping Charges:</div>
                                <div class="total-value">₹0.00</div>
                            </div>
                            <div class="total-row">
                                <div class="total-label">Tax (GST 18%):</div>
                                <div class="total-value">₹${(order.amount * 0.18).toFixed(2)}</div>
                            </div>
                            <div class="total-row grand-total">
                                <div class="total-label">Grand Total:</div>
                                <div class="total-value">₹${(order.amount * 1.18).toFixed(2)}</div>
                            </div>
                        </div>

                        <div class="footer">
                            <p><strong>Thank you for shopping with Sari Sanskruti!</strong></p>
                            <p>For any queries, please contact us at:</p>
                            <p>📧 support@sarisanskruti.com | 📞 +91-1234567890</p>
                            <p style="margin-top: 20px; font-size: 11px; color: #999;">
                                This is a computer-generated invoice and does not require a physical signature.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return html;
        } catch (error) {
            console.error('Error generating invoice HTML:', error);
            throw error;
        }
    };

    const downloadInvoice = async (order: any) => {
        try {
            setLoading(true);

            const html = await generateInvoicePDF(order);

            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });

            console.log('PDF generated at:', uri);

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();

            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save or Share Invoice',
                    UTI: 'com.adobe.pdf'
                });

                // Don't show alert if user cancels share dialog
                console.log('Share dialog completed');
            } else {
                Alert.alert('Success', `Invoice generated successfully!\n\nFile saved at: ${uri}`);
            }
        } catch (error: any) {
            console.error('Error downloading invoice:', error);

            let errorMessage = 'Failed to download invoice. Please try again.';

            if (error.message?.includes('Printing did not complete')) {
                errorMessage = 'PDF generation is not supported on iOS Simulator.\n\nPlease test on a real device or use Preview option to view the invoice.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInvoiceAction = (order: any) => {
        Alert.alert(
            'Invoice Options',
            `Order #${order._id?.substring(0, 8).toUpperCase()}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: '📥 Download PDF',
                    onPress: () => downloadInvoice(order)
                },
                {
                    text: '👁️ Preview',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const html = await generateInvoicePDF(order);
                            setPreviewHtml(html);
                            setCurrentOrder(order);
                            setPreviewModalVisible(true);
                        } catch (error: any) {
                            console.error('Preview error:', error);
                            Alert.alert('Error', 'Failed to generate preview');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

            {/* Header with Back Button */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Download Invoices</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
                        {orders.length} {orders.length === 1 ? 'invoice' : 'invoices'} available
                    </Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="document-text" size={28} color="#2874F0" />
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadOrders}
                    />
                }
            >
                {orders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="receipt-outline" size={80} color={colors.subText} opacity={0.3} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Invoices Yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
                            Your order invoices will appear here
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoBanner}>
                            <Ionicons name="information-circle" size={20} color="#2874F0" />
                            <Text style={styles.infoText}>
                                Tap on any order to download or preview invoice
                            </Text>
                        </View>

                        {orders.map((order, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.invoiceCard, { backgroundColor: colors.card }]}
                                onPress={() => handleInvoiceAction(order)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBadge}>
                                        <Ionicons name="document-text" size={24} color="#2874F0" />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={[styles.orderId, { color: colors.text }]}>
                                            Order #{order._id?.substring(0, 8).toUpperCase()}
                                        </Text>
                                        <Text style={[styles.orderDate, { color: colors.subText }]}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                    <View style={styles.cardRight}>
                                        <Text style={[styles.amount, { color: colors.text }]}>₹{order.amount}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status).bg }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(order.status).text }]}>
                                                {order.status || 'Processing'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <View style={styles.cardFooter}>
                                    <View style={styles.footerInfo}>
                                        <Ionicons name="cube-outline" size={14} color={colors.subText} />
                                        <Text style={[styles.footerText, { color: colors.subText }]}>
                                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                        </Text>
                                    </View>
                                    <View style={styles.footerInfo}>
                                        <Ionicons name="card-outline" size={14} color={colors.subText} />
                                        <Text style={[styles.footerText, { color: colors.subText }]}>
                                            {order.paymentMethod || 'Online'}
                                        </Text>
                                    </View>
                                    <View style={styles.downloadButton}>
                                        <Ionicons name="download-outline" size={16} color="#2874F0" />
                                        <Text style={styles.downloadText}>Download</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>

            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#2874F0" />
                </View>
            )}

            {/* Preview Modal */}
            <Modal
                visible={previewModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setPreviewModalVisible(false)}
            >
                <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
                    <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

                    {/* Preview Header */}
                    <View style={[styles.previewHeader, { backgroundColor: colors.card }]}>
                        <TouchableOpacity
                            onPress={() => setPreviewModalVisible(false)}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Invoice Preview</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
                                Order #{currentOrder?._id?.substring(0, 8).toUpperCase()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setPreviewModalVisible(false);
                                if (currentOrder) {
                                    downloadInvoice(currentOrder);
                                }
                            }}
                            style={styles.downloadIconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="download" size={24} color="#2874F0" />
                        </TouchableOpacity>
                    </View>

                    {/* WebView for Preview */}
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: previewHtml }}
                        style={{ flex: 1, backgroundColor: colors.background }}
                        scalesPageToFit={true}
                        showsVerticalScrollIndicator={true}
                        contentInsetAdjustmentBehavior="automatic"
                        automaticallyAdjustContentInsets={true}
                    />

                    {/* Action Buttons */}
                    <View style={[styles.previewActions, { backgroundColor: colors.card }]}>
                        <TouchableOpacity
                            style={[styles.previewActionBtn, { backgroundColor: '#f5f5f5' }]}
                            onPress={() => setPreviewModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#666" />
                            <Text style={[styles.previewActionText, { color: '#666' }]}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.previewActionBtn, { backgroundColor: '#2874F0' }]}
                            onPress={() => {
                                setPreviewModalVisible(false);
                                if (currentOrder) {
                                    downloadInvoice(currentOrder);
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="download-outline" size={20} color="#fff" />
                            <Text style={[styles.previewActionText, { color: '#fff' }]}>Download PDF</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    headerIcon: {
        marginLeft: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconContainer: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        color: '#1976D2',
    },
    invoiceCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 6,
    },
    downloadText: {
        fontSize: 12,
        color: '#2874F0',
        fontWeight: '600',
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    downloadIconButton: {
        padding: 8,
        marginLeft: 12,
    },
    previewActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
    },
    previewActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        gap: 8,
    },
    previewActionText: {
        fontSize: 15,
        fontWeight: '600',
    },
});

export default InvoiceDownloadScreen;
