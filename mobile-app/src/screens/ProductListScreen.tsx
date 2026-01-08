import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    Modal,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const ProductListScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    // params: category or search query
    const { category, subCategory, title, search } = route.params || {};

    const { addToCart, cartCount } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState('relevant'); // relevant, lowToHigh, highToLow, new

    // Filter State
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
    const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);

    const priceRanges = [
        { id: 1, label: '₹100–300', min: 100, max: 300 },
        { id: 2, label: '₹301–600', min: 301, max: 600 },
        { id: 3, label: '₹601–900', min: 601, max: 900 },
        { id: 4, label: '₹901–1200', min: 901, max: 1200 },
        { id: 5, label: '₹1201–1,500', min: 1201, max: 1500 },
        { id: 6, label: '₹1501–Above', min: 1501, max: Infinity },
    ];

    useEffect(() => {
        loadProducts();
    }, [category, subCategory, search]);

    useEffect(() => {
        applySortAndFilter();
    }, [products, sortOption, selectedPriceRanges, selectedFabrics]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            let data;
            if (search) {
                data = await api.searchProducts(search);
            } else if (category) {
                data = await api.getProductsByCategory(category);
            } else {
                data = await api.getProducts();
            }

            const loaded = Array.isArray(data) ? data : (data?.results || []);
            setProducts(loaded);
            setFilteredProducts(loaded);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    // Extract available fabrics dynamically
    const availableFabrics = useMemo(() => {
        const fabrics = new Set<string>();
        products.forEach(p => {
            const mat = p.product_info?.SareeMaterial || p.material || p.product_info?.fabric;
            if (mat) fabrics.add(mat);
        });
        return Array.from(fabrics);
    }, [products]);

    const applySortAndFilter = () => {
        let result = [...products];

        // Filter by Price
        if (selectedPriceRanges.length > 0) {
            result = result.filter(p => {
                const price = p.price || p.mrp || 0;
                return selectedPriceRanges.some(id => {
                    const range = priceRanges.find(r => r.id === id);
                    if (!range) return false;
                    return price >= range.min && price <= range.max;
                });
            });
        }

        // Filter by Fabric
        if (selectedFabrics.length > 0) {
            result = result.filter(p => {
                const mat = p.product_info?.SareeMaterial || p.material || p.product_info?.fabric || '';
                return selectedFabrics.includes(mat);
            });
        }

        // Sort
        if (sortOption === 'lowToHigh') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOption === 'highToLow') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOption === 'new') {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredProducts(result);
    };

    const togglePriceFilter = (id: number) => {
        if (selectedPriceRanges.includes(id)) {
            setSelectedPriceRanges(prev => prev.filter(i => i !== id));
        } else {
            setSelectedPriceRanges(prev => [...prev, id]);
        }
    };

    const toggleFabricFilter = (fabric: string) => {
        if (selectedFabrics.includes(fabric)) {
            setSelectedFabrics(prev => prev.filter(f => f !== fabric));
        } else {
            setSelectedFabrics(prev => [...prev, fabric]);
        }
    };

    const clearFilters = () => {
        setSelectedPriceRanges([]);
        setSelectedFabrics([]);
    };

    const handleWishlistToggle = (item: any) => {
        if (isInWishlist(item._id)) removeFromWishlist(item._id);
        else addToWishlist(item);
    };

    const renderProductCard = useCallback(({ item }: { item: any }) => {
        const price = item.price || item.mrp || 0;
        const mrp = item.mrp || 0;
        const discount = item.discountPercent || 0;
        const isWishlisted = isInWishlist(item._id);

        return (
            <Pressable
                style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.images?.image1 || 'https://via.placeholder.com/300' }}
                        style={styles.productImage}
                        resizeMode="cover"
                        defaultSource={require('../../assets/app_logo.png')}
                    />
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discount}%</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
                        onPress={(e) => { e.stopPropagation(); handleWishlistToggle(item); }}
                    >
                        <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={18} color={isWishlisted ? "#E91E63" : colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAddBtn}
                        onPress={(e) => { e.stopPropagation(); addToCart(item, 1); }}
                    >
                        <Ionicons name="cart-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.brandText, { color: colors.subText }]} numberOfLines={1}>{item.product_info?.brand || 'Sarisanskruti'}</Text>
                    <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceText, { color: colors.text }]}>₹{price.toLocaleString('en-IN')}</Text>
                        {mrp > price && <Text style={styles.mrpText}>₹{mrp}</Text>}
                    </View>
                </View>
            </Pressable>
        );
    }, [isInWishlist, addToCart, colors]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{title || (category ? t(category.replace(/-/g, '_').toLowerCase()) : t('collections'))}</Text>
                    <Text style={styles.headerSubtitle}>{filteredProducts.length} {t('items')}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ position: 'relative' }}>
                    <Ionicons name="cart-outline" size={24} color={colors.text} />
                    {cartCount > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Filter Sort Bar */}
            <View style={[styles.barContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.barButton} onPress={() => setSortModalVisible(true)}>
                    <MaterialIcons name="sort" size={20} color={colors.text} />
                    <Text style={[styles.barText, { color: colors.text }]}>{t('sort')}</Text>
                    {sortOption !== 'relevant' && <View style={styles.activeDot} />}
                </TouchableOpacity>
                <View style={[styles.barDivider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.barButton} onPress={() => setFilterModalVisible(true)}>
                    <Ionicons name="filter-outline" size={20} color={colors.text} />
                    <Text style={[styles.barText, { color: colors.text }]}>{t('filter')}</Text>
                    {(selectedPriceRanges.length > 0 || selectedFabrics.length > 0) && <View style={styles.activeDot} />}
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#E91E63" />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.listColumn}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="search-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>{t('no_results')}</Text>
                            <TouchableOpacity onPress={clearFilters} style={{ marginTop: 10 }}>
                                <Text style={{ color: '#E91E63' }}>{t('clear_filters')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Sort Modal */}
            <Modal visible={sortModalVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('sort_by')}</Text>
                        {['relevant', 'lowToHigh', 'highToLow', 'new'].map(opt => (
                            <TouchableOpacity key={opt} style={[styles.sortOption, { borderBottomColor: colors.border }]} onPress={() => { setSortOption(opt); setSortModalVisible(false); }}>
                                <Text style={[styles.sortText, sortOption === opt && styles.sortTextActive, { color: sortOption === opt ? '#E91E63' : colors.text }]}>
                                    {opt === 'relevant' ? t('sort_relevant') : opt === 'lowToHigh' ? t('sort_low_high') : opt === 'highToLow' ? t('sort_high_low') : t('sort_newest')}
                                </Text>
                                {sortOption === opt && <Ionicons name="checkmark" size={20} color="#E91E63" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Filter Modal */}
            <Modal visible={filterModalVisible} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('filters')}</Text>
                        <TouchableOpacity onPress={clearFilters}>
                            <Text style={styles.resetText}>{t('reset')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.filterScroll}>
                        {/* Price Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterTitle}>{t('price_range')}</Text>
                            <View style={styles.filterTags}>
                                {priceRanges.map(range => (
                                    <TouchableOpacity
                                        key={range.id}
                                        style={[styles.filterTag, selectedPriceRanges.includes(range.id) && styles.filterTagSelected]}
                                        onPress={() => togglePriceFilter(range.id)}
                                    >
                                        <Text style={[styles.filterTagText, selectedPriceRanges.includes(range.id) && styles.filterTagTextSelected]}>
                                            {range.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Fabric Filter */}
                        {availableFabrics.length > 0 && (
                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>{t('fabric')}</Text>
                                <View style={styles.filterTags}>
                                    {availableFabrics.map(fab => (
                                        <TouchableOpacity
                                            key={fab}
                                            style={[styles.filterTag, selectedFabrics.includes(fab) && styles.filterTagSelected]}
                                            onPress={() => toggleFabricFilter(fab)}
                                        >
                                            <Text style={[styles.filterTagText, selectedFabrics.includes(fab) && styles.filterTagTextSelected]}>
                                                {fab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
                            <Text style={styles.applyBtnText}>{t('apply')} ({filteredProducts.length} {t('items')})</Text>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        textTransform: 'capitalize',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
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
    },
    headerBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
    barContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        elevation: 2,
    },
    barButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E91E63',
        position: 'absolute',
        top: 8,
        right: 40,
    },
    barDivider: {
        width: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    barText: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#333',
        fontSize: 14,
    },
    listContent: {
        paddingVertical: 12,
    },
    listColumn: {
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    productCard: {
        width: '48%',
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    imageContainer: {
        aspectRatio: 0.75,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: '#E91E63',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    wishlistBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#fff',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    quickAddBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#212121',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    infoContainer: {
        padding: 10,
    },
    brandText: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    titleText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#212121',
        marginRight: 6,
    },
    mrpText: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        marginTop: 10,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    resetText: {
        color: '#E91E63',
        fontWeight: '600',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sortText: {
        fontSize: 16,
        color: '#333',
    },
    sortTextActive: {
        color: '#E91E63',
        fontWeight: 'bold',
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#fff',
    },
    filterScroll: {
        flex: 1,
        padding: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#212121',
    },
    filterTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterTagSelected: {
        backgroundColor: '#E91E6315',
        borderColor: '#E91E63',
    },
    filterTagText: {
        color: '#666',
        fontSize: 13,
    },
    filterTagTextSelected: {
        color: '#E91E63',
        fontWeight: 'bold',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    applyBtn: {
        backgroundColor: '#E91E63',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProductListScreen;
