import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Footer = () => {
    const navigation = useNavigation<any>();
    const currentYear = new Date().getFullYear();

    const handleLinkPress = (url: string) => {
        if (!url) {
            Alert.alert('Coming Soon', 'This social link is not set yet.');
            return;
        }
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const navigateToStatic = (type: string) => {
        navigation.navigate('Static', { type });
    };

    const navigateToCategory = (cat: string) => {
        // Assuming we want to search or simple navigation
        navigation.navigate('ProductList', { category: cat });
    };

    return (
        <View style={styles.footer}>
            <View style={styles.content}>

                {/* Brand Section */}
                <View style={styles.brandSection}>
                    <Image
                        source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766831916/2_dpnu0s.png' }} // Using PNG logic as established
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.tagline}>Follow Us</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity onPress={() => handleLinkPress('')} style={styles.socialIcon}>
                            <Ionicons name="logo-facebook" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleLinkPress('')} style={styles.socialIcon}>
                            <Ionicons name="logo-instagram" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleLinkPress('')} style={styles.socialIcon}>
                            <Ionicons name="logo-youtube" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Links Section Grid */}
                <View style={styles.linksContainer}>
                    {/* Quick Links */}
                    <View style={styles.column}>
                        <Text style={styles.columnTitle}>Quick Links</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.linkText}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToStatic('about')}>
                            <Text style={styles.linkText}>About</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToStatic('contact')}>
                            <Text style={styles.linkText}>Contact</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Categories */}
                    <View style={styles.column}>
                        <Text style={styles.columnTitle}>Categories</Text>
                        <TouchableOpacity onPress={() => navigateToCategory('Regional')}>
                            <Text style={styles.linkText}>Regional</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToCategory('Boys')}>
                            <Text style={styles.linkText}>Boys</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToCategory('Girls')}>
                            <Text style={styles.linkText}>Girls</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToCategory('Collection')}>
                            <Text style={styles.linkText}>Collection</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToCategory('Cotton')}>
                            <Text style={styles.linkText}>Cotton</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Customer Service */}
                    <View style={styles.column}>
                        <Text style={styles.columnTitle}>Customer Service</Text>
                        <TouchableOpacity onPress={() => navigateToStatic('shipping')}>
                            <Text style={styles.linkText}>Shipping Policy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigateToStatic('returns')}>
                            <Text style={styles.linkText}>Returns & Exchange</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Copyright */}
                <View style={styles.copyrightSection}>
                    <Text style={styles.copyrightText}>
                        © {currentYear} <Text style={{ fontWeight: 'bold' }}>sarisanskruti</Text>. All rights reserved.
                    </Text>
                    <Text style={styles.gstText}>GSTIN: 07ABCCS9610G1ZC</Text>

                    <View style={styles.legalLinks}>
                        <TouchableOpacity onPress={() => navigateToStatic('privacy')}>
                            <Text style={styles.legalLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.dot}>•</Text>
                        <TouchableOpacity onPress={() => navigateToStatic('terms')}>
                            <Text style={styles.legalLink}>Terms of Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginTop: 20,
    },
    content: {
        width: '100%',
    },
    brandSection: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    logo: {
        height: 60,
        width: 150,
        marginBottom: 10,
    },
    tagline: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 10,
    },
    socialIcon: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 20,
    },
    linksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
    },
    column: {
        minWidth: '45%', // 2 columns on mostly, adjust as needed
        marginBottom: 10,
    },
    columnTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        alignSelf: 'flex-start',
        paddingBottom: 2,
    },
    linkText: {
        color: '#ccc',
        fontSize: 12,
        marginBottom: 8,
    },
    copyrightSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    copyrightText: {
        color: '#ccc',
        fontSize: 10,
        marginBottom: 4,
    },
    gstText: {
        color: '#999',
        fontSize: 10,
        marginBottom: 10,
    },
    legalLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 5,
    },
    legalLink: {
        color: '#999',
        fontSize: 10,
    },
    dot: {
        color: '#666',
        fontSize: 10,
    },
});

export default Footer;
