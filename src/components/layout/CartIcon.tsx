'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function CartIcon() {
  const { getCartItemCount, loading } = useCart();
  const itemCount = getCartItemCount();

  return (
    <Link href="/cart" className="relative group">
      <div className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
        <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-gray-900" />
        
        {!loading && itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
        
        {loading && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-gray-300 rounded-full animate-pulse" />
        )}
      </div>
    </Link>
  );
}
