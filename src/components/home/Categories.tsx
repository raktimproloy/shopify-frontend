import { Card, CardContent } from '@/components/ui/card';

const categories = [
  { name: 'Clothing', count: 150, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop' },
  { name: 'Shoes', count: 89, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop' },
  { name: 'Accessories', count: 67, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=200&fit=crop' },
  { name: 'Electronics', count: 45, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop' }
];

export function Categories() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} items</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
