import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch(query);
            } else if (query.trim().length === 0) {
                setResults([]);
                setHasSearched(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (text: string) => {
        setLoading(true);
        try {
            const data = await api.searchProducts(text);
            // Robust data handling to support Array or Object response
            const products = Array.isArray(data) ? data : (data?.results || data?.products || []);
            setResults(products);
            setHasSearched(true);
        } catch (e) {
            console.error(e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const price = item.price || item.mrp || 0;
        const discount = item.discountPercent || 0;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.images?.image1 || 'https://via.placeholder.com/300' }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discount}%</Text>
                        </View>
                    )}
                </View>
                <View style={styles.details}>
                    <Text style={styles.brand} numberOfLines={1}>{item.product_info?.brand || 'Sarisanskruti'}</Text>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{price.toLocaleString()}</Text>
                        {item.mrp > price && <Text style={styles.mrp}>₹{item.mrp.toLocaleString()}</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search for sarees, kurtis..."
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => performSearch(query)}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                            <Ionicons name="close-circle" size={18} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#E91E63" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        hasSearched && query.length > 2 ? (
                            <View style={styles.center}>
                                <Image
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6134/6134065.png' }}
                                    style={{ width: 100, height: 100, marginBottom: 20, opacity: 0.5 }}
                                    resizeMode="contain"
                                />
                                <Text style={styles.noResults}>No products found for "{query}"</Text>
                                <Text style={styles.subText}>Try checking your spelling or use different keywords</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                {!hasSearched && (
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="search-outline" size={64} color="#ddd" />
                                        <Text style={[styles.subText, { marginTop: 10 }]}>Type to search products</Text>
                                    </View>
                                )}
                            </View>
                        )
                    }
                />
            )}
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
        paddingBottom: 12,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        marginRight: 12,
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    listContent: {
        padding: 12,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 0.75,
        backgroundColor: '#f9f9f9',
        position: 'relative',
    },
    image: {
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
    details: {
        padding: 10,
    },
    brand: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 13,
        color: '#333',
        marginBottom: 4,
        minHeight: 36, // Ensure alignment
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#212121',
        marginRight: 6,
    },
    mrp: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    noResults: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default SearchScreen;
