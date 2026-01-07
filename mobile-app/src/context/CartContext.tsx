import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Alert } from 'react-native';

interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    // Extras
    material?: string;
    color?: string;
    brand?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (productId: any, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    cartCount: number;
    loadCart: () => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const hasToken = async () => {
        const token = await AsyncStorage.getItem('auth_token');
        return !!token;
    };

    const mapServerCartToUI = (data: any): CartItem[] => {
        const items = data?.items || [];
        return items.map((i: any) => {
            const p = i.product || {};
            const price = typeof p.price === 'number'
                ? p.price
                : (typeof p.mrp === 'number' ? Math.round(p.mrp - (p.mrp * (p.discountPercent || 0) / 100)) : 0);
            return {
                id: p._id,
                name: p.title,
                image: p.images?.image1,
                material: p.product_info?.SareeMaterial,
                brand: p.product_info?.brand,
                color: p.product_info?.KurtiColor || p.product_info?.SareeColor,
                price,
                originalPrice: p.mrp,
                quantity: i.quantity || 1,
            };
        });
    };

    const loadCart = useCallback(async () => {
        if (!(await hasToken())) {
            setCart([]);
            return;
        }
        try {
            setLoading(true);
            const data = await api.getCart();
            setCart(mapServerCartToUI(data));
        } catch (error) {
            console.log('Error loading cart', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const requireAuth = async (): Promise<boolean> => {
        const authenticated = await hasToken();
        if (!authenticated) {
            Alert.alert(
                'Login Required',
                'Please login to access your cart',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
            return false;
        }
        return true;
    };

    const addToCart = async (productIdOrObj: any, quantity: number = 1) => {
        if (!(await requireAuth())) return;

        let productId = productIdOrObj;
        if (typeof productIdOrObj === 'object' && productIdOrObj) {
            productId = productIdOrObj._id || productIdOrObj.id;
        }

        try {
            setLoading(true);
            await api.addToCart(productId, quantity);
            await loadCart();
        } catch (error) {
            Alert.alert('Error', 'Failed to add to cart');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!(await requireAuth())) return;
        try {
            setLoading(true);
            await api.removeFromCart(productId);
            await loadCart();
        } catch (error) {
            Alert.alert('Error', 'Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (!(await requireAuth())) return;

        if (newQuantity < 1) {
            await removeFromCart(productId);
            return;
        }

        const currentItem = cart.find(i => i.id === productId);
        const currentQty = currentItem?.quantity || 0;
        const delta = newQuantity - currentQty;

        if (delta === 0) return;

        try {
            setLoading(true);
            if (delta > 0) {
                await api.addToCart(productId, delta);
            } else {
                // Because calling addToCart with negative might not work on all backends, 
                // we play safe by removing and re-adding for now or assuming backend supports patch.
                // But the frontend logic was: removed then added.
                await api.removeFromCart(productId);
                await api.addToCart(productId, newQuantity);
            }
            await loadCart();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!(await requireAuth())) return;
        try {
            setLoading(true);
            for (const item of cart) {
                await api.removeFromCart(item.id);
            }
            await loadCart();
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = React.useMemo(() =>
        cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0),
        [cart]
    );

    const cartCount = React.useMemo(() =>
        cart.reduce((total, item) => total + (item.quantity || 1), 0),
        [cart]
    );

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only load cart once on mount

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            loadCart,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
