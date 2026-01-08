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

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    {
      name: t('collection'),
      path: 'ProductList',
      params: { category: 'Collection' },
      subcategories: [
        { name: t('swadhyaya_collection'), path: 'ProductList', params: { category: 'Collection', subcategory: 'swadhyaya-collection' } },
        { name: t('sundowner_collection'), path: 'ProductList', params: { category: 'Collection', subcategory: 'sundowner-collection' } },
        { name: t('deewangi_collection'), path: 'ProductList', params: { category: 'Collection', subcategory: 'deewangi-collection' } },
        { name: t('mehrang_collection'), path: 'ProductList', params: { category: 'Collection', subcategory: 'mehrang-collection' } },
        { name: t('virsa_collection'), path: 'ProductList', params: { category: 'Collection', subcategory: 'virsa-collection' } },
        { name: t('barati_broz'), path: 'ProductList', params: { category: 'Collection', subcategory: 'barati-broz' } },
      ],
    },
    {
      name: t('men'),
      path: 'ProductList',
      params: { category: 'Men' },
      subcategories: [
        { name: t('kurtas'), path: 'ProductList', params: { category: 'Men', subcategory: 'kurtas' } },
        { name: t('men_kurta_sets'), path: 'ProductList', params: { category: 'Men', subcategory: 'men-kurta-sets' } },
        { name: t('kurta_dupatta_sets'), path: 'ProductList', params: { category: 'Men', subcategory: 'kurta-dupatta-sets' } },
        { name: t('sherwanis'), path: 'ProductList', params: { category: 'Men', subcategory: 'sherwanis' } },
        { name: t('men_nehru_jackets'), path: 'ProductList', params: { category: 'Men', subcategory: 'men-nehru-jackets' } },
        { name: t('blazers'), path: 'ProductList', params: { category: 'Men', subcategory: 'blazers' } },
        { name: t('bottomwear'), path: 'ProductList', params: { category: 'Men', subcategory: 'bottomwear' } },
        { name: t('tshirt'), path: 'ProductList', params: { category: 'Men', subcategory: 'tshirt' } },
      ],
    },
    {
      name: t('women'),
      path: 'ProductList',
      params: { category: 'Women' },
      subcategories: [
        { name: t('kurtis'), path: 'ProductList', params: { category: 'Women', subcategory: 'kurtis' } },
        { name: t('women_kurti_sets'), path: 'ProductList', params: { category: 'Women', subcategory: 'women-kurti-sets' } },
        { name: t('women_comfort_wear'), path: 'ProductList', params: { category: 'Women', subcategory: 'women-comfort-wear' } },
      ],
    },
    {
      name: t('girls'),
      path: 'ProductList',
      params: { category: 'Girls' },
      subcategories: [
        { name: t('dress'), path: 'ProductList', params: { category: 'Girls', subcategory: 'dress' } },
        { name: t('girls_kurti_set'), path: 'ProductList', params: { category: 'Girls', subcategory: 'girls-kurti-set' } },
        { name: t('lehenga_set'), path: 'ProductList', params: { category: 'Girls', subcategory: 'lehenga-set' } },
        { name: t('anarkali'), path: 'ProductList', params: { category: 'Girls', subcategory: 'anarkali' } },
        { name: t('girls_comfort_wear'), path: 'ProductList', params: { category: 'Girls', subcategory: 'girls-comfort-wear' } },
      ],
    },
    {
      name: t('sishu'),
      path: 'ProductList',
      params: { category: 'Sishu' },
      subcategories: [
        { name: t('sishu_boys'), path: 'ProductList', params: { category: 'Sishu', subcategory: 'sishu-boys' } },
        { name: t('sishu_girls'), path: 'ProductList', params: { category: 'Sishu', subcategory: 'sishu-girls' } },
      ],
    },
    {
      name: t('silk'),
      path: 'ProductList',
      params: { category: 'silk' },
      subcategories: [
        { name: t('soft_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'soft-silk-sarees' } },
        { name: t('kanjivaram_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'kanjivaram-silk-sarees' } },
        { name: t('banarasi_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'banarasi-silk-sarees' } },
        { name: t('maheshwari_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'maheshwari-silk-sarees' } },
        { name: t('raw_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'raw-silk-sarees' } },
        { name: t('mysore_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'mysore-silk-sarees' } },
        { name: t('sambalpuri_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'sambalpuri-silk-sarees' } },
        { name: t('kalamkari_print_silk_sarees'), path: 'ProductList', params: { category: 'silk', subcategory: 'kalamkari-print-silk-sarees' } },
      ],
    },
    {
      name: t('cotton'),
      path: 'ProductList',
      params: { category: 'cotton' },
      subcategories: [
        { name: t('bengali_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'bengali-cotton-sarees' } },
        { name: t('maheshwari_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'maheshwari-cotton-sarees' } },
        { name: t('jaipur_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'jaipur-cotton-sarees' } },
        { name: t('south_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'south-cotton-sarees' } },
        { name: t('office_wear_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'office-wear-cotton-sarees' } },
        { name: t('dr_khadi_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'dr-khadi-cotton-sarees' } },
        { name: t('block_printed_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'block-printed-cotton-sarees' } },
        { name: t('bagru_print_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'bagru-print-cotton-sarees' } },
        { name: t('ajrakh_print_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'ajrakh-print-cotton-sarees' } },
        { name: t('ikkat_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'ikkat-cotton-sarees' } },
        { name: t('kalamkari_cotton_sarees'), path: 'ProductList', params: { category: 'cotton', subcategory: 'kalamkari-cotton-sarees' } },
      ],
    },
    {
      name: t('regional'),
      path: 'ProductList',
      params: { category: 'regional' },
      subcategories: [
        { name: t('sambalpuri_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'sambalpuri-regional-sarees' } },
        { name: t('kanjivaram_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'kanjivaram-regional-sarees' } },
        { name: t('bengali_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'bengali-regional-sarees' } },
        { name: t('mysore_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'mysore-regional-sarees' } },
        { name: t('maheshwari_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'maheshwari-regional-sarees' } },
        { name: t('karnataka_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'karnataka-regional-sarees' } },
        { name: t('tamilnadu_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'tamilnadu-regional-sarees' } },
        { name: t('banarasi_regional_sarees'), path: 'ProductList', params: { category: 'regional', subcategory: 'banarasi-regional-sarees' } },
        { name: t('banarasi_regional_dupatta'), path: 'ProductList', params: { category: 'regional', subcategory: 'banarasi-regional-dupatta' } },
      ],
    },
    {
      name: t('banarasi'),
      path: 'ProductList',
      params: { category: 'banarasi' },
      subcategories: [
        { name: t('banarasi_sarees'), path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-sarees' } },
        { name: t('banarasi_dupatta'), path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-dupatta' } },
        { name: t('banarasi_dress_material'), path: 'ProductList', params: { category: 'banarasi', subcategory: 'banarasi-dress-material' } },
      ],
    },
    {
      name: t('designer_sarees'),
      path: 'ProductList',
      params: { category: 'designer-sarees' },
      subcategories: [
        { name: t('party_wear_saree'), path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'party-wear-saree' } },
        { name: t('wedding_sarees'), path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'wedding-sarees' } },
        { name: t('festive_sarees'), path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'festive-sarees' } },
        { name: t('bollywood_style_sarees'), path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'bollywood-style-sarees' } },
        { name: t('heavy_embroidered_sarees'), path: 'ProductList', params: { category: 'designer-sarees', subcategory: 'heavy-embroidered-sarees' } },
      ],
    },
    {
      name: t('printed_sarees'),
      path: 'ProductList',
      params: { category: 'printed-sarees' },
      subcategories: [
        { name: t('floral_printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'floral-printed-sarees' } },
        { name: t('digital_printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'digital-printed-sarees' } },
        { name: t('block_printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'block-printed-sarees' } },
        { name: t('abstract_printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'abstract-printed-sarees' } },
        { name: t('geometric_printed_sarees'), path: 'ProductList', params: { category: 'printed-sarees', subcategory: 'geometric-printed-sarees' } },
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
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Category Strip - Horizontal Scroll */}
      <View style={[styles.categoryStripContainer, { borderTopColor: colors.border }]}>
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
                  { color: activeCategory === category.name ? '#e11d48' : colors.text }
                ]}
              >
                {category.name}
              </Text>
              <Ionicons
                name={activeCategory === category.name ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={activeCategory === category.name ? '#e11d48' : colors.text}
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
              style={[styles.modalContent, { backgroundColor: colors.card }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCategory?.name}</Text>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveCategory(null);
                      if (selectedCategory) {
                        navigation.navigate(selectedCategory.path, selectedCategory.params);
                      }
                    }}
                    style={[styles.viewAllButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.viewAllText, { color: colors.text }]}>All {selectedCategory?.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveCategory(null)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.subcategoriesList}>
                {selectedCategory?.subcategories.map((subcategory, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.subcategoryItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleSubcategoryPress(subcategory)}
                  >
                    <Text style={[styles.subcategoryText, { color: colors.subText }]}>{subcategory.name}</Text>
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
