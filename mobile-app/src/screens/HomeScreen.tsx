import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  FlatList,
  Platform,
  Alert,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [trendingNow, setTrendingNow] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { cartCount, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  // const [showScrollTop, setShowScrollTop] = useState(false); // Removed
  const flatListRef = useRef<any>(null);
  useScrollToTop(flatListRef);

  // Synchronized Categories
  const shopCategories = [
    { name: 'COLLECTION', path: 'ProductList', params: { category: 'Collection' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156521/faaed640-0829-4861-80a2-6c7dc3e73bf3.png' },
    { name: 'MEN', path: 'ProductList', params: { category: 'Men' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png' },
    { name: 'WOMEN', path: 'ProductList', params: { category: 'Women' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png' },
    { name: 'BOYS', path: 'ProductList', params: { category: 'Boys' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png' },
    { name: 'GIRLS', path: 'ProductList', params: { category: 'Girls' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png' },
    { name: 'SISHU', path: 'ProductList', params: { category: 'Sishu' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png' },
    { name: 'SILK', path: 'ProductList', params: { category: 'silk' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png' },
    { name: 'COTTON', path: 'ProductList', params: { category: 'cotton' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png' },
    { name: 'REGIONAL', path: 'ProductList', params: { category: 'regional' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762332592/683cb274-bd83-464f-a5b2-db774c250fde.png' },
    { name: 'BANARASI', path: 'ProductList', params: { category: 'banarasi' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762500248/d4f99ab4-dee8-4e28-9eaf-c973699ba6f5.png' },
    { name: 'DESIGNER SAREES', path: 'ProductList', params: { category: 'designer-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762110448/unnamed_jh6wqf.jpg' },
    { name: 'PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees' }, image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1762754174/296c91cc-658f-447c-ba8c-079e1bc530b5.png' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (Array.isArray(data)) {
        const validProducts = data.filter(p => p.images?.image1);
        const productsWithDiscount = validProducts.filter(p => p.discountPercent > 0 || p.discount > 0);
        const regularProducts = validProducts.filter(p => !productsWithDiscount.find(d => d._id === p._id));
        const bestSellersList = [...productsWithDiscount, ...regularProducts].slice(0, 100);
        const trendingList = validProducts.slice(0, 100); // Initial 100

        setProducts(validProducts);
        setBestSellers(bestSellersList);
        setTrendingNow(trendingList);
      }
    } catch (e) {
      console.log('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (loading || loadingMore) return;
    const currentLen = trendingNow.length;
    if (currentLen >= products.length) return;

    setLoadingMore(true);
    const nextBatch = products.slice(currentLen, currentLen + 100);

    if (nextBatch.length > 0) {
      setTimeout(() => {
        setTrendingNow(prev => {
          // Ensure uniqueness to check against duplicates
          const uniqueBatch = nextBatch.filter(n => !prev.some(p => p._id === n._id));
          return [...prev, ...uniqueBatch];
        });
        setLoadingMore(false);
      }, 50);
    } else {
      setLoadingMore(false);
    }
  };

  const handleWishlistToggle = useCallback((item: any) => {
    if (isInWishlist(item._id)) {
      removeFromWishlist(item._id);
    } else {
      addToWishlist(item);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const renderCategoryCircle = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCircleCard}
      onPress={() => navigation.navigate(item.path, item.params)}
    >
      <View style={styles.categoryCircleContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryCircleImage} />
        <View style={styles.categoryRing} />
      </View>
      <Text style={styles.categoryCircleName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  ), [navigation]);

  const renderProductCard = useCallback(({ item, isGrid = false, isTrending = false }: { item: any, isGrid?: boolean, isTrending?: boolean }) => {
    const price = item.price || item.mrp || 0;
    const mrp = item.mrp || 0;
    const discount = item.discountPercent || 0;
    const isWishlisted = isInWishlist(item._id);
    const rating = item.rating || (3.5 + Math.random() * 1.4).toFixed(1);

    return (
      <Pressable
        style={[styles.productCard, isGrid && styles.gridProductCard]}
        onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images?.image1 || 'https://via.placeholder.com/300x400' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.badgeContainer}>
            {isTrending && (
              <View style={styles.trendingBadge}>
                <Ionicons name="flame" size={10} color="#fff" style={{ marginRight: 2 }} />
                <Text style={styles.trendingText}>TRENDING</Text>
              </View>
            )}
            {discount > 0 && !isTrending && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleText}>-{discount}%</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={(e) => {
              e.stopPropagation();
              handleWishlistToggle(item);
            }}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={18}
              color={isWishlisted ? "#e11d48" : "#333"}
            />
          </TouchableOpacity>

          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{rating}</Text>
            <Ionicons name="star" size={8} color="#000" style={{ marginLeft: 2 }} />
          </View>

          {isGrid && (
            <TouchableOpacity
              style={styles.quickAddBtn}
              onPress={(e) => {
                e.stopPropagation();
                addToCart(item, 1);
                if (Platform.OS !== 'web') {
                  // Optional Vibrate?
                }
              }}
            >
              <Ionicons name="cart-outline" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>₹{price.toLocaleString('en-IN')}</Text>
            {mrp > price && (
              <Text style={styles.mrpText}>₹{mrp.toLocaleString('en-IN')}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }, [isInWishlist, handleWishlistToggle, addToCart, navigation]);

  const RenderHeader = useCallback(() => (
    <View>
      {/* Hero Section */}
      <HeroSlider
        slides={[
          {
            desktop: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766832556/Red_and_Green_Simple_Elegant_Sarees_Republic_Day_Sale_Billboard_2048_x_594_px_glqpgv.png',
            alt: 'Republic Day Sale',
          },
          {
            desktop: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1763451863/Elegance_Comfort_Style_2048_x_594_px_wqggd6.svg',
            alt: 'Festive Offers',
          },
        ]}
        mobileSrc="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766834409/Brown_and_Beige_Delicate_Traditional_Minimalist_Fashion_Instagram_Story_lgpyvi.svg"
      />

      {/* Shop By Category */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={shopCategories}
          renderItem={renderCategoryCircle}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Best Sellers */}
      <View style={[styles.section, styles.bestSellerSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <Text style={styles.sectionSubtitle}>Most Loved Styles</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {loading && bestSellers.length === 0 ? (
          <ActivityIndicator size="large" color="#212121" style={{ marginTop: 20 }} />
        ) : bestSellers.length === 0 ? (
          <Text style={styles.emptyText}>No best sellers yet.</Text>
        ) : (
          <FlatList
            data={bestSellers}
            renderItem={({ item }) => renderProductCard({ item, isGrid: false })}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            initialNumToRender={5}
          />
        )}
      </View>

      {/* Promos */}
      <View style={styles.promoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Festive Specials</Text>
        </View>
        <View style={styles.promoColumn}>
          <TouchableOpacity style={styles.promoBannerFull} activeOpacity={0.9} onPress={() => navigation.navigate('Shop')}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Brown_and_Gold_Traditional_Pongal_Sale_Facebook_Ad_p32fld.png' }}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.promoBannerFull} activeOpacity={0.9} onPress={() => navigation.navigate('Shop')}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Red_and_Gold_Elegant_Navratri_Special_Sale_Facebook_Ad_aotjzn.png' }}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trending Now Header */}
      <View style={[styles.section, { borderBottomWidth: 0, paddingBottom: 10 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.viewAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {loading && trendingNow.length === 0 && (
          <ActivityIndicator size="large" color="#212121" />
        )}
      </View>
    </View>
  ), [bestSellers, loading, renderCategoryCircle, renderProductCard, shopCategories, trendingNow.length, navigation]);

  const RenderFooter = useCallback(() => (
    <View>
      {/* Why Choose Us */}
      <View style={styles.whyChooseUsSection}>
        <Text style={styles.whyChooseUsTitle}>Why Sarisanskruti?</Text>
        <View style={styles.whyGrid}>
          {[
            { icon: '✨', title: 'Premium Quality', desc: 'Crafted with care' },
            { icon: '🚚', title: 'Free Shipping', desc: 'Above ₹999' },
            { icon: '🔄', title: 'Easy Returns', desc: '7-day policy' },
            { icon: '💎', title: 'Authentic', desc: '100% Original' }
          ].map((feat, i) => (
            <View key={i} style={styles.whyCard}>
              <Text style={styles.whyIcon}>{feat.icon}</Text>
              <Text style={styles.whyTitle}>{feat.title}</Text>
              <Text style={styles.whyDesc}>{feat.desc}</Text>
            </View>
          ))}
        </View>
      </View>
      <Footer />
      <View style={{ height: 80 }} />
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Navbar />
      <Header />
      <FlatList
        ref={flatListRef}
        data={trendingNow}
        renderItem={({ item }) => (
          <View style={styles.gridItemWrapper}>
            {renderProductCard({ item, isGrid: true, isTrending: true })}
          </View>
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={RenderHeader}
        ListFooterComponent={RenderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
      // onScroll={(e) => setShowScrollTop(e.nativeEvent.contentOffset.y > 300)}
      />

      {/* Scroll Top Button Removed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  section: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f9f9f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#878787',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '600',
  },
  bestSellerSection: {
    backgroundColor: '#FFFDE7',
  },
  emptyText: {
    textAlign: 'center',
    color: '#878787',
    paddingVertical: 20,
  },

  // Categories
  categoryList: {
    paddingHorizontal: 12,
  },
  categoryCircleCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  categoryCircleContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    marginBottom: 8,
    position: 'relative',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: '#E91E63',
  },
  categoryCircleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: '#f0f0f0',
  },
  categoryCircleName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    lineHeight: 14,
  },

  // Products
  productList: {
    paddingHorizontal: 12,
  },
  productCard: {
    width: 150,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  gridProductCard: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: 0,
  },
  imageContainer: {
    aspectRatio: 0.8,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  saleBadge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingBadge: {
    backgroundColor: '#212121',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  trendingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  saleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  wishlistButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
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

  // Promos
  promoSection: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f9f9f9',
  },
  promoColumn: {
    paddingHorizontal: 16,
  },
  promoBannerFull: {
    width: '100%',
    height: 220,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },

  // Grid
  gridItemWrapper: {
    width: '48%', // Approx half with spacing
    marginBottom: 16,
  },

  // Why Choose Us
  whyChooseUsSection: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 8,
    borderTopColor: '#f9f9f9',
  },
  whyChooseUsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  whyCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  whyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  whyDesc: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },

  scrollToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
});

export default HomeScreen;
