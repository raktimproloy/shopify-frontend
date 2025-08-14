import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Categories } from '@/components/home/Categories';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/layout/Footer';
import { fetchProducts, type Product } from '@/lib/api';

export default async function Home() {
  // Fetch featured products server-side
  let featuredProducts: Product[] = [];
  let error: string | null = null;
  
  try {
    const response = await fetchProducts({
      limit: 8, // Show 8 featured products
      offset: 0,
      status: ['active'], // Only show active products
      includeDeleted: false
    });
    
    if (response.success) {
      featuredProducts = response.products;
    } else {
      error = 'Failed to fetch products';
    }
  } catch (err) {
    console.error('Failed to fetch featured products:', err);
    error = 'Failed to load featured products';
  }

  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <FeaturedProducts products={featuredProducts} error={error} />
        <Categories />
        <Newsletter />
      </main>
    </div>
  );
}
