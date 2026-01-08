export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main
  MainTab: undefined; // Contains Home, Shop, Wishlist, Profile

  // Products
  ProductList: { category?: string; subCategory?: string; title?: string };
  ProductDetail: { id: string };
  Search: undefined;

  // Checkout
  Cart: undefined;
  Address: undefined;
  Payment: { payuData: any };
  OrderSuccess: { orderId: string };
  OrderFailure: undefined;

  // Static
  // Static
  Static: { type: 'about' | 'contact' | 'terms' | 'privacy' | 'shipping' | 'returns' };
};

// Also define Tab params if we strictly type them
export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  Wishlist: undefined;
  Profile: undefined;
};



