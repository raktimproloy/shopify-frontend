import { ProductCard } from '@/components/common/ProductCard';
import { Product } from '@/lib/api';

interface FeaturedProductsProps {
  products: Product[];
  error?: string | null;
}

export function FeaturedProducts({ products, error }: FeaturedProductsProps) {
  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">No featured products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
