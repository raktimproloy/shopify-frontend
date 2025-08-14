import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product, ProductVariant } from '@/lib/api';

export function useCartOperations() {
  const { addToCart, updateCartItem, removeFromCart, clearCart } = useCart();
  const [isOperating, setIsOperating] = useState(false);

  const handleAddToCart = async (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (!variant) return;
    
    try {
      setIsOperating(true);
      await addToCart(product, variant, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, variantId: number, quantity: number) => {
    try {
      setIsOperating(true);
      await updateCartItem(productId, variantId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  const handleRemoveItem = async (productId: number, variantId: number) => {
    try {
      setIsOperating(true);
      await removeFromCart(productId, variantId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setIsOperating(true);
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  return {
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    isOperating,
  };
}
