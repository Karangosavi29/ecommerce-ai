export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // assumed array of image URLs
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

export interface Order {
  _id: string;
  orderId?: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "razorpay" | "whatsapp";
  createdAt: string;
  [key: string]: unknown;
}

export interface RazorpayOrderResponse {
  orderId: string; // Razorpay order_id
  amount: number;
  currency: string;
  keyId?: string;
}

