import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const COLUMN_count = 2;
const ITEM_WIDTH = (width - 40) / COLUMN_count; // 20 padding each side approx

const WishlistScreen = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const navigation = useNavigation<any>();
    const { colors, darkMode } = useTheme();

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.images?.image1 }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.card }]}
                    onPress={() => removeFromWishlist(item._id)}
                >
                    <Ionicons name="trash-outline" size={18} color="red" />
                </TouchableOpacity>
            </View>
            <View style={styles.details}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.text }]}>₹{item.price}</Text>
                    {item.mrp && <Text style={styles.mrp}>₹{item.mrp}</Text>}
                </View>
                {item.discountPercent > 0 && (
                    <Text style={styles.discount}>{item.discountPercent}% OFF</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (wishlist.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="heart-outline" size={64} color="#ccc" />
                <Text style={[styles.emptyText, { color: colors.text }]}>Your Wishlist is Empty</Text>
                <Text style={[styles.subText, { color: colors.subText }]}>Tap the heart on any product to save it here.</Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('Shop')}
                >
                    <Text style={styles.browseBtnText}>Browse Products</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Wishlist ({wishlist.length})</Text>
            </View>
            <FlatList
                data={wishlist}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={COLUMN_count}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        padding: 10,
        paddingBottom: 20,
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
    imageContainer: {
        position: 'relative',
        height: ITEM_WIDTH * 1.3,
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    removeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        elevation: 2,
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
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginRight: 5,
    },
    mrp: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    discount: {
        fontSize: 10,
        color: 'green',
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subText: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    browseBtn: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WishlistScreen;
