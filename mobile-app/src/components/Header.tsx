import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    {
      name: 'COLLECTION',
      path: 'ProductList',
      params: { category: 'Collection' },
      subcategories: [
        { name: 'Swadhyaya collection', path: 'ProductList', params: { category: 'Collection', subcategory: 'swadhyaya-collection' } },
        { name: 'Sundowner collection', path: 'ProductList', params: { category: 'Collection', subcategory: 'sundowner-collection' } },
        { name: 'Deewangi collection', path: 'ProductList', params: { category: 'Collection', subcategory: 'deewangi-collection' } },
        { name: 'Mehrang collection', path: 'ProductList', params: { category: 'Collection', subcategory: 'mehrang-collection' } },
        { name: 'Virsa collection', path: 'ProductList', params: { category: 'Collection', subcategory: 'virsa-collection' } },
        { name: 'Barati broz', path: 'ProductList', params: { category: 'Collection', subcategory: 'barati-broz' } },
      ],
    },
    {
      name: 'MEN',
      path: 'ProductList',
      params: { category: 'Men' },
      subcategories: [
        { name: 'Kurtas', path: 'ProductList', params: { category: 'Men', subcategory: 'kurtas' } },
        { name: 'Men Kurta Sets', path: 'ProductList', params: { category: 'Men', subcategory: 'men-kurta-sets' } },
        { name: 'Kurta Dupatta Sets', path: 'ProductList', params: { category: 'Men', subcategory: 'kurta-dupatta-sets' } },
        { name: 'Sherwanis', path: 'ProductList', params: { category: 'Men', subcategory: 'sherwanis' } },
        { name: 'Men Nehru Jackets', path: 'ProductList', params: { category: 'Men', subcategory: 'men-nehru-jackets' } },
        { name: 'Blazers', path: 'ProductList', params: { category: 'Men', subcategory: 'blazers' } },
        { name: 'Bottomwear', path: 'ProductList', params: { category: 'Men', subcategory: 'bottomwear' } },
        { name: 'TShirt', path: 'ProductList', params: { category: 'Men', subcategory: 'tshirt' } },
      ],
    },
    {
      name: 'WOMEN',
      path: 'ProductList',
      params: { category: 'Women' },
      subcategories: [
        { name: 'Kurtis', path: 'ProductList', params: { category: 'Women', subcategory: 'kurtis' } },
        { name: 'Women Kurti Sets', path: 'ProductList', params: { category: 'Women', subcategory: 'women-kurti-sets' } },
        { name: 'Women Comfort Wear', path: 'ProductList', params: { category: 'Women', subcategory: 'women-comfort-wear' } },
      ],
    },
    {
      name: 'GIRLS',
      path: 'ProductList',
      params: { category: 'Girls' },
      subcategories: [
        { name: 'Dress', path: 'ProductList', params: { category: 'Girls', subcategory: 'dress' } },
        { name: 'Girls Kurti Set', path: 'ProductList', params: { category: 'Girls', subcategory: 'girls-kurti-set' } },
        { name: 'Lehenga Set', path: 'ProductList', params: { category: 'Girls', subcategory: 'lehenga-set' } },
        { name: 'Anarkali', path: 'ProductList', params: { category: 'Girls', subcategory: 'anarkali' } },
        { name: 'Girls Comfort Wear', path: 'ProductList', params: { category: 'Girls', subcategory: 'girls-comfort-wear' } },
      ],
    },
    {
      name: 'SISHU',
      path: 'ProductList',
      params: { category: 'Sishu' },
      subcategories: [
        { name: 'Sishu Boys', path: 'ProductList', params: { category: 'Sishu', subcategory: 'sishu-boys' } },
        { name: 'Sishu Girls', path: 'ProductList', params: { category: 'Sishu', subcategory: 'sishu-girls' } },
      ],
    },
    {
      name: 'SILK',
      path: 'ProductList',
      params: { category: 'silk' },
      subcategories: [
        { name: 'SOFT SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'soft-silk-sarees' } },
        { name: 'KANJIVARAM SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'kanjivaram-silk-sarees' } },
        { name: 'BANARASI SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'banarasi-silk-sarees' } },
        { name: 'MAHESHWARI SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'maheshwari-silk-sarees' } },
        { name: 'RAW SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'raw-silk-sarees' } },
        { name: 'MYSORE SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'mysore-silk-sarees' } },
        { name: 'SAMBALPURI SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'sambalpuri-silk-sarees' } },
        { name: 'KALAMKARI PRINT SILK SAREES', path: 'ProductList', params: { category: 'silk', subcategory: 'kalamkari-print-silk-sarees' } },
      ],
    },
    {
      name: 'COTTON',
      path: 'ProductList',
      params: { category: 'cotton' },
      subcategories: [
        { name: 'BENGALI COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'bengali-cotton-sarees' } },
        { name: 'MAHESHWARI COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'maheshwari-cotton-sarees' } },
        { name: 'JAIPUR COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'jaipur-cotton-sarees' } },
        { name: 'SOUTH COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'south-cotton-sarees' } },
        { name: 'OFFICE WEAR COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'office-wear-cotton-sarees' } },
        { name: 'DR.KHADI COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'dr-khadi-cotton-sarees' } },
        { name: 'BLOCK PRINTED COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'block-printed-cotton-sarees' } },
        { name: 'BAGRU PRINT COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'bagru-print-cotton-sarees' } },
        { name: 'AJRAKH PRINT COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'ajrakh-print-cotton-sarees' } },
        { name: 'IKKAT COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'ikkat-cotton-sarees' } },
        { name: 'KALAMKARI COTTON SAREES', path: 'ProductList', params: { category: 'cotton', subcategory: 'kalamkari-cotton-sarees' } },
      ],
    },
    {
      name: 'REGIONAL',
      path: 'ProductList',
      params: { category: 'regional' },
      subcategories: [
        { name: 'SAMBALPURI REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'sambalpuri-regional-sarees' } },
        { name: 'KANJIVARAM REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'kanjivaram-regional-sarees' } },
        { name: 'BENGALI REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'bengali-regional-sarees' } },
        { name: 'MYSORE REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'mysore-regional-sarees' } },
        { name: 'MAHESHWARI REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'maheshwari-regional-sarees' } },
        { name: 'KARNATAKA REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'karnataka-regional-sarees' } },
        { name: 'TAMILNADU REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'tamilnadu-regional-sarees' } },
        { name: 'BANARASI REGIONAL SAREES', path: 'ProductList', params: { category: 'regional', subcategory: 'banarasi-regional-sarees' } },
        { name: 'BANARASI REGIONAL DUPATTA', path: 'ProductList', params: { category: 'regional', subcategory: 'banarasi-regional-dupatta' } },
      ],
    },
    {
      name: 'BANARASI',
      path: 'ProductList',
      params: { category: 'banarasi' },
      subcategories: [
        { name: 'BANARASI SAREES', path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-sarees' } },
        { name: 'BANARASI DUPATTA', path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-dupatta' } },
        { name: 'BANARASI DRESS MATERIAL', path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-dress-material' } },
      ],
    },
    {
      name: 'DESIGNER SAREES',
      path: 'ProductList',
      params: { category: 'designer-sarees' },
      subcategories: [
        { name: 'PARTY WEAR SAREE', path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'party-wear-saree' } },
        { name: 'WEDDING SAREES', path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'wedding-sarees' } },
        { name: 'FESTIVE SAREES', path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'festive-sarees' } },
        { name: 'BOLLYWOOD STYLE SAREES', path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'bollywood-style-sarees' } },
        { name: 'HEAVY EMBROIDERED SAREES', path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'heavy-embroidered-sarees' } },
      ],
    },
    {
      name: 'PRINTED SAREES',
      path: 'ProductList',
      params: { category: 'printed-sarees' },
      subcategories: [
        { name: 'FLORAL PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'floral-printed-sarees' } },
        { name: 'DIGITAL PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'digital-printed-sarees' } },
        { name: 'BLOCK PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'block-printed-sarees' } },
        { name: 'ABSTRACT PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'abstract-printed-sarees' } },
        { name: 'GEOMETRIC PRINTED SAREES', path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'geometric-printed-sarees' } },
      ],
    },
  ];

  const handleCategoryPress = (category: typeof categories[0]) => {
    if (activeCategory === category.name) {
      setActiveCategory(null);
      navigation.navigate(category.path, category.params);
    } else {
      setActiveCategory(category.name);
    }
  };

  const handleSubcategoryPress = (subcategory: any) => {
    setActiveCategory(null);
    navigation.navigate(subcategory.path, subcategory.params);
  };

  // Safe check if activeCategory is valid
  const selectedCategory = activeCategory
    ? categories.find((cat) => cat.name === activeCategory)
    : null;

  return (
    <View style={styles.container}>
      {/* Category Strip - Horizontal Scroll */}
      <View style={styles.categoryStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStrip}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryButton,
                activeCategory === category.name && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
              <Ionicons
                name={activeCategory === category.name ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={activeCategory === category.name ? '#e11d48' : '#555'}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subcategories Modal */}
      <Modal
        visible={activeCategory !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveCategory(null)}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setActiveCategory(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCategory?.name}</Text>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveCategory(null);
                      if (selectedCategory) {
                        navigation.navigate(selectedCategory.path, selectedCategory.params);
                      }
                    }}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>All {selectedCategory?.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveCategory(null)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.subcategoriesList}>
                {selectedCategory?.subcategories.map((subcategory, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.subcategoryItem}
                    onPress={() => handleSubcategoryPress(subcategory)}
                  >
                    <Text style={styles.subcategoryText}>{subcategory.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 40,
  },
  categoryStripContainer: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  categoryStrip: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryButtonActive: {
    borderBottomColor: '#e11d48',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 0.5,
  },
  categoryTextActive: {
    color: '#e11d48',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    // Max height handling is implicit with flex 1 in justify-end overlay? No, creates full screen modal from top 100.
    height: '80%', // Limit height
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
    fontWeight: '600',
    color: '#333',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  viewAllText: {
    fontSize: 12,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subcategoriesList: {
    flex: 1,
  },
  subcategoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#666',
  },
});

export default Header;
