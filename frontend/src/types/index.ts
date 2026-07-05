export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  ratings?: number;
  [key: string]: unknown;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}



export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

// One line item inside an Order — a snapshot, distinct from CartItem
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  orderType: "online" | "whatsapp";
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsTotal: number;
  shippingCharge: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: string;
  keyId?: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  [key: string]: unknown;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  [key: string]: unknown;
}

export interface AdminUserSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export interface CartItem {
  product: string;
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
  [key: string]: unknown;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}