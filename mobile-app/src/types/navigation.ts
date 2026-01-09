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
  // Cart is now in MainTab
  Address: undefined;
  Payment: { payuData: any };
  OrderSuccess: { orderId: string };
  OrderFailure: undefined;
  Wishlist: undefined; // Moved to Stack

  // Static
  // Static
  Static: { type: 'about' | 'contact' | 'terms' | 'privacy' | 'shipping' | 'returns' };
  InvoiceDownload: undefined;
};

// Also define Tab params if we strictly type them
export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined; // Moved to Tab
  Profile: undefined;
};



