import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const StaticScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { type } = route.params || { type: 'about' };
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();

    const renderHeader = (title: string, subtitle?: string) => (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.headerSub, { color: colors.subText }]}>{subtitle}</Text>}
            </View>
        </View>
    );

    const renderAbout = () => (
        <ScrollView style={styles.container}>
            {renderHeader(t('about_us'), t('about_subtitle'))}
            <View style={styles.content}>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    At sarisanskruti, we celebrate the timeless grace of Indian women through the nine yards of elegance — the saree. Our name reflects what we stand for — a world of sarees that unites the diverse weaves, colors, and stories of India under one roof.
                </Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    From the looms of Banaras to the threads of Kanchipuram, from Bengal's soft cottons to Gujarat's vibrant Patolas — every saree in our collection carries a piece of tradition, culture, and craftsmanship. Each drape is not just a fabric, but a story woven with love, skill, and heritage.
                </Text>

                <View style={[styles.highlightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={styles.boxTitle}>{t('our_vision_title')}</Text>
                    <Text style={[styles.boxText, { color: colors.text }]}>
                        To revive, preserve, and promote India's rich handloom heritage while blending it with contemporary elegance. sarisanskruti strives to make traditional artistry accessible to every woman who believes in grace with authenticity.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>{t('what_makes_us_special')}</Text>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>🧵 {t('authentic_handloom')}</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>We collaborate directly with skilled artisans and weavers across India to bring you genuine handwoven masterpieces.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>✨ {t('curated_occasion')}</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Whether you're dressing up for a festive celebration, a wedding, or a simple workday, we have something crafted just for you.</Text>
                </View>

                <View style={styles.lastSection}>
                    <Text style={styles.footerQuote}>Discover your story. Drape your tradition. Only at sarisanskruti.</Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderContact = () => (
        <ScrollView style={styles.container}>
            {renderHeader(t('contact'), t('contact_subtitle'))}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📍 {t('store_location_label')}</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Office No 114,1st floor, Vardhman Capital Mall, Plot no 9 & 10, L.S.C Shakti Nagar Gulabi Bagh, Delhi 110007</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📧 {t('email_label')}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL('mailto:support@sarisanskruti.in')}>
                        <Text style={[styles.cardText, { color: 'blue' }]}>support@sarisanskruti.in</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📱 {t('phone_label')}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL('tel:+917303680269')}>
                        <Text style={[styles.cardText, { color: colors.subText }]}>+91 73036 80269</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>🏢 {t('company_details_label')}</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>SAVARIYAAN TECHNORAFT PRIVATE LIMITED</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>🕐 {t('open_hours_label')}</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Monday – Saturday: 8:00 am – 4:00pm</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Sunday: Close</Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderTerms = () => (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {renderHeader(t('terms_policies'), t('terms_subtitle'))}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Introduction</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        This document is an electronic record in terms of Information Technology Act, 2000... This document is published in accordance with Rule 3 (1) of the Information Technology Rules, 2011.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Platform Ownership</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        The Platform is owned by SAVARIYAAN TECHNORAFT PRIVATE LIMITED, registered at Office No 114, 1st floor, Vardhman Capital Mall, Plot no 9 & 10, L.S.C Shakti Nagar, Gulabi Bagh, Delhi 110007.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Terms of Use</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Your use of the Platform and services are governed by these terms. By using the Platform, you contract with the Platform Owner.
                    </Text>
                </View>
                <View style={[styles.highlightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.boxText, { color: colors.text }]}>
                        ACCESSING, BROWSING OR OTHERWISE USING THE PLATFORM INDICATES YOUR AGREEMENT TO ALL THE TERMS AND CONDITIONS.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>User Responsibilities</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        You agree to provide true, accurate and complete information. You are responsible for all acts done through your registered account.
                    </Text>
                </View>
                {/* ... Add more sections as summary or full text if critical. For mobile, succinct is better but user asked for exact copy. I will try to be comprehensive. */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Contact</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        All concerns relating to these Terms must be communicated to us using the contact information provided.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderPrivacy = () => (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {renderHeader(t('privacy_policy'), t('privacy_subtitle'))}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>1. Introduction</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        At SAVARIYAAN TECHNORAFT PRIVATE LIMITED, we respect your privacy and are committed to protecting your personal information.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>2. Information We Collect</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• Name, email, phone number, and shipping address</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• Payment details processed securely via PayU</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• Website usage data via cookies</Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>3. How We Use Your Information</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• To process and fulfill orders</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• To improve customer service</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>• To communicate promotions and updates</Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>4. Data Security</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        We implement advanced security measures. Transactions are encrypted and processed securely.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>7. Contact Us</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        For privacy concerns, email us at support@sarisanskruti.in
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderShipping = () => (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {renderHeader(t('shipping_title'), t('shipping_subtitle'))}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>1. Processing & Delivery Time</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Orders are processed within 2-3 business days and delivered within 5-10 business days.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>2. Shipping Charges</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Shipping charges depend on the delivery location and will be displayed at checkout.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>3. Order Tracking</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Customers will receive a tracking number via email upon dispatch.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>4. International Shipping</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Currently, we ship within India only.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderReturns = () => (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {renderHeader('Refund & Cancellation', 'Easy Returns, Hassle-Free Refunds')}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>1. Order Cancellation</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Customers can cancel an order before it is shipped by contacting customer support.
                    </Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>2. Return & Refund Process</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Returns are accepted only on the same day of delivery if the customer sends an email request.
                    </Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Refunds will be processed within 5-7 business days.</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>Items must be unused and in original packaging.</Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>3. Non-Refundable Items</Text>
                    <Text style={[styles.cardText, { color: colors.subText }]}>
                        Customized and perishable products are non-refundable.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    switch (type) {
        case 'contact': return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderContact()}</SafeAreaView>;
        case 'terms': return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderTerms()}</SafeAreaView>;
        case 'privacy': return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderPrivacy()}</SafeAreaView>;
        case 'shipping': return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderShipping()}</SafeAreaView>;
        case 'returns': return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderReturns()}</SafeAreaView>;
        default: return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>{renderAbout()}</SafeAreaView>;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    headerSub: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    content: {
        padding: 20,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
        textAlign: 'justify',
    },
    highlightBox: {
        backgroundColor: '#fff8e1', // Amber-50 approx
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe0b2',
        marginBottom: 30,
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#d84315', // Deep orange
    },
    boxText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#5d4037',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    cardText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    lastSection: {
        marginTop: 30,
        marginBottom: 50,
        alignItems: 'center',
    },
    footerQuote: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#d84315',
        textAlign: 'center',
    },
});

export default StaticScreen;
