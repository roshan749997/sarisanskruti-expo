import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/api';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<Product[]>([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const stored = await AsyncStorage.getItem('wishlist');
            if (stored) {
                setWishlist(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load wishlist', e);
        }
    };

    const addToWishlist = async (product: Product) => {
        const exists = wishlist.some((p) => p._id === product._id);
        if (!exists) {
            const newWishlist = [...wishlist, product];
            setWishlist(newWishlist);
            await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
        }
    };

    const removeFromWishlist = async (productId: string) => {
        const newWishlist = wishlist.filter((p) => p._id !== productId);
        setWishlist(newWishlist);
        await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
