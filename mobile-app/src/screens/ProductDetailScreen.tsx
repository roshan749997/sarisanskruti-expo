import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Share,
    Alert,
    Platform,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false); // Start false for instant UI
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await api.getProductById(id);
            setProduct(data);
        } catch (e) {
            console.log('Error loading product', e);
            Alert.alert('Error', 'Failed to load product details');
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            setIsAdding(true);
            await addToCart(product._id);
            // Alert removed for faster process
        } catch (error) {
            // handled in context
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigation.navigate('Cart');
    };

    const shareProduct = async () => {
        if (!product) return;
        try {
            await Share.share({
                message: `Check out this product: ${product.title}`,
            });
        } catch (error) {
            console.log('Error sharing', error);
        }
    };

    // Don't show "not found" during initial load - just wait for data
    if (!product) return null;

    const images = [
        product.images?.image1,
        product.images?.image2,
        product.images?.image3,
        product.images?.image4
    ].filter(Boolean);

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    // Price Calculation
    const mrp = product.mrp || 0;
    const discountPercent = product.discountPercent || 0;
    const sellingPrice = product.price || Math.round(mrp - (mrp * discountPercent) / 100);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity onPress={shareProduct} style={styles.headerIcon}>
                            <Ionicons name="share-social-outline" size={24} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerIcon}>
                            <Ionicons name="cart-outline" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Image Carousel (Simplified as horizontal scroll) */}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                            setActiveImageIndex(slide);
                        }}
                        style={styles.imageScroll}
                    >
                        {images.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.productImage} resizeMode="contain" />
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {images.map((_, index) => (
                            <View key={index} style={[styles.dot, index === activeImageIndex && styles.activeDot]} />
                        ))}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <Text style={styles.title}>{product.title}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.sellingPrice}>₹{sellingPrice.toLocaleString('en-IN')}</Text>
                            {mrp > sellingPrice && <Text style={styles.mrp}>₹{mrp.toLocaleString('en-IN')}</Text>}
                            {discountPercent > 0 && <Text style={styles.discount}>({discountPercent}% OFF)</Text>}
                        </View>

                        {/* Ratings */}
                        <View style={styles.ratingRow}>
                            <View style={{ flexDirection: 'row' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Ionicons key={star} name={star <= 4 ? "star" : "star-outline"} size={16} color="#FFD700" />
                                ))}
                            </View>
                            <Text style={styles.ratingText}>4 out of 5 (24 Reviews)</Text>
                        </View>
                    </View>

                    {/* Size Selector */}
                    {(() => {
                        const category = (product.category || '').toLowerCase();
                        const categoriesWithSize = ['men', 'women', 'boys', 'girls', 'sishu', 'collection'];
                        const categoriesWithoutSize = ['silk', 'cotton', 'regional', 'banarasi', 'designer sarees', 'printed sarees', 'jewellery'];

                        const showSize = !categoriesWithoutSize.some(cat => category.includes(cat)) && categoriesWithSize.some(cat => category.includes(cat));

                        if (showSize) {
                            return (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Select Size</Text>
                                    <View style={styles.sizeRow}>
                                        {sizes.map((size) => (
                                            <TouchableOpacity
                                                key={size}
                                                style={[styles.sizeBox, selectedSize === size && styles.selectedSizeBox]}
                                                onPress={() => setSelectedSize(size)}
                                            >
                                                <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            );
                        }
                        return null;
                    })()}

                    {/* Shipping Info */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={20} color="green" />
                            <Text style={{ marginLeft: 5, color: '#333' }}>Free shipping on orders over ₹1,000</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>

                    {/* Product Details Table */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.detailsContainer}>
                            {[
                                { label: 'Brand', value: product.product_info?.brand },
                                { label: 'Manufacturer', value: product.product_info?.manufacturer },
                                { label: 'Category', value: product.category },
                                { label: 'Material', value: product.product_info?.KurtiMaterial || product.product_info?.SareeMaterial },
                                { label: 'Color', value: product.product_info?.KurtiColor || product.product_info?.SareeColor },
                                { label: 'Length', value: product.product_info?.KurtiLength || product.product_info?.SareeLength },
                                { label: 'Included', value: product.product_info?.IncludedComponents }
                            ].map((item, idx) => (
                                item.value ? (
                                    <View key={idx} style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{item.label}</Text>
                                        <Text style={styles.detailValue}>{item.value}</Text>
                                    </View>
                                ) : null
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 180 }} />
                </ScrollView>

                {/* Bottom Action Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.addToCartButton]}
                        onPress={handleAddToCart}
                        disabled={isAdding}
                    >
                        <Text style={styles.addToCartText}>{isAdding ? 'Adding...' : 'Add to Cart'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.buyNowButton]} onPress={handleBuyNow}>
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    rightIcons: {
        flexDirection: 'row',
    },
    headerIcon: {
        padding: 5,
        marginLeft: 10,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageScroll: {
        width: width,
        height: 400,
    },
    productImage: {
        width: width,
        height: 400,
        backgroundColor: '#f9f9f9',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#D4AF37',
    },
    infoSection: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    sellingPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    mrp: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 10,
    },
    discount: {
        fontSize: 16,
        color: 'green',
        marginLeft: 10,
        fontWeight: '600',
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    sizeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    sizeBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedSizeBox: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    sizeText: {
        color: '#333',
    },
    selectedSizeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    detailLabel: {
        flex: 1,
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        flex: 2,
        color: '#333',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 80, // Extra padding for tab bar
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 10,
    },
    buyNowButton: {
        backgroundColor: '#000',
    },
    addToCartText: {
        color: '#000',
        fontWeight: '600',
    },
    buyNowText: {
        color: '#fff',
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    detailsContainer: {
        marginTop: 5,
    },
});

export default ProductDetailScreen;
