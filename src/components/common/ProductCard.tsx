import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    name,
    description,
    category,
    brand,
    basePrice,
    status,
    variants
  } = product;

  // Get the first variant for display purposes
  const firstVariant = variants[0];
  const price = firstVariant ? parseFloat(firstVariant.price) : parseFloat(basePrice);
  const image = firstVariant?.images?.[0] || '/placeholder-image.svg'; // Fallback image
  
  // Calculate average rating and review count (since API doesn't provide these)
  const rating = 4.5; // Default rating
  const reviewCount = 0; // Default review count

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-2">
            {status === 'active' && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Active
              </Badge>
            )}
            {category !== 'Uncategorized' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {category}
              </Badge>
            )}
          </div>
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          {/* Brand */}
          <p className="text-xs text-muted-foreground capitalize">
            {brand}
          </p>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">${price.toFixed(2)}</span>
          </div>

          {/* Variants info */}
          {variants.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {variants.length} variant{variants.length > 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
