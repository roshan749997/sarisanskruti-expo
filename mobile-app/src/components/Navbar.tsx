import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Navbar = () => {
  const navigation = useNavigation<any>();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const wishlistCount = wishlist.length;

  const navLinks = [
    { name: 'HOME', path: 'Home' },
    { name: 'ABOUT', path: 'Static', params: { type: 'about' } },
    { name: 'CONTACT', path: 'Static', params: { type: 'contact' } },
  ];

  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchProducts(q);
        const items = data?.results || [];
        setSearchResults(items);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSearchResults(false);
    navigation.navigate('Search', { query: q });
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Logo */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/w_1000,q_100/v1766831916/1_osqlws.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Mobile Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) {
                setShowSearchResults(true);
              }
            }}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Icons */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Wishlist')}
            style={styles.iconButton}
          >
            <Ionicons name="heart-outline" size={22} color="#333" />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.iconButton}
          >
            <Ionicons name="bag-outline" size={22} color="#333" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Menu Button */}
          <TouchableOpacity
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.menuButton}
          >
            <Ionicons
              name={isMobileMenuOpen ? 'close' : 'menu'}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <View style={styles.searchResultsContainer}>
          {searchLoading && (
            <View style={styles.searchResultItem}>
              <Text style={styles.searchResultText}>Searching…</Text>
            </View>
          )}
          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <View style={styles.searchResultItem}>
              <Text style={styles.searchResultText}>No products found</Text>
            </View>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <ScrollView style={styles.searchResultsList} nestedScrollEnabled>
              {searchResults.slice(0, 8).map((p) => (
                <TouchableOpacity
                  key={p._id || p.id}
                  style={styles.searchResultItem}
                  onPress={() => {
                    setShowSearchResults(false);
                    navigation.navigate('ProductDetail', { id: p._id || p.id });
                  }}
                >
                  <Image
                    source={{
                      uri: p.images?.image1 || p.image || 'https://via.placeholder.com/60x80?text=No+Image',
                    }}
                    style={styles.searchResultImage}
                  />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle} numberOfLines={1}>
                      {p.title || p.name || 'Product'}
                    </Text>
                    {p.price && (
                      <Text style={styles.searchResultPrice}>
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Mobile Menu Modal */}
      <Modal
        visible={isMobileMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMobileMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setIsMobileMenuOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              {navLinks.map((link) => (
                <TouchableOpacity
                  key={link.name}
                  style={styles.menuItem}
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    if (link.params) {
                      navigation.navigate(link.path, link.params);
                    } else {
                      navigation.navigate(link.path);
                    }
                  }}
                >
                  <Text style={styles.menuItemText}>{link.name}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.menuDivider} />

              {token ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMobileMenuOpen(false);
                      navigation.navigate('Profile');
                    }}
                  >
                    <Text style={styles.menuItemText}>PROFILE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={[styles.menuItemText, styles.logoutText]}>LOGOUT</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.menuItem, styles.loginButton]}
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    navigation.navigate('Login');
                  }}
                >
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={[styles.menuItemText, styles.loginText]}>SIGN IN</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#CCC7BF',
    zIndex: 70,
  },
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  logoContainer: {
    flexShrink: 0,
  },
  logo: {
    height: 50,
    width: 120,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchButton: {
    padding: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 4,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 400,
    zIndex: 80,
  },
  searchResultsList: {
    maxHeight: 320,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultImage: {
    width: 48,
    height: 64,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  searchResultPrice: {
    fontSize: 12,
    color: '#666',
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
  },
  loginButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
  },
});

export default Navbar;

