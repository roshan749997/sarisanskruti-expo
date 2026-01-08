import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
    loadCart: (silent?: boolean) => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    // Debounce refs
    const updateTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

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

    const loadCart = useCallback(async (silent = false) => {
        if (!(await hasToken())) {
            setCart([]);
            return;
        }
        try {
            if (!silent) setLoading(true);
            const data = await api.getCart();
            setCart(mapServerCartToUI(data));
        } catch (error) {
            console.log('Error loading cart', error);
        } finally {
            if (!silent) setLoading(false);
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

        let product: any = null;
        let productId: string;

        if (typeof productIdOrObj === 'object' && productIdOrObj !== null) {
            product = productIdOrObj;
            productId = product._id || product.id;
        } else {
            productId = productIdOrObj;
        }

        // Optimistic Update
        const previousCart = [...cart];

        // UI Update
        setCart(prev => {
            const existingIndex = prev.findIndex(i => i.id === productId);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                };
                return updated;
            } else if (product) {
                // Add new item
                const price = typeof product.price === 'number'
                    ? product.price
                    : (typeof product.mrp === 'number' ? Math.round(product.mrp - (product.mrp * (product.discountPercent || 0) / 100)) : 0);

                const newItem: CartItem = {
                    id: productId,
                    name: product.title || product.name || 'Product',
                    image: product.images?.image1 || product.image || '',
                    price: price,
                    originalPrice: product.mrp || 0,
                    quantity: quantity,
                    material: product.product_info?.SareeMaterial || product.material,
                    brand: product.product_info?.brand || product.brand,
                    color: product.product_info?.KurtiColor || product.product_info?.SareeColor || product.color,
                };
                return [...prev, newItem];
            }
            return prev;
        });

        try {
            // API Call
            await api.addToCart(productId, quantity);
            // Silent sync
            loadCart(true).catch(e => console.log('Background cart sync failed', e));

        } catch (error) {
            console.error('AddToCart error', error);
            // Revert on failure
            setCart(previousCart);
            Alert.alert('Error', 'Failed to add to cart. Please check your connection.');
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!(await requireAuth())) return;

        const previousCart = [...cart];

        // Optimistic UI
        setCart(prev => prev.filter(item => item.id !== productId));

        try {
            // No loading spinner for smoother experience
            await api.removeFromCart(productId);
            // Confirm with server silently
            loadCart(true);
        } catch (error) {
            setCart(previousCart);
            Alert.alert('Error', 'Failed to remove item');
        }
    };

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (!(await requireAuth())) return;

        if (newQuantity < 1) {
            // Delegate removal to removeFromCart logic
            // But we should confirm first? Component should handle confirmation.
            // If we are here, we assume action is confirmed or intended.
            await removeFromCart(productId);
            return;
        }

        const previousCart = [...cart];

        // Optimistic UI
        setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));

        // Debounced API Sync
        if (updateTimeouts.current[productId]) {
            clearTimeout(updateTimeouts.current[productId]);
        }

        updateTimeouts.current[productId] = setTimeout(async () => {
            try {
                // Strategy: Remove then Add (Set Quantity) logic to be robust against increments
                await api.removeFromCart(productId);
                await api.addToCart(productId, newQuantity);
                // Sync
                loadCart(true);
            } catch (error) {
                console.log("Update Quantity Failed", error);
                // In debounce, reverting is hard because state might have changed again.
                // Best to just silent reload.
                loadCart(true);
            }
        }, 500);
    };

    const clearCart = async () => {
        if (!(await requireAuth())) return;
        setCart([]); // Optimistic
        try {
            // setLoading(true); // Maybe keep loading here as it's a big action
            // Actually, background is fine.
            const data = await api.getCart(); // Get fresh list to be sure what to delete? 
            // Better: loop existing cart
            // But if optimistic clear happened, 'cart' is empty.
            // We should use 'cart' from closure or just rely on IDs we know?
            // Safer:
            const currentItems = await api.getCart(); // Fetch real Items
            if (currentItems?.items) {
                for (const item of currentItems.items) {
                    await api.removeFromCart(item.product._id);
                }
            }
            loadCart(true);
        } catch (error) {
            loadCart(true); // Re-fetch if failed
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
    }, []);

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
