import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSliderProps {
    slides: Array<{ desktop: string; alt: string }>;
    mobileSrc: string;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, mobileSrc }) => {
    // Function to ensure image URL is PNG if it's an SVG from cloudinary
    const getImageUrl = (url: string) => {
        if (!url) return '';
        // Check if it's a cloudinary url
        if (url.includes('cloudinary.com')) {
            // Replace .svg with .png at the end
            if (url.endsWith('.svg')) {
                return url.replace('.svg', '.png');
            }
        }
        return url;
    };

    // Frontend logic: Mobile view shows mobileSrc if available, otherwise fallback to first desktop slide.
    // We prioritize mobileSrc as per Home.jsx configuration.
    const imageUri = getImageUrl(mobileSrc || slides[0]?.desktop);

    if (!imageUri) return null;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: width * 1.15, // Reduced height as requested
        backgroundColor: '#f0f0f0', // Placeholder color
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default HeroSlider;
