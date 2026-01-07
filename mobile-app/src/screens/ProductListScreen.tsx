import React, { useEffect, useState, useMemo } from 'react';
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
    SafeAreaView,
    Platform
} from 'react-native';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ProductListScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { category, subCategory, title } = route.params || {};

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // Start false for instant UI
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState('featured');

    // Filters
    const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
    const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);

    // Accordion State for Filters
    const [openFilterSections, setOpenFilterSections] = useState({
        price: true,
        material: true
    });

    const priceRanges = [
        { id: 1, label: '₹100–300', min: 100, max: 300 },
        { id: 2, label: '₹301–600', min: 301, max: 600 },
        { id: 3, label: '₹601–900', min: 601, max: 900 },
        { id: 4, label: '₹901–1200', min: 901, max: 1200 },
        { id: 5, label: '₹1201–1,500', min: 1201, max: 1500 },
        { id: 6, label: '₹1501–Above', min: 1501, max: Infinity },
    ];

    const allPossibleFabrics = [
        'Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Satin', 'Velvet', 'Organza',
        'Banarasi', 'Kanjivaram', 'Katan', 'Tussar', 'Maheshwari', 'Chanderi', 'Kota',
        'Gota Patti', 'Zari', 'Paithani', 'Bandhani', 'Leheriya', 'Patola', 'Jamdani'
    ]; // Condensed list for mobile

    useEffect(() => {
        loadProducts();
    }, [category, subCategory]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            let data;
            if (category) {
                data = await api.getProductsByCategory(category);
            } else {
                data = await api.getProducts();
            }
            const loadedProducts = Array.isArray(data) ? data : [];
            setProducts(loadedProducts);
            setFilteredProducts(loadedProducts);
        } catch (e) {
            console.log('Error loading products', e);
        } finally {
            setLoading(false);
        }
    };

    // Extract available fabrics from products
    const availableFabrics = useMemo(() => {
        const fabricSet = new Set();
        products.forEach(product => {
            const possibleFabricFields = [
                product.fabric,
                product.material,
                product.product_info?.fabric,
                product.product_info?.material,
                product.details?.fabric,
                product.details?.material,
            ];
            possibleFabricFields.forEach(field => {
                if (field) {
                    const fieldStr = String(field).toLowerCase();
                    allPossibleFabrics.forEach(fabric => {
                        if (fieldStr.includes(fabric.toLowerCase())) {
                            fabricSet.add(fabric);
                        }
                    });
                }
            });
        });
        if (fabricSet.size === 0) return ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen'];
        return Array.from(fabricSet).sort();
    }, [products]);

    // Apply Filter Logic
    useEffect(() => {
        let result = [...products];

        // Price Filter
        if (selectedPriceRange) {
            const range = priceRanges.find(r => r.id === selectedPriceRange);
            if (range) {
                result = result.filter(p => {
                    const price = p.price || (p.mrp - p.mrp * ((p.discountPercent || 0) / 100));
                    return price >= range.min && price <= range.max;
                });
            }
        }

        // Fabric Filter
        if (selectedFabrics.length > 0) {
            result = result.filter(p => {
                const possibleFabricFields = [
                    p.fabric, p.material, p.product_info?.fabric, p.product_info?.material,
                    p.details?.fabric, p.details?.material, p.description, p.title
                ];
                const fabricSearchString = possibleFabricFields.filter(Boolean).map(String).join(' ').toLowerCase();
                return selectedFabrics.some(fabric => fabricSearchString.includes(fabric.toLowerCase()));
            });
        }

        setFilteredProducts(result);
    }, [products, selectedPriceRange, selectedFabrics]);

    const getSortedProducts = useMemo(() => {
        let sorted = [...filteredProducts];
        switch (sortOption) {
            case 'price-low-high':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high-low':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        return sorted;
    }, [filteredProducts, sortOption]);

    const toggleFabric = (fabric: string) => {
        setSelectedFabrics(prev =>
            prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]
        );
    };

    const resetFilters = () => {
        setSelectedPriceRange(null);
        setSelectedFabrics([]);
    };

    const activeFilterCount = selectedFabrics.length + (selectedPriceRange ? 1 : 0);

    const renderProduct = React.useCallback(({ item }: { item: any }) => {
        const price = item.price || item.mrp || 0;
        return (
            <Pressable
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
            >
                <Image
                    source={{ uri: item.images?.image1 }}
                    style={styles.productImage}
                />
                {item.discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
                    </View>
                )}
                <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>₹{price.toLocaleString('en-IN')}</Text>
                        {item.mrp > price && (
                            <Text style={styles.mrp}>₹{item.mrp}</Text>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    }, [navigation]);


    return (
        <SafeArea style={styles.safeArea} edges={['bottom']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>{title || category || 'Products'}</Text>
                        <View style={styles.headerLine} />
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconBtn}>
                        <Ionicons name="swap-vertical" size={22} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Sub-Header with Filter Button */}
                <View style={styles.subHeader}>
                    <Text style={styles.resultsText}>{filteredProducts.length} Products</Text>
                    <TouchableOpacity
                        style={[styles.filterBtn, activeFilterCount > 0 && styles.activeFilterBtn]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Ionicons name="filter-outline" size={18} color={activeFilterCount > 0 ? "#fff" : "#333"} />
                        <Text style={[styles.filterBtnText, activeFilterCount > 0 && { color: '#fff' }]}>Filters</Text>
                        {activeFilterCount > 0 && (
                            <View style={styles.badge}><Text style={styles.badgeText}>{activeFilterCount}</Text></View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Active Filters Pills */}
                {(selectedPriceRange || selectedFabrics.length > 0) && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
                        {selectedPriceRange && (
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>{priceRanges.find(r => r.id === selectedPriceRange)?.label}</Text>
                                <TouchableOpacity onPress={() => setSelectedPriceRange(null)}>
                                    <Ionicons name="close" size={16} color="#BA2C73" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedFabrics.map(fabric => (
                            <View key={fabric} style={styles.pill}>
                                <Text style={styles.pillText}>{fabric}</Text>
                                <TouchableOpacity onPress={() => toggleFabric(fabric)}>
                                    <Ionicons name="close" size={16} color="#BA2C73" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {(selectedPriceRange || selectedFabrics.length > 0) && (
                            <TouchableOpacity onPress={resetFilters} style={{ marginLeft: 5, justifyContent: 'center' }}>
                                <Text style={{ color: '#BA2C73', fontSize: 12, fontWeight: '600' }}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#BA2C73" />
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={{ color: '#666', fontSize: 16 }}>No products found matching filters.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={getSortedProducts}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        contentContainerStyle={styles.listContainer}
                        removeClippedSubviews={Platform.OS === 'android'}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={8}
                        getItemLayout={(data, index) => ({
                            length: 290,
                            offset: 290 * index,
                            index,
                        })}
                    />
                )}

                {/* Sort Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                        <Pressable style={styles.modalContent} onPress={() => { }}>
                            <Text style={styles.modalTitle}>Sort By</Text>
                            {['featured', 'price-low-high', 'price-high-low', 'newest'].map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.optionItem}
                                    onPress={() => { setSortOption(opt); setModalVisible(false); }}
                                >
                                    <Text style={[styles.optionText, sortOption === opt && styles.selectedOption]}>
                                        {opt === 'price-low-high' ? 'Price: Low to High' :
                                            opt === 'price-high-low' ? 'Price: High to Low' :
                                                opt === 'newest' ? 'Newest' : 'Featured'}
                                    </Text>
                                    {sortOption === opt && <Ionicons name="checkmark" size={20} color="#BA2C73" />}
                                </TouchableOpacity>
                            ))}
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Filter Modal */}
                <Modal
                    animationType="slide"
                    visible={filterModalVisible}
                    onRequestClose={() => setFilterModalVisible(false)}
                >
                    <SafeArea style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Refine Results</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1 }}>
                            {/* Price Section */}
                            <TouchableOpacity
                                style={styles.filterSectionHeader}
                                onPress={() => setOpenFilterSections(prev => ({ ...prev, price: !prev.price }))}
                            >
                                <Text style={styles.sectionTitle}>Price</Text>
                                <Ionicons name={openFilterSections.price ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                            </TouchableOpacity>
                            {openFilterSections.price && (
                                <View style={styles.filterOptions}>
                                    {priceRanges.map(range => (
                                        <TouchableOpacity
                                            key={range.id}
                                            style={styles.checkboxRow}
                                            onPress={() => setSelectedPriceRange(range.id)}
                                        >
                                            <View style={[styles.radio, selectedPriceRange === range.id && styles.radioSelected]} />
                                            <Text style={styles.optionLabel}>{range.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Fabric Section */}
                            <TouchableOpacity
                                style={styles.filterSectionHeader}
                                onPress={() => setOpenFilterSections(prev => ({ ...prev, material: !prev.material }))}
                            >
                                <Text style={styles.sectionTitle}>Fabric</Text>
                                <Ionicons name={openFilterSections.material ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                            </TouchableOpacity>
                            {openFilterSections.material && (
                                <View style={styles.filterOptions}>
                                    {availableFabrics.map((fabric: any) => (
                                        <TouchableOpacity
                                            key={fabric}
                                            style={styles.checkboxRow}
                                            onPress={() => toggleFabric(fabric)}
                                        >
                                            <View style={[styles.checkbox, selectedFabrics.includes(fabric) && styles.checkboxSelected]}>
                                                {selectedFabrics.includes(fabric) && <Ionicons name="checkmark" size={14} color="#fff" />}
                                            </View>
                                            <Text style={styles.optionLabel}>{fabric}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                                <Text style={styles.resetBtnText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
                                <Text style={styles.applyBtnText}>Show {filteredProducts.length} Results</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeArea>
                </Modal>
            </View>
        </SafeArea>
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
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize'
    },
    headerLine: {
        width: 40,
        height: 3,
        backgroundColor: '#D4AF37', // Gold
        marginTop: 4,
        borderRadius: 2
    },
    backButton: {
        padding: 5,
    },
    iconBtn: {
        padding: 5,
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeFilterBtn: {
        backgroundColor: '#BA2C73', // Pinkish/Magenta brand color
        borderColor: '#BA2C73',
    },
    filterBtnText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    badge: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        color: '#BA2C73',
        fontWeight: 'bold'
    },
    pillsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCE7F3', // Light pink
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginRight: 8,
    },
    pillText: {
        fontSize: 12,
        color: '#BA2C73',
        marginRight: 5,
        fontWeight: '500',
    },
    listContainer: {
        padding: 5,
    },
    productCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    productImage: {
        height: 220,
        width: '100%',
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'green',
    },
    discountText: {
        fontSize: 10,
        color: 'green',
        fontWeight: 'bold',
    },
    productInfo: {
        padding: 10,
    },
    productTitle: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111',
    },
    mrp: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 5,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOption: {
        color: '#BA2C73',
        fontWeight: '600',
    },
    // Filter Modal Content
    filterSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    filterOptions: {
        padding: 15,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#BA2C73',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#BA2C73',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#BA2C73',
        marginRight: 10,
    },
    radioSelected: {
        backgroundColor: '#BA2C73',
    },
    optionLabel: {
        fontSize: 16,
        color: '#333',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    resetBtn: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        marginRight: 10,
    },
    resetBtnText: {
        color: '#666',
        fontWeight: '600',
    },
    applyBtn: {
        flex: 2,
        backgroundColor: '#BA2C73',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ProductListScreen;
