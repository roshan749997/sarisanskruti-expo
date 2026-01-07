import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = (width - 45) / 2; // 2 cols with padding

const ShopScreen = () => {
    const navigation = useNavigation<any>();

    // Categories matching ShopByCategory.jsx
    const categories = [
        { name: 'COLLECTION', path: 'ProductList', params: { category: 'Collection' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156521/faaed640-0829-4861-80a2-6c7dc3e73bf3.png' },
        { name: 'MEN', path: 'ProductList', params: { category: 'Men' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png' },
        { name: 'WOMEN', path: 'ProductList', params: { category: 'Women' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png' },
        { name: 'BOYS', path: 'ProductList', params: { category: 'Boys' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png' },
        { name: 'GIRLS', path: 'ProductList', params: { category: 'Girls' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png' },
        { name: 'SISHU', path: 'ProductList', params: { category: 'Sishu' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png' },
        { name: 'REGIONAL', path: 'ProductList', params: { category: 'regional' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png' },
        { name: 'BANARASI', path: 'ProductList', params: { category: 'banarasi' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png' },
        { name: 'DESIGNER', path: 'ProductList', params: { category: 'designer-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762110448/unnamed_jh6wqf.jpg' },
        { name: 'PRINTED', path: 'ProductList', params: { category: 'printed-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762754174/296c91cc-658f-447c-ba8c-079e1bc530b5.png' },
    ];

    const Header = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Shop By Category</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <Ionicons name="search" size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeArea style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Text style={styles.introText}>Explore our wide range of collections</Text>
                </View>

                <View style={styles.grid}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => navigation.navigate(cat.path, cat.params)}
                        >
                            <Image source={{ uri: cat.image }} style={styles.image} resizeMode="cover" />
                            <View style={styles.overlay}>
                                <Text style={styles.cardTitle}>{cat.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeArea>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        fontFamily: Platform.OS === 'ios' ? 'serif' : 'Roboto',
    },
    introSection: {
        padding: 20,
        alignItems: 'center',
    },
    introText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '300',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        justifyContent: 'space-between',
    },
    card: {
        width: CATEGORY_WIDTH,
        height: CATEGORY_WIDTH * 1.3, // Portrait aspect
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    cardTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default ShopScreen;
