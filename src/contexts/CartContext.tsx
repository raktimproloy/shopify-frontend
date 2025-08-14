'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Cart, CartItem, cartService } from '@/lib/cart';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (product: any, variant: any, quantity?: number) => Promise<void>;
  updateCartItem: (productId: number, variantId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number, variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  isItemInCart: (productId: number, variantId: number) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = async (product: any, variant: any, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addToCart(product, variant, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId: number, variantId: number, quantity: number) => {
    try {
      const updatedCart = await cartService.updateCartItem(productId, variantId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: number, variantId: number) => {
    try {
      const updatedCart = await cartService.removeFromCart(productId, variantId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const getCartItemCount = (): number => {
    return cart?.totalItems || 0;
  };

  const isItemInCart = (productId: number, variantId: number): boolean => {
    if (!cart) return false;
    return cart.items.some(
      item => item.productId === productId && item.variantId === variantId
    );
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    isItemInCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
