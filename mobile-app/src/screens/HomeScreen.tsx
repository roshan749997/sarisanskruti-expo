import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
  const paddingToBottom = 150; // Trigger closer to bottom so footer is reachable
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]); // All fetched products
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [trendingNow, setTrendingNow] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Start false for instant UI
  const { cartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollViewRef = React.useRef<any>(null);

  // Categories for the "Shop by Category" section (from ShopByCategory.jsx)
  const shopCategories = [
    { name: 'COLLECTION', path: 'ProductList', params: { category: 'Collection' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156521/faaed640-0829-4861-80a2-6c7dc3e73bf3.png' },
    { name: 'MEN', path: 'ProductList', params: { category: 'Men' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764154213/0bf2018a-4136-4d0d-99bc-2c5755a65d2c.png' },
    { name: 'WOMEN', path: 'ProductList', params: { category: 'Women' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764155957/b0484146-0b8f-4f41-b27f-8c1ee41a7179.png' },
    { name: 'BOYS', path: 'ProductList', params: { category: 'Boys' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156074/0b700582-a664-43e6-b478-39ced3c3c6db.png' },
    { name: 'GIRLS', path: 'ProductList', params: { category: 'Girls' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156159/1157977a-db19-4e4e-988c-51c7f8d501ae.png' },
    { name: 'SISHU', path: 'ProductList', params: { category: 'Sishu' }, image: 'https://res.cloudinary.com/doh8nqbf1/image/upload/v1764156281/6b450cec-316c-4897-9db4-c3621dfa35fa.png' },
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
      const data = await api.getProducts();
      if (Array.isArray(data)) {
        // 1. Common filter: must have image1
        const validProducts = data.filter(p => p.images?.image1);

        // 2. Best Sellers Logic (from BestSellers.jsx)
        // Prioritize discounts, then regular
        const productsWithDiscount = validProducts.filter(p => p.discountPercent > 0 || p.discount > 0);
        const regularProducts = validProducts.filter(p => !productsWithDiscount.find(d => d._id === p._id));
        const bestSellersList = [...productsWithDiscount, ...regularProducts].slice(0, 100); // Match frontend limit 100

        // 3. Trending Now Logic (from TrendingNow.jsx)
        // Just valid products, no special sort order, initially 20
        const trendingList = validProducts.slice(0, 20);

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
    const currentLen = trendingNow.length;
    const nextBatch = products.slice(currentLen, currentLen + 20);
    if (nextBatch.length > 0) {
      setTrendingNow([...trendingNow, ...nextBatch]);
    }
  };

  const handleWishlistToggle = (item: any) => {
    if (isInWishlist(item._id)) {
      removeFromWishlist(item._id);
    } else {
      addToWishlist(item);
    }
  };

  const renderProductCard = React.useCallback(({ item, isGrid = false }: { item: any, isGrid?: boolean }) => {
    const price = item.price || item.mrp || 0;
    const mrp = item.mrp || 0;
    const discount = item.discountPercent || 0;
    const isWishlisted = isInWishlist(item._id);

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
          {/* Sale Badge */}
          {discount > 0 && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>Sale</Text>
            </View>
          )}
          {/* Wishlist Button */}
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
              color={isWishlisted ? "red" : "#333"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>₹{price.toLocaleString('en-IN')}</Text>
            {mrp > price && (
              <Text style={styles.mrpText}>₹{mrp.toLocaleString('en-IN')}</Text>
            )}
          </View>
          {discount > 0 && (
            <Text style={styles.discountText}>{discount}% OFF</Text>
          )}
        </View>
      </Pressable>
    );
  }, [navigation, isInWishlist, handleWishlistToggle]);

  const renderCategoryCircle = React.useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCircleCard}
      onPress={() => navigation.navigate(item.path, item.params)}
    >
      <View style={styles.categoryCircleContainer}>
        {/* Glow effect simulation using border */}
        <Image source={{ uri: item.image }} style={styles.categoryCircleImage} />
      </View>
      <View style={styles.categoryNameContainer}>
        <Text style={styles.categoryCircleName}>{item.name}</Text>
        <View style={styles.categoryUnderline} />
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navbar />
      <Header />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          // Check if close to bottom for infinite scroll
          if (isCloseToBottom(nativeEvent)) {
            if (!loading && trendingNow.length < products.length) {
              handleLoadMore();
            }
          }
          // Check if scrolled down for scroll-to-top button
          if (nativeEvent.contentOffset.y > 300) {
            setShowScrollTop(true);
          } else {
            setShowScrollTop(false);
          }
        }}
        scrollEventThrottle={400}
        removeClippedSubviews={Platform.OS === 'android'}
      >

        {/* Hero Section */}
        <HeroSlider
          slides={[
            {
              desktop: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766832556/Red_and_Green_Simple_Elegant_Sarees_Republic_Day_Sale_Billboard_2048_x_594_px_glqpgv.png',
              alt: 'sarisanskruti - Premium Kurtas & Kurtis',
            },
            {
              desktop: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1763451863/Elegance_Comfort_Style_2048_x_594_px_wqggd6.svg',
              alt: 'Festive Offers - sarisanskruti',
            },
          ]}
          mobileSrc="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766834409/Brown_and_Beige_Delicate_Traditional_Minimalist_Fashion_Instagram_Story_lgpyvi.svg"
        />

        {/* Shop By Category */}
        <View style={styles.section}>
          <View style={styles.centerHeader}>
            <Text style={styles.serifTitle}>Shop by Category</Text>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.subTitle}>Explore Our Collections</Text>
          </View>
          <FlatList
            data={shopCategories}
            renderItem={renderCategoryCircle}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
          <View style={styles.centerHeader}>
            <Text style={styles.serifTitle}>Best-sellers</Text>
            <Text style={styles.subTitle}>Styled for All!</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={bestSellers}
              renderItem={({ item }) => renderProductCard({ item, isGrid: false })}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={6}
            />
          )}
        </View>

        {/* Special Offers */}
        <View style={[styles.section, { backgroundColor: '#fff' }]}>
          <View style={[styles.centerHeader, { marginBottom: 15 }]}>
            <Text style={styles.serifTitle}>Special Offers</Text>
            <Text style={styles.subTitle}>Limited Time Deals</Text>
          </View>
          <View style={styles.bannerContainer}>
            <TouchableOpacity style={styles.bannerWrapper}>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Brown_and_Gold_Traditional_Pongal_Sale_Facebook_Ad_p32fld.png' }}
                style={styles.bannerImage}
              />
            </TouchableOpacity>
            <View style={{ height: 15 }} />
            <TouchableOpacity style={styles.bannerWrapper}>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766833070/Red_and_Gold_Elegant_Navratri_Special_Sale_Facebook_Ad_aotjzn.png' }}
                style={styles.bannerImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <View style={styles.centerHeader}>
            <Text style={styles.serifTitle}>Trending Now</Text>
            <Text style={styles.subTitle}>Serving looks, garma-garam!</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#D4AF37" />
          ) : (
            <View style={styles.gridContainer}>
              {trendingNow.map((item) => (
                <View key={item._id} style={styles.gridItemWrapper}>
                  {renderProductCard({ item, isGrid: true })}
                </View>
              ))}
            </View>
          )}
          {!loading && trendingNow.length < products.length && (
            <ActivityIndicator size="small" color="#666" style={{ marginTop: 20 }} />
          )}
        </View>

        {/* Why Choose Us */}
        <View style={styles.whyChooseUsSection}>
          <Text style={styles.whyChooseUsTitle}>WHY CHOOSE sarisanskruti</Text>
          <Text style={styles.whyChooseUsSubtitle}>Discover our exclusive collection of handpicked kurtas and kurtis</Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureTitle}>Premium Quality</Text>
              <Text style={styles.featureDesc}>Finest fabrics and craftsmanship for all-day comfort</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🚚</Text>
              <Text style={styles.featureTitle}>Free Shipping</Text>
              <Text style={styles.featureDesc}>On orders above ₹999 across India</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureTitle}>Easy Returns</Text>
              <Text style={styles.featureDesc}>7-day hassle-free return policy</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💎</Text>
              <Text style={styles.featureTitle}>100% Authentic</Text>
              <Text style={styles.featureDesc}>Original designs in kurtas and kurtis</Text>
            </View>
          </View>
        </View>



        <Footer />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView >
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
  // Hero
  heroSection: {
    width: width,
    height: width * 1.5, // Aspect ratio roughly matching content
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  // Sections General
  section: {
    paddingVertical: 25,
    backgroundColor: '#fafafa', // subtle bg for contrast
  },
  centerHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  serifTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    // fontFamily: 'serif', // Note: Android supports 'serif' by default
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    width: 40,
    backgroundColor: '#ccc',
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#999',
    marginHorizontal: 8,
  },
  // Circular Categories
  categoryList: {
    paddingHorizontal: 15,
  },
  categoryCircleCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 90,
  },
  categoryCircleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: '#fff',
  },
  categoryCircleImage: {
    width: '100%',
    height: '100%',
  },
  categoryNameContainer: {
    alignItems: 'center',
  },
  categoryCircleName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 4,
  },
  categoryUnderline: {
    height: 2,
    width: 0, // Animate this if possible, static for now
    backgroundColor: '#888',
  },
  // Product Cards (Carousel)
  productList: {
    paddingHorizontal: 15,
  },
  productCard: {
    width: 170, // Fixed width for carousel items
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 0, // Frontend uses standard div corners, maybe slightly rounded
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  gridProductCard: {
    width: '100%', // Flexible in grid
    marginRight: 0,
    marginBottom: 0,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 0.75, // 3:4 ratio
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e11d48', // heavy pink/red
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  saleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
    height: 36, // limit height for 2 lines
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  mrpText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534', // green-700
  },
  // Banners
  bannerContainer: {
    paddingHorizontal: 15,
  },
  bannerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: 200, // Adjust height as needed
    resizeMode: 'cover',
  },
  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  // Why Choose Us
  whyChooseUsSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  whyChooseUsTitle: {
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#333',
  },
  whyChooseUsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '300',
  },
  featuresContainer: {
    width: '100%',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#333',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '300',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
