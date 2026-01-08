import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    StatusBar,
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const SPACING = 12;
const COL_NUM = 2;
const ITEM_WIDTH = (width - SPACING * (COL_NUM + 1)) / COL_NUM;

const ShopScreen = () => {
    const navigation = useNavigation<any>();
    const scrollX = useRef(new Animated.Value(0)).current;
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    // Split categories for better layout
    const topCategories = [
        { name: t('men'), path: 'ProductList', params: { category: 'Men' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png', highlight: true },
        { name: t('women'), path: 'ProductList', params: { category: 'Women' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png', highlight: true },
        { name: t('boys'), path: 'ProductList', params: { category: 'Boys' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png' },
        { name: t('girls'), path: 'ProductList', params: { category: 'Girls' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png' },
        { name: t('sishu'), path: 'ProductList', params: { category: 'Sishu' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png' },
    ];

    const collections = [
        { name: t('all_collection'), path: 'ProductList', params: { category: 'Collection' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156521/faaed640-0829-4861-80a2-6c7dc3e73bf3.png', desc: t('view_all') },
        { name: t('men'), path: 'ProductList', params: { category: 'Men' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png', desc: 'Ethnic Wear', badge: 'NEW' },
        { name: t('women'), path: 'ProductList', params: { category: 'Women' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png', desc: 'Latest Trends', badge: 'HOT' },
        { name: t('boys'), path: 'ProductList', params: { category: 'Boys' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png', desc: 'Kids Fashion' },
        { name: t('girls'), path: 'ProductList', params: { category: 'Girls' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png', desc: 'Kids Fashion' },
        { name: t('sishu'), path: 'ProductList', params: { category: 'Sishu' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png', desc: 'Toddlers' },
        { name: t('silk_sarees'), path: 'ProductList', params: { category: 'silk' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png', desc: 'Pure Elegance', badge: 'CLASSIC' },
        { name: t('cotton_sarees'), path: 'ProductList', params: { category: 'cotton' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png', desc: 'Comfort Wrap', badge: 'SUMMER' },
        { name: t('regional_sarees'), path: 'ProductList', params: { category: 'regional' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png', desc: 'Traditional', badge: 'BESTSELLER' },
        { name: t('banarasi_silk'), path: 'ProductList', params: { category: 'banarasi' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png', desc: 'Premium Silk', badge: 'PREMIUM' },
        { name: t('designer_sarees'), path: 'ProductList', params: { category: 'designer-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762110448/unnamed_jh6wqf.jpg', desc: 'Exclusive' },
        { name: t('printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762754174/296c91cc-658f-447c-ba8c-079e1bc530b5.png', desc: 'Daily Wear', badge: 'SALE' },
    ];

    const banners = [
        {
            id: '1',
            image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png',
            tag: 'NEW ARRIVALS', // Keep or map
            title: t('wedding_sarees'),
            btn: t('buy_now'),
            path: 'ProductList',
            params: { category: 'banarasi' }
        },
        {
            id: '2',
            image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762110448/unnamed_jh6wqf.jpg',
            tag: 'SALE LIVE', // Keep
            title: t('designer_sarees'),
            btn: t('view_all'),
            path: 'ProductList',
            params: { category: 'designer-sarees' }
        }
    ];

    const Header = () => (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('Search')}>
                <Ionicons name="search" size={20} color={colors.subText} style={{ marginRight: 10 }} />
                <Text style={[styles.searchText, { color: colors.subText }]}>{t('search_hint')}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="mic-outline" size={20} color={colors.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="camera-outline" size={20} color={colors.subText} />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );

    const TopCategories = () => (
        <View style={styles.topCatContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topCatContent}>
                {topCategories.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.circleItem}
                        onPress={() => navigation.navigate(item.path, item.params)}
                    >
                        <View style={[styles.circleImageContainer, item.highlight && styles.circleHighlight, { borderColor: item.highlight ? '#E91E63' : colors.card, backgroundColor: colors.card }]}>
                            <Image source={{ uri: item.image }} style={styles.circleImage} />
                            {item.highlight && <View style={styles.liveDot} />}
                        </View>
                        <Text style={[styles.circleText, { color: colors.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const BannerCarousel = () => (
        <View>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.carousel}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {banners.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.bannerContainer}
                        onPress={() => navigation.navigate(item.path, item.params)}
                        activeOpacity={0.9}
                    >
                        <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
                        <View style={styles.bannerOverlay}>
                            <View style={styles.bannerTagContainer}>
                                <Text style={styles.bannerTag}>{item.tag}</Text>
                            </View>
                            <Text style={styles.bannerTitle}>{item.title}</Text>
                            <View style={styles.bannerBtnContainer}>
                                <Text style={styles.bannerBtn}>{item.btn}</Text>
                                <Ionicons name="arrow-forward" size={14} color="#fff" />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* Dots */}
            <View style={styles.dotsContainer}>
                {banners.map((_, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp'
                    });
                    return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                })}
            </View>
        </View>
    );

    const getBadgeColor = (type?: string) => {
        switch (type) {
            case 'NEW': return '#4CAF50';
            case 'HOT': return '#E53935';
            case 'SALE': return '#FF9800';
            case 'PREMIUM': return '#212121';
            case 'BESTSELLER': return '#1976D2';
            default: return '#212121';
        }
    };

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate(item.path, item.params)}
            activeOpacity={0.9}
        >
            <View style={[styles.gridImageContainer, { backgroundColor: colors.background }]}>
                <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="cover" />
                {item.badge && (
                    <View style={[styles.badge, { backgroundColor: getBadgeColor(item.badge) }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                )}
            </View>
            <View style={styles.gridInfo}>
                <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.gridDesc, { color: colors.subText }]}>{item.desc}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            <Header />
            <FlatList
                data={collections}
                renderItem={renderGridItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={COL_NUM}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View>
                        <TopCategories />
                        <BannerCarousel />
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('curated_collections')}</Text>
                            <MaterialCommunityIcons name="sort-variant" size={20} color={colors.subText} />
                        </View>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
    },
    searchText: {
        color: '#878787',
        fontSize: 14,
    },
    iconBtn: {
        padding: 4,
    },
    // Top Circles
    topCatContainer: {
        paddingVertical: 16,
        borderBottomWidth: 8, // Splitter
        borderBottomColor: '#f5f5f5',
    },
    topCatContent: {
        paddingHorizontal: 12,
    },
    circleItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    circleImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#fff', // default
        padding: 2,
        marginBottom: 6,
        elevation: 2,
        backgroundColor: '#fff'
    },
    circleHighlight: {
        borderColor: '#E91E63', // Highlight color (Pink/Red like Insta)
    },
    liveDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E91E63',
        borderWidth: 2,
        borderColor: '#fff',
    },
    circleImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    circleText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '600',
        textAlign: 'center',
    },
    // Banner Carousel
    carousel: {
        marginTop: 16,
    },
    bannerContainer: {
        width: width - 32,
        marginHorizontal: 16,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    bannerTagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#E91E63',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    bannerTag: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bannerBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bannerBtn: {
        color: '#212121',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#212121',
        marginHorizontal: 4,
    },
    // Grid
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    listContent: {
        paddingBottom: 80,
    },
    gridRow: {
        paddingHorizontal: SPACING,
        marginBottom: SPACING,
        justifyContent: 'space-between'
    },
    gridCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
    },
    gridImageContainer: {
        width: '100%',
        height: ITEM_WIDTH * 1.2, // Taller image
        backgroundColor: '#f9f9f9',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    gridInfo: {
        padding: 12,
    },
    gridTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 4,
    },
    gridDesc: {
        fontSize: 11,
        color: '#878787',
    },
});

export default ShopScreen;
