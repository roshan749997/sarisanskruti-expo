import React, { useEffect, useState, useRef } from 'react';
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
    Animated,
    FlatList,
    StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;
    const insets = useSafeAreaInsets();
    const { colors, darkMode } = useTheme();

    const { addToCart, cartCount } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState<any>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [isAdding, setIsAdding] = useState(false);

    // Animation for header
    const scrollY = useRef(new Animated.Value(0)).current;

    const isWishlisted = product ? isInWishlist(product._id) : false;

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await api.getProductById(id);
            setProduct(data);

            // Load Similar
            if (data?.category) {
                api.getProductsByCategory(data.category).then(sim => {
                    if (Array.isArray(sim)) {
                        setSimilarProducts(sim.filter(p => p._id !== data._id).slice(0, 6));
                    }
                }).catch(e => console.log('Similar err', e));
            }
        } catch (e) {
            console.log('Error loading product', e);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            setIsAdding(true);
            await addToCart(product, 1);
            // Alert.alert('Success', 'Added to Cart'); // Context/Optimistic handles feedback
        } catch (error) {
            // handled
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigation.navigate('Cart');
    };

    const handleWishlist = () => {
        if (isWishlisted) removeFromWishlist(product._id);
        else addToWishlist(product);
    };

    const shareProduct = async () => {
        if (!product) return;
        try {
            await Share.share({
                message: `Check out ${product.title} on Sarisanskruti! ₹${product.price} only.`,
            });
        } catch (error) { console.log(error); }
    };

    if (loading || !product) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#E91E63" />
            </View>
        );
    }

    const images = [
        product.images?.image1,
        product.images?.image2,
        product.images?.image3,
        product.images?.image4
    ].filter(Boolean);

    const mrp = product.mrp || 0;
    const discountPercent = product.discountPercent || 0;
    const sellPrice = product.price || Math.round(mrp - (mrp * discountPercent) / 100);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Animated.View style={[styles.headerBg, { opacity: headerOpacity, backgroundColor: colors.background, shadowOpacity: darkMode ? 0 : 0.1 }]} />
                <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }]}>
                            <Ionicons name="arrow-back" size={24} color={darkMode ? '#fff' : '#333'} />
                        </TouchableOpacity>
                        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity, color: colors.text }]} numberOfLines={1}>
                            {product.title}
                        </Animated.Text>
                        <View style={styles.headerRight}>
                            <TouchableOpacity onPress={shareProduct} style={[styles.iconBtn, { backgroundColor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }]}>
                                <Ionicons name="share-social-outline" size={24} color={darkMode ? '#fff' : '#333'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={[styles.iconBtn, { backgroundColor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }]}>
                                <Ionicons name="cart-outline" size={24} color={darkMode ? '#fff' : '#333'} />
                                {cartCount > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: (insets.top || 44) + 56 }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImageIndex(index);
                        }}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="contain" />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <View style={styles.pagination}>
                        {images.map((_, i) => (
                            <View key={i} style={[styles.paginationDot, i === activeImageIndex && styles.paginationDotActive]} />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.wishlistFab} onPress={handleWishlist}>
                        <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={24} color={isWishlisted ? "#E91E63" : "#333"} />
                    </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={[styles.infoContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.brandText, { color: colors.subText }]}>{product.product_info?.brand || 'Sarisanskruti'}</Text>
                    <Text style={[styles.titleText, { color: colors.text }]}>{product.title}</Text>

                    <View style={styles.priceRow}>
                        <Text style={[styles.priceText, { color: colors.text }]}>₹{sellPrice.toLocaleString('en-IN')}</Text>
                        {mrp > sellPrice && (
                            <Text style={styles.mrpText}>₹{mrp.toLocaleString('en-IN')}</Text>
                        )}
                        {discountPercent > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.taxText}>Inclusive of all taxes</Text>
                </View>

                {/* Sizes (Mock) */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Size</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeScroll}>
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <TouchableOpacity
                                key={size}
                                style={[styles.sizeBox, selectedSize === size && styles.sizeBoxSelected, { borderColor: selectedSize === size ? '#E91E63' : colors.border }]}
                                onPress={() => setSelectedSize(size)}
                            >
                                <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected, { color: selectedSize === size ? '#fff' : colors.text }]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Details */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.subText }]}>Material</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{product.product_info?.SareeMaterial || product.material || 'Silk Blend'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.subText }]}>Color</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{product.product_info?.SareeColor || product.color || 'Multicolor'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.subText }]}>Pattern</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{product.product_info?.Pattern || 'Traditional'}</Text>
                    </View>
                    <Text style={[styles.descriptionText, { color: colors.subText }]}>
                        {product.description || 'Experience elegance with this premium quality saree, crafted to perfection for special occasions.'}
                    </Text>
                </View>

                {/* Delivery Info */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <View style={styles.deliveryRow}>
                        <Ionicons name="cube-outline" size={20} color={colors.subText} />
                        <Text style={[styles.deliveryText, { color: colors.text }]}>7 Day Return & Exchange</Text>
                    </View>
                    <View style={styles.deliveryRow}>
                        <Ionicons name="card-outline" size={20} color={colors.subText} />
                        <Text style={[styles.deliveryText, { color: colors.text }]}>Cash on Delivery Available</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.cartBtn, { backgroundColor: colors.background, borderColor: colors.text }]} onPress={handleAddToCart} disabled={isAdding}>
                    {isAdding ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.cartBtnText, { color: colors.text }]}>ADD TO CART</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buyBtn, { backgroundColor: colors.text }]} onPress={handleBuyNow}>
                    <Text style={[styles.buyBtnText, { color: colors.background }]}>BUY NOW</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 16,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)', // semi transparent for images
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        flexDirection: 'row',
    },
    scrollContent: {
        paddingTop: 0,
    },
    galleryContainer: {
        width: width,
        height: width, // Square aspect ratio
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: '100%',
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#E91E63',
        width: 20,
    },
    wishlistFab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#fff',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    infoContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    brandText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    titleText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#212121',
        marginBottom: 8,
        lineHeight: 26,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    priceText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginRight: 8,
    },
    mrpText: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountBadge: {
        backgroundColor: '#E91E6315', // light pink
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    taxText: {
        fontSize: 12,
        color: '#009688', // Teal
        marginTop: 4,
    },
    section: {
        padding: 16,
        borderTopWidth: 8,
        borderTopColor: '#f9f9f9',
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    sizeScroll: {
        flexDirection: 'row',
    },
    sizeBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sizeBoxSelected: {
        borderColor: '#E91E63',
        backgroundColor: '#E91E63',
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    sizeTextSelected: {
        color: '#fff',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        width: 100,
        color: '#666',
        fontSize: 14,
    },
    detailValue: {
        flex: 1,
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    descriptionText: {
        marginTop: 12,
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    deliveryText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#333',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cartBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#212121',
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cartBtnText: {
        fontWeight: 'bold',
        color: '#212121',
        fontSize: 14,
    },
    buyBtn: {
        flex: 1,
        backgroundColor: '#212121',
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buyBtnText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 14,
    },
    headerBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#E91E63',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        zIndex: 10,
    },
    headerBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
});

export default ProductDetailScreen;
