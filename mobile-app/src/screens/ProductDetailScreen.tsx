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
    StatusBar,
    Pressable,
    TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;
    const insets = useSafeAreaInsets();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    const { addToCart, cartCount } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState<any>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [isAdding, setIsAdding] = useState(false);
    const [pincode, setPincode] = useState('');
    const [expandedSpec, setExpandedSpec] = useState(false);
    const [expandedReviews, setExpandedReviews] = useState(false);

    // Delivery options state
    const [checkingPincode, setCheckingPincode] = useState(false);
    const [pincodeChecked, setPincodeChecked] = useState(false);
    const [deliveryAvailable, setDeliveryAvailable] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
    const [isCodAvailable, setIsCodAvailable] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(0);

    // Animation for header
    const scrollY = useRef(new Animated.Value(0)).current;

    const isWishlisted = product ? isInWishlist(product._id) : false;

    // Mock data for enhanced features
    const rating = 4.3;
    const totalRatings = 1247;
    const totalReviews = 389;

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
                        setSimilarProducts(sim.filter(p => p._id !== data._id).slice(0, 10));
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

    // Pincode validation
    const validatePincode = (code: string): boolean => {
        // Indian pincode is 6 digits
        return /^[1-9][0-9]{5}$/.test(code);
    };

    // Calculate delivery date (3-7 business days)
    const calculateDeliveryDate = (pincode: string): Date => {
        const today = new Date();
        // Simulate different delivery times based on pincode
        const firstDigit = parseInt(pincode[0]);
        let daysToAdd = 3; // Default 3 days

        // Metro cities (pincode starting with 1,2,3,4,5,6) - faster delivery
        if (firstDigit >= 1 && firstDigit <= 6) {
            daysToAdd = 3;
        } else {
            // Other areas - slightly longer
            daysToAdd = 5;
        }

        // Add business days (skip weekends)
        let deliveryDate = new Date(today);
        let addedDays = 0;

        while (addedDays < daysToAdd) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            const dayOfWeek = deliveryDate.getDay();
            // Skip Sunday (0)
            if (dayOfWeek !== 0) {
                addedDays++;
            }
        }

        return deliveryDate;
    };

    // Check COD availability based on pincode and order value
    const checkCodAvailability = (pincode: string, orderValue: number): boolean => {
        // COD available for most pincodes, but not for very remote areas
        const firstDigit = parseInt(pincode[0]);

        // Remote areas (pincode starting with 8, 9) - COD not available for high value orders
        if ((firstDigit === 8 || firstDigit === 9) && orderValue > 5000) {
            return false;
        }

        return true;
    };

    // Calculate delivery charge
    const calculateDeliveryCharge = (pincode: string, orderValue: number): number => {
        // Free delivery above 999
        if (orderValue >= 999) {
            return 0;
        }

        const firstDigit = parseInt(pincode[0]);

        // Metro cities - lower charge
        if (firstDigit >= 1 && firstDigit <= 6) {
            return 50;
        }

        // Other areas - standard charge
        return 80;
    };

    // Handle pincode check
    const handleCheckPincode = async () => {
        if (!pincode.trim()) {
            Alert.alert('Invalid Pincode', 'Please enter a pincode');
            return;
        }

        if (!validatePincode(pincode)) {
            Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Indian pincode');
            return;
        }

        setCheckingPincode(true);

        // Simulate API call delay
        setTimeout(() => {
            const orderValue = product?.price || 0;

            // Check if delivery is available (simulate - most pincodes are serviceable)
            const isServiceable = true; // In real app, check against serviceable pincode list

            if (isServiceable) {
                const delDate = calculateDeliveryDate(pincode);
                const codAvailable = checkCodAvailability(pincode, orderValue);
                const charge = calculateDeliveryCharge(pincode, orderValue);

                setDeliveryAvailable(true);
                setDeliveryDate(delDate);
                setIsCodAvailable(codAvailable);
                setDeliveryCharge(charge);
                setPincodeChecked(true);
            } else {
                setDeliveryAvailable(false);
                setPincodeChecked(true);
                Alert.alert('Not Serviceable', 'Sorry, we do not deliver to this pincode yet.');
            }

            setCheckingPincode(false);
        }, 1000);
    };

    // Format delivery date
    const formatDeliveryDate = (date: Date): string => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];

        return `${day} ${month}, ${dayName}`;
    };

    // Change pincode
    const handleChangePincode = () => {
        setPincode('');
        setPincodeChecked(false);
        setDeliveryAvailable(false);
        setDeliveryDate(null);
        setIsCodAvailable(false);
        setDeliveryCharge(0);
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

    const renderSimilarProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.similarCard, { backgroundColor: colors.card, borderColor: darkMode ? '#333' : '#eee' }]}
            onPress={() => navigation.push('ProductDetail', { id: item._id })}
        >
            <Image source={{ uri: item.images?.image1 }} style={styles.similarImage} />
            <Text style={[styles.similarTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
            <Text style={[styles.similarPrice, { color: colors.text }]}>₹{item.price?.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{rating}</Text>
                            <FontAwesome name="star" size={12} color="#fff" style={{ marginLeft: 4 }} />
                        </View>
                        <Text style={[styles.ratingCount, { color: colors.subText }]}>
                            {totalRatings.toLocaleString()} Ratings & {totalReviews} Reviews
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={[styles.priceText, { color: colors.text }]}>₹{sellPrice.toLocaleString('en-IN')}</Text>
                        {mrp > sellPrice && (
                            <Text style={styles.mrpText}>₹{mrp.toLocaleString('en-IN')}</Text>
                        )}
                        {discountPercent > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{discountPercent}% {t('discount_off')}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.taxText}>{t('inclusive_taxes')}</Text>
                </View>

                {/* Offers */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Offers</Text>
                    <View style={[styles.offerCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                        <Ionicons name="pricetag" size={18} color="#388E3C" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.offerTitle, { color: colors.text }]}>Bank Offer</Text>
                            <Text style={[styles.offerDesc, { color: colors.subText }]}>10% instant discount on HDFC Bank Credit Cards</Text>
                        </View>
                    </View>
                    <View style={[styles.offerCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                        <Ionicons name="gift" size={18} color="#E91E63" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.offerTitle, { color: colors.text }]}>Special Price</Text>
                            <Text style={[styles.offerDesc, { color: colors.subText }]}>Get extra ₹500 off (price inclusive of discount)</Text>
                        </View>
                    </View>
                    <View style={[styles.offerCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                        <Ionicons name="wallet" size={18} color="#FF9800" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.offerTitle, { color: colors.text }]}>No Cost EMI</Text>
                            <Text style={[styles.offerDesc, { color: colors.subText }]}>No Cost EMI available on orders above ₹3000</Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Options */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Options</Text>

                    {/* Pincode Input */}
                    {!pincodeChecked ? (
                        <View style={[styles.deliveryInputRow, { borderColor: colors.border }]}>
                            <Ionicons name="location" size={20} color={colors.subText} />
                            <TextInput
                                style={[styles.pincodeInput, { color: colors.text }]}
                                placeholder="Enter Pincode"
                                placeholderTextColor={colors.subText}
                                value={pincode}
                                onChangeText={setPincode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <TouchableOpacity
                                onPress={handleCheckPincode}
                                disabled={checkingPincode}
                            >
                                {checkingPincode ? (
                                    <ActivityIndicator size="small" color="#E91E63" />
                                ) : (
                                    <Text style={styles.checkLink}>Check</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.pincodeCheckedRow, { backgroundColor: darkMode ? '#1a1a1a' : '#f0f9ff' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.pincodeCheckedLabel, { color: colors.subText }]}>Delivering to</Text>
                                <Text style={[styles.pincodeCheckedValue, { color: colors.text }]}>{pincode}</Text>
                            </View>
                            <TouchableOpacity onPress={handleChangePincode}>
                                <Text style={styles.changeLink}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Delivery Information - Show after pincode check */}
                    {pincodeChecked && deliveryAvailable && (
                        <>
                            {/* Delivery Date */}
                            {deliveryDate && (
                                <View style={styles.deliveryInfo}>
                                    <Ionicons name="time-outline" size={18} color="#2196F3" />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                            Delivery by {formatDeliveryDate(deliveryDate)}
                                        </Text>
                                        <Text style={[styles.deliverySubText, { color: colors.subText }]}>
                                            {deliveryCharge === 0 ? 'Free Delivery' : `₹${deliveryCharge} delivery charge`}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Free Delivery Info */}
                            {deliveryCharge === 0 && (
                                <View style={styles.deliveryInfo}>
                                    <Ionicons name="cube-outline" size={18} color="#388E3C" />
                                    <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                        Free Delivery on this order
                                    </Text>
                                </View>
                            )}

                            {/* COD Availability */}
                            <View style={styles.deliveryInfo}>
                                <Ionicons
                                    name={isCodAvailable ? "card-outline" : "close-circle-outline"}
                                    size={18}
                                    color={isCodAvailable ? "#FF9800" : "#999"}
                                />
                                <Text style={[styles.deliveryInfoText, { color: isCodAvailable ? colors.text : colors.subText }]}>
                                    {isCodAvailable ? 'Cash on Delivery available' : 'COD not available for this pincode'}
                                </Text>
                            </View>

                            {/* Return Policy */}
                            <View style={styles.deliveryInfo}>
                                <Ionicons name="refresh-outline" size={18} color="#9C27B0" />
                                <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                    7 Days Return & Exchange Policy
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Default Info - Show before pincode check */}
                    {!pincodeChecked && (
                        <>
                            <View style={styles.deliveryInfo}>
                                <Ionicons name="cube-outline" size={18} color="#388E3C" />
                                <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                    Free Delivery on orders above ₹999
                                </Text>
                            </View>
                            <View style={styles.deliveryInfo}>
                                <Ionicons name="time-outline" size={18} color="#2196F3" />
                                <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                    Enter pincode for delivery date
                                </Text>
                            </View>
                            <View style={styles.deliveryInfo}>
                                <Ionicons name="card-outline" size={18} color="#FF9800" />
                                <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                    Cash on Delivery available
                                </Text>
                            </View>
                            <View style={styles.deliveryInfo}>
                                <Ionicons name="refresh-outline" size={18} color="#9C27B0" />
                                <Text style={[styles.deliveryInfoText, { color: colors.text }]}>
                                    7 Days Return & Exchange Policy
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Sizes */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('select_size')}</Text>
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

                {/* Product Specifications */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <TouchableOpacity
                        style={styles.expandableHeader}
                        onPress={() => setExpandedSpec(!expandedSpec)}
                    >
                        <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.text }]}>Product Specifications</Text>
                        <Ionicons name={expandedSpec ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                    </TouchableOpacity>
                    {expandedSpec && (
                        <View style={{ marginTop: 12 }}>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Material</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>{product.product_info?.SareeMaterial || product.material || 'Silk Blend'}</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Color</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>{product.product_info?.SareeColor || product.color || 'Multicolor'}</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Pattern</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>{product.product_info?.Pattern || 'Traditional'}</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Occasion</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>Festive, Wedding, Party</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Care</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>Dry Clean Only</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Length</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>5.5 meters</Text>
                            </View>
                            <View style={[styles.specRow, { borderBottomColor: darkMode ? '#333' : '#f0f0f0' }]}>
                                <Text style={[styles.specLabel, { color: colors.subText }]}>Blouse</Text>
                                <Text style={[styles.specValue, { color: colors.text }]}>0.8 meter (included)</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Product Details */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('product_details')}</Text>
                    <Text style={[styles.descriptionText, { color: colors.subText }]}>
                        {product.description || 'Experience elegance with this premium quality saree, crafted to perfection for special occasions. Made from finest materials with intricate detailing, this saree is perfect for weddings, festivals, and celebrations. The vibrant colors and traditional patterns make it a timeless addition to your wardrobe.'}
                    </Text>
                </View>

                {/* Ratings & Reviews */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <TouchableOpacity
                        style={styles.expandableHeader}
                        onPress={() => setExpandedReviews(!expandedReviews)}
                    >
                        <View>
                            <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.text }]}>Ratings & Reviews</Text>
                            <View style={styles.ratingContainer}>
                                <View style={[styles.ratingBadge, { marginTop: 8 }]}>
                                    <Text style={styles.ratingText}>{rating}</Text>
                                    <FontAwesome name="star" size={12} color="#fff" style={{ marginLeft: 4 }} />
                                </View>
                                <Text style={[styles.ratingCount, { color: colors.subText }]}>
                                    {totalRatings.toLocaleString()} Ratings
                                </Text>
                            </View>
                        </View>
                        <Ionicons name={expandedReviews ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                    </TouchableOpacity>
                    {expandedReviews && (
                        <View style={{ marginTop: 16 }}>
                            {/* Rating Distribution */}
                            <View style={styles.ratingBar}>
                                <Text style={[styles.ratingStars, { color: colors.text }]}>5 ★</Text>
                                <View style={[styles.ratingBarBg, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                                    <View style={[styles.ratingBarFill, { width: '70%' }]} />
                                </View>
                                <Text style={[styles.ratingPercent, { color: colors.subText }]}>70%</Text>
                            </View>
                            <View style={styles.ratingBar}>
                                <Text style={[styles.ratingStars, { color: colors.text }]}>4 ★</Text>
                                <View style={[styles.ratingBarBg, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                                    <View style={[styles.ratingBarFill, { width: '20%' }]} />
                                </View>
                                <Text style={[styles.ratingPercent, { color: colors.subText }]}>20%</Text>
                            </View>
                            <View style={styles.ratingBar}>
                                <Text style={[styles.ratingStars, { color: colors.text }]}>3 ★</Text>
                                <View style={[styles.ratingBarBg, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                                    <View style={[styles.ratingBarFill, { width: '7%' }]} />
                                </View>
                                <Text style={[styles.ratingPercent, { color: colors.subText }]}>7%</Text>
                            </View>
                            <View style={styles.ratingBar}>
                                <Text style={[styles.ratingStars, { color: colors.text }]}>2 ★</Text>
                                <View style={[styles.ratingBarBg, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                                    <View style={[styles.ratingBarFill, { width: '2%' }]} />
                                </View>
                                <Text style={[styles.ratingPercent, { color: colors.subText }]}>2%</Text>
                            </View>
                            <View style={styles.ratingBar}>
                                <Text style={[styles.ratingStars, { color: colors.text }]}>1 ★</Text>
                                <View style={[styles.ratingBarBg, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                                    <View style={[styles.ratingBarFill, { width: '1%' }]} />
                                </View>
                                <Text style={[styles.ratingPercent, { color: colors.subText }]}>1%</Text>
                            </View>

                            {/* Sample Reviews */}
                            <View style={[styles.reviewCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewRating}>
                                        <Text style={styles.reviewRatingText}>5</Text>
                                        <FontAwesome name="star" size={10} color="#fff" style={{ marginLeft: 2 }} />
                                    </View>
                                    <Text style={[styles.reviewTitle, { color: colors.text }]}>Excellent Quality!</Text>
                                </View>
                                <Text style={[styles.reviewText, { color: colors.subText }]}>
                                    Beautiful saree with amazing quality. The fabric is soft and the colors are vibrant. Highly recommended!
                                </Text>
                                <Text style={[styles.reviewAuthor, { color: colors.subText }]}>Priya Sharma, 2 days ago</Text>
                            </View>

                            <View style={[styles.reviewCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewRating}>
                                        <Text style={styles.reviewRatingText}>4</Text>
                                        <FontAwesome name="star" size={10} color="#fff" style={{ marginLeft: 2 }} />
                                    </View>
                                    <Text style={[styles.reviewTitle, { color: colors.text }]}>Good Purchase</Text>
                                </View>
                                <Text style={[styles.reviewText, { color: colors.subText }]}>
                                    Nice saree for the price. Delivery was quick and packaging was good.
                                </Text>
                                <Text style={[styles.reviewAuthor, { color: colors.subText }]}>Anjali Patel, 1 week ago</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Similar Products</Text>
                        <FlatList
                            data={similarProducts}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={renderSimilarProduct}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingRight: 16 }}
                        />
                    </View>
                )}

                {/* Seller Information */}
                <View style={[styles.section, { backgroundColor: colors.background, borderTopColor: darkMode ? '#222' : '#f9f9f9' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Seller Information</Text>
                    <View style={[styles.sellerCard, { backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9' }]}>
                        <View style={styles.sellerHeader}>
                            <Text style={[styles.sellerName, { color: colors.text }]}>Sarisanskruti Official</Text>
                            <View style={styles.sellerBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#388E3C" />
                                <Text style={styles.sellerBadgeText}>Verified</Text>
                            </View>
                        </View>
                        <View style={styles.sellerStats}>
                            <View style={styles.sellerStat}>
                                <Text style={[styles.sellerStatValue, { color: colors.text }]}>4.5</Text>
                                <Text style={[styles.sellerStatLabel, { color: colors.subText }]}>Rating</Text>
                            </View>
                            <View style={styles.sellerStat}>
                                <Text style={[styles.sellerStatValue, { color: colors.text }]}>10K+</Text>
                                <Text style={[styles.sellerStatLabel, { color: colors.subText }]}>Products</Text>
                            </View>
                            <View style={styles.sellerStat}>
                                <Text style={[styles.sellerStatValue, { color: colors.text }]}>98%</Text>
                                <Text style={[styles.sellerStatLabel, { color: colors.subText }]}>Positive</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.cartBtn, { backgroundColor: colors.background, borderColor: colors.text }]} onPress={handleAddToCart} disabled={isAdding}>
                    {isAdding ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.cartBtnText, { color: colors.text }]}>{t('add_to_cart')}</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buyBtn, { backgroundColor: colors.text }]} onPress={handleBuyNow}>
                    <Text style={[styles.buyBtnText, { color: colors.background }]}>{t('buy_now')}</Text>
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
        backgroundColor: 'rgba(255,255,255,0.8)',
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
        gap: 8,
    },
    scrollContent: {
        paddingTop: 0,
    },
    galleryContainer: {
        width: width,
        height: width,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#388E3C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ratingCount: {
        fontSize: 12,
        color: '#666',
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
        backgroundColor: '#E91E6315',
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
        color: '#009688',
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
    offerCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    offerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    offerDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    deliveryInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    deliveryPincode: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    checkLink: {
        color: '#E91E63',
        fontWeight: '600',
        fontSize: 14,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    deliveryInfoText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#333',
    },
    pincodeInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    pincodeCheckedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    pincodeCheckedLabel: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
    },
    pincodeCheckedValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    changeLink: {
        color: '#E91E63',
        fontWeight: '600',
        fontSize: 14,
    },
    deliverySubText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
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
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    specLabel: {
        width: 120,
        fontSize: 14,
        color: '#666',
    },
    specValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    descriptionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingStars: {
        width: 40,
        fontSize: 12,
        color: '#333',
    },
    ratingBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#388E3C',
    },
    ratingPercent: {
        width: 40,
        textAlign: 'right',
        fontSize: 12,
        color: '#666',
    },
    reviewCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#388E3C',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 8,
    },
    reviewRatingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    reviewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    reviewText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    reviewAuthor: {
        fontSize: 11,
        color: '#999',
    },
    similarCard: {
        width: 140,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    similarImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#f5f5f5',
    },
    similarTitle: {
        fontSize: 12,
        color: '#333',
        padding: 8,
        paddingBottom: 4,
    },
    similarPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    sellerCard: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sellerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sellerBadgeText: {
        fontSize: 12,
        color: '#388E3C',
        fontWeight: '600',
    },
    sellerStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    sellerStat: {
        alignItems: 'center',
    },
    sellerStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    sellerStatLabel: {
        fontSize: 12,
        color: '#666',
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
