import axios, { AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearSessionCache,
  getSessionCache,
  invalidateSessionCache,
  productListCacheKey,
  setSessionCache,
} from './sessionCache';

export { peekProduct, peekProductList } from './sessionCache';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sarisanskruti.in/api';

async function cachedGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = getSessionCache<T>(key);
  if (hit !== null) return hit;
  const data = await fetcher();
  setSessionCache(key, data);
  return data;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Reduced from 15s to 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface LoginResponse {
  token?: string;
  user?: User;
  message?: string;
}

export interface RegisterResponse {
  message?: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  images: {
    image1: string;
    image2?: string;
    image3?: string;
    image4?: string;
  };
  category: string;
  subCategory: string;
  quantity: number;
  product_info?: {
    SareeMaterial?: string;
    IncludedComponents?: string;
    brand?: string;
    KurtiColor?: string;
    SareeColor?: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response) {
      const responseData = axiosError.response.data;
      if (responseData?.message) {
        return responseData.message;
      }
      return `Error: ${axiosError.response.status}`;
    }
    if (axiosError.request) {
      return 'Network error. Please check your connection.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    // Mock check specifically for testing flow if needed, but keeping real API primary
    if (email === 'test@example.com' && password === 'password123') {
      return {
        token: 'mock-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        message: 'Login successful'
      };
    }
    const res = await apiClient.post('/auth/signin', { email, password });
    return res.data;
  },
  signup: async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/auth/signup', { name, email, password });
    return res.data;
  },
  signin: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/signin', credentials);
    return res.data;
  },
  sendOTP: async (payload: { phone: string; purpose: string; userData?: any }) => {
    const res = await apiClient.post('/auth/otp/send', payload);
    return res.data;
  },
  verifyOTPSignin: async (payload: { phone: string; otp: string }) => {
    const res = await apiClient.post('/auth/otp/verify/signin', payload);
    return res.data;
  },
  verifyOTPSignup: async (payload: { phone: string; otp: string }) => {
    const res = await apiClient.post('/auth/otp/verify/signup', payload);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  // User
  me: async () => {
    return cachedGet('user:me', async () => {
      try {
        const res = await apiClient.get('/me');
        return res.data;
      } catch {
        const res = await apiClient.get('/auth/me');
        return res.data;
      }
    });
  },
  updateProfile: async (userData: any) => {
    try {
      const res = await apiClient.put('/me', userData);
      invalidateSessionCache('user');
      return res.data;
    } catch {
      const res = await apiClient.put('/auth/me', userData);
      invalidateSessionCache('user');
      return res.data;
    }
  },
  changePassword: async (passwordData: any) => {
    const res = await apiClient.put('/auth/change-password', passwordData); // Assuming typical endpoint
    return res.data;
  },

  // Products
  getProducts: async () => {
    const key = productListCacheKey();
    return cachedGet(key, async () => {
      const res = await axios.get(`${API_URL}/products`, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    });
  },
  getProductById: async (id: string) => {
    return cachedGet(`product:${id}`, async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    });
  },
  getProductsByCategory: async (category: string) => {
    const key = productListCacheKey(category);
    return cachedGet(key, async () => {
      const res = await apiClient.get(`/products?category=${encodeURIComponent(category)}`);
      return res.data;
    });
  },

  // Cart
  getCart: async () => {
    return cachedGet('cart', async () => {
      const res = await apiClient.get('/cart');
      return res.data;
    });
  },
  addToCart: async (productId: string, quantity: number = 1) => {
    const res = await apiClient.post('/cart/add', { productId, quantity });
    invalidateSessionCache('cart');
    return res.data;
  },
  removeFromCart: async (productId: string) => {
    const res = await apiClient.delete(`/cart/remove/${productId}`);
    invalidateSessionCache('cart');
    return res.data;
  },

  // Address
  getMyAddress: async () => {
    return cachedGet('address:me', async () => {
      const res = await apiClient.get('/address/me');
      return res.data;
    });
  },
  saveMyAddress: async (payload: any) => {
    const res = await apiClient.post('/address', payload);
    invalidateSessionCache('address');
    return res.data;
  },
  updateAddressById: async (id: string, payload: any) => {
    const res = await apiClient.put(`/address/${id}`, payload);
    invalidateSessionCache('address');
    return res.data;
  },
  deleteAddressById: async (id: string) => {
    const res = await apiClient.delete(`/address/${id}`);
    invalidateSessionCache('address');
    return res.data;
  },

  // Payment
  createPayUTxn: async (amount: number, name: string, email: string, phone: string) => {
    const res = await apiClient.post('/payment/payu/create', { amount, name, email, phone });
    return res.data;
  },
  verifyPayment: async (payload: any) => {
    const res = await apiClient.post('/payment/verify', payload);
    return res.data;
  },
  createCODOrder: async () => {
    const res = await apiClient.post('/payment/cod/create');
    invalidateSessionCache('orders');
    invalidateSessionCache('cart');
    return res.data;
  },

  // Orders
  createOrder: async (orderData: any) => {
    const res = await apiClient.post('/orders', orderData);
    invalidateSessionCache('orders');
    invalidateSessionCache('cart');
    return res.data;
  },
  getMyOrders: async () => {
    return cachedGet('orders:mine', async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    });
  },

  // Search
  searchProducts: async (query: string) => {
    const q = query.trim();
    const key = productListCacheKey(undefined, q);
    return cachedGet(key, async () => {
      const res = await apiClient.get(`/header/search?query=${encodeURIComponent(q)}`);
      return res.data;
    });
  },

  clearCache: () => {
    clearSessionCache();
  },
};

export { apiClient, handleApiError };


