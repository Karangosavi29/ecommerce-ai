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


