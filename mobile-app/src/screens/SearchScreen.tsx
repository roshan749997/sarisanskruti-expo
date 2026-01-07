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
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 2) {
                performSearch(query);
            } else if (query.length === 0) {
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
            setResults(Array.isArray(data) ? data : []);
            setHasSearched(true);
        } catch (e) {
            console.error(e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
        >
            <Image
                source={{ uri: item.images?.image1 }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search for sarees, kurtis..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
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
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        hasSearched ? (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No results found for "{query}"</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Text style={styles.introText}>Type at least 3 characters to search</Text>
                            </View>
                        )
                    }
                />
            )}
        </View>
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
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        marginRight: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    list: {
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    introText: {
        fontSize: 16,
        color: '#999',
    },
    card: {
        width: ITEM_WIDTH,
        marginBottom: 20,
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: ITEM_WIDTH * 1.3,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    details: {
        padding: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
        height: 34,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default SearchScreen;
