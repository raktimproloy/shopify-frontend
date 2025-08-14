import { Product, ProductVariant } from './api';

export interface CartItem {
  productId: number;
  variantId: number;
  quantity: number;
  product: Product;
  variant: ProductVariant;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: number;
  variantId: number;
  quantity: number;
}

export interface RemoveFromCartRequest {
  productId: number;
  variantId: number;
}

const CART_ID_KEY = 'cart_id';
const CART_DATA_KEY = 'cart_data';

class CartService {
  private getCartId(): string {
    let cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      cartId = this.generateUniqueId();
      localStorage.setItem(CART_ID_KEY, cartId);
    }
    return cartId;
  }

  private generateUniqueId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getCartFromStorage(): Cart | null {
    try {
      const cartData = localStorage.getItem(CART_DATA_KEY);
      return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return null;
    }
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(CART_DATA_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private createNewCart(): Cart {
    const cartId = this.getCartId();
    const now = new Date().toISOString();
    
    return {
      id: cartId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  private calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.variant.price) * item.quantity), 0);
    
    return { totalItems, totalPrice };
  }

  private updateCartTotals(cart: Cart): Cart {
    const { totalItems, totalPrice } = this.calculateCartTotals(cart.items);
    return {
      ...cart,
      totalItems,
      totalPrice,
      updatedAt: new Date().toISOString()
    };
  }

  async getCart(): Promise<Cart> {
    let cart = this.getCartFromStorage();
    
    if (!cart) {
      cart = this.createNewCart();
      this.saveCartToStorage(cart);
    }
    
    return cart;
  }

  async addToCart(product: Product, variant: ProductVariant, quantity: number = 1): Promise<Cart> {
    let cart = await this.getCart();
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === product.id && item.variantId === variant.id
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        quantity,
        product,
        variant,
        addedAt: new Date().toISOString()
      };
      cart.items.push(newItem);
    }
    
    // Update cart totals
    cart = this.updateCartTotals(cart);
    this.saveCartToStorage(cart);
    
    // Sync with API
    await this.syncCartWithAPI(cart);
    
    return cart;
  }

  async updateCartItem(productId: number, variantId: number, quantity: number): Promise<Cart> {
    let cart = await this.getCart();
    
    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Update cart totals
      cart = this.updateCartTotals(cart);
      this.saveCartToStorage(cart);
      
      // Sync with API
      await this.syncCartWithAPI(cart);
    }
    
    return cart;
  }

  async removeFromCart(productId: number, variantId: number): Promise<Cart> {
    let cart = await this.getCart();
    
    cart.items = cart.items.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );
    
    // Update cart totals
    cart = this.updateCartTotals(cart);
    this.saveCartToStorage(cart);
    
    // Sync with API
    await this.syncCartWithAPI(cart);
    
    return cart;
  }

  async clearCart(): Promise<Cart> {
    const cart = this.createNewCart();
    this.saveCartToStorage(cart);
    
    // Sync with API
    await this.syncCartWithAPI(cart);
    
    return cart;
  }

  async getCartItemCount(): Promise<number> {
    const cart = await this.getCart();
    return cart.totalItems;
  }

  async isItemInCart(productId: number, variantId: number): Promise<boolean> {
    const cart = await this.getCart();
    return cart.items.some(
      item => item.productId === productId && item.variantId === variantId
    );
  }

  private async syncCartWithAPI(cart: Cart): Promise<void> {
    try {
      // Send cart data to API for persistence
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart),
      });
    } catch (error) {
      console.error('Failed to sync cart with API:', error);
    }
  }

  // API methods for server-side operations
  async fetchCartFromAPI(): Promise<Cart | null> {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch cart from API:', error);
    }
    return null;
  }

  async saveCartToAPI(cart: Cart): Promise<boolean> {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save cart to API:', error);
      return false;
    }
  }
}

export const cartService = new CartService();
