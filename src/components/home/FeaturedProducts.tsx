import { ProductCard } from '@/components/common/ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Classic T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 128,
    isNew: true
  },
  {
    id: '2',
    name: 'Denim Jeans',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    rating: 4.2,
    reviewCount: 89,
    isOnSale: true,
    discount: 20
  },
  {
    id: '3',
    name: 'Sneakers',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '4',
    name: 'Hoodie',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    rating: 4.3,
    reviewCount: 67
  }
];

export function FeaturedProducts() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
