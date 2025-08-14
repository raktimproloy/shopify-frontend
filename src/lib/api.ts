export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: string;
  weight: string;
  dimensions: string | null;
  images: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  basePrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface ProductFilters {
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
  search?: string;
  category?: string[];
  brand?: string[];
  status?: string[];
  minPrice?: number;
  maxPrice?: number;
  color?: string[];
  size?: string[];
  style?: string[];
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
}

const API_BASE_URL = 'http://localhost:3001/api';

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());
    if (filters.includeDeleted) queryParams.append('includeDeleted', 'true');
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category && filters.category.length > 0) {
      filters.category.forEach(cat => queryParams.append('category', cat));
    }
    if (filters.brand && filters.brand.length > 0) {
      filters.brand.forEach(b => queryParams.append('brand', b));
    }
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(s => queryParams.append('status', s));
    }
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.color && filters.color.length > 0) {
      filters.color.forEach(c => queryParams.append('color', c));
    }
    if (filters.size && filters.size.length > 0) {
      filters.size.forEach(s => queryParams.append('size', s));
    }
    if (filters.style && filters.style.length > 0) {
      filters.style.forEach(s => queryParams.append('style', s));
    }

    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`, {
      // Add cache options for server-side rendering
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}