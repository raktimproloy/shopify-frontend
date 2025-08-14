'use client'
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/common/ProductCard';
import { fetchProducts, type Product, type ProductFilters } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    sizes: string[];
    colors: string[];
    styles: string[];
    brands: string[];
    statuses: string[];
  }>({
    categories: [],
    sizes: [],
    colors: [],
    styles: [],
    brands: [],
    statuses: []
  });
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: [],
    size: [],
    color: [],
    brand: [],
    status: [],
    style: [],
    minPrice: undefined,
    maxPrice: undefined
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Debounce filters to avoid too many API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Extract filter options from products data
  const extractFilterOptions = (products: Product[]) => {
    const categories = [...new Set(products.map(p => p.category))];
    const brands = [...new Set(products.map(p => p.brand))];
    const statuses = [...new Set(products.map(p => p.status))];
    
    // Extract sizes and colors from variants (safely)
    const sizes = [...new Set(products.flatMap(p => p.variants?.map(v => v.size) || []))];
    const colors = [...new Set(products.flatMap(p => p.variants?.map(v => v.color) || []))];
    
    // For styles, we'll use a default set since it's not in the API
    const styles = ['Casual', 'Formal', 'Sport', 'Urban'];
    
    return { categories, brands, statuses, sizes, colors, styles };
  };

  // Fetch products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await fetchProducts({
          ...debouncedFilters,
          limit: ITEMS_PER_PAGE,
          offset
        });
        
        setProducts(response.products);
        setTotalProducts(response.pagination.total);
        
        // Update filter options based on the products received
        if (response.products.length > 0) {
          const options = extractFilterOptions(response.products);
          setFilterOptions(options);
        }
      } catch (error) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedFilters, currentPage]);

  const handleFilterChange = (filterType: keyof ProductFilters, value: any) => {
    setProducts([])
    setFilters(prev => {
      const currentValues = prev[filterType] as any[];
      let newValues;
      
      if (Array.isArray(currentValues)) {
        newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
      } else {
        newValues = value;
      }
      
      // Reset to first page when filters change
      setCurrentPage(1);
      
      return { ...prev, [filterType]: newValues };
    });
  };

  const handlePriceFilter = (type: 'minPrice' | 'maxPrice', value: string) => {
    setProducts([])
    const numValue = value === '' ? undefined : parseFloat(value);
    setFilters(prev => ({
      ...prev,
      [type]: numValue
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: [],
      size: [],
      color: [],
      brand: [],
      status: [],
      style: [],
      minPrice: undefined,
      maxPrice: undefined
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">All Products</h1>
          
          {/* Search Section */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg 
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Section */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset All
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => handlePriceFilter('minPrice', e.target.value)}
                        className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handlePriceFilter('maxPrice', e.target.value)}
                        className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Category</h3>
                    <div className="space-y-2">
                      {filterOptions.categories.map((category: string) => (
                        <div key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={filters.category?.includes(category) || false}
                            onChange={() => handleFilterChange('category', category)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`category-${category}`} 
                            className="ml-2 text-gray-700"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Brand</h3>
                    <div className="space-y-2">
                      {filterOptions.brands.map((brand: string) => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-${brand}`}
                            checked={filters.brand?.includes(brand) || false}
                            onChange={() => handleFilterChange('brand', brand)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`brand-${brand}`} 
                            className="ml-2 text-gray-700"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Size Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Size</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {filterOptions.sizes.map((size: string) => (
                        <div key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`size-${size}`}
                            checked={filters.size?.includes(size) || false}
                            onChange={() => handleFilterChange('size', size)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`size-${size}`} 
                            className="ml-1 text-gray-700 text-sm"
                          >
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.colors.map((color: string) => (
                        <div key={color} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`color-${color}`}
                            checked={filters.color?.includes(color) || false}
                            onChange={() => handleFilterChange('color', color)}
                            className="sr-only"
                          />
                          <label 
                            htmlFor={`color-${color}`} 
                            className={`w-8 h-8 rounded-full border-2 ${filters.color?.includes(color) ? 'border-blue-500' : 'border-gray-300'} cursor-pointer`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Style Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Style</h3>
                    <div className="space-y-2">
                      {filterOptions.styles.map((style: string) => (
                        <div key={style} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`style-${style}`}
                            checked={filters.style?.includes(style) || false}
                            onChange={() => handleFilterChange('style', style)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`style-${style}`} 
                            className="ml-2 text-gray-700"
                          >
                            {style}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Status</h3>
                    <div className="space-y-2">
                      {filterOptions.statuses.map((status: string) => (
                        <div key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`status-${status}`}
                            checked={filters.status?.includes(status) || false}
                            onChange={() => handleFilterChange('status', status)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`status-${status}`} 
                            className="ml-2 text-gray-700 capitalize"
                          >
                            {status.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Filters Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="mt-4 w-full lg:hidden flex items-center justify-center py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Show Filters
              </button>
            </div>
            
            {/* Products Grid */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} products`}
                </p>
                <div className="text-sm text-gray-500">
                  {Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== '' && val !== undefined) && (
                    <span>
                      Active filters: {Object.values(filters).filter(val => Array.isArray(val) ? val.length > 0 : val !== '' && val !== undefined).length}
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2 text-red-600">Error loading products</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.filter(product => product && product.variants).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 border rounded ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 w-4/5 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceFilter('minPrice', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceFilter('maxPrice', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {filterOptions.categories.map((category: string) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-category-${category}`}
                        checked={filters.category?.includes(category) || false}
                        onChange={() => handleFilterChange('category', category)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`mobile-category-${category}`} 
                        className="ml-2 text-gray-700"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}