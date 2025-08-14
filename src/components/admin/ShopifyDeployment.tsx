'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  variants: Array<{
    id: number;
    sku: string;
    size: string;
    color: string;
  }>;
}

interface ShopifyDeploymentProps {
  products: Product[];
  onDeploymentComplete: (results: any) => void;
}

export function ShopifyDeployment({ products, onDeploymentComplete }: ShopifyDeploymentProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResults, setDeploymentResults] = useState<any>(null);

  const handleProductSelect = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch('/api/integrations/shopify/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts,
        }),
      });

      const result = await response.json();
      setDeploymentResults(result);
      onDeploymentComplete(result);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Deploy to Shopify
        </CardTitle>
        <CardDescription>
          Select products to deploy to your Shopify store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedProducts.length === products.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({products.length} products)
            </label>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked:any) => handleProductSelect(product.id, !!checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku} | Category: {product.category}
                  </div>
                  <div className="text-xs text-gray-400">
                    {product.variants.length} variants
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying || selectedProducts.length === 0}
            className="w-full"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying to Shopify...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Deploy Selected Products ({selectedProducts.length})
              </>
            )}
          </Button>

          {deploymentResults && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Deployment Complete
                </Badge>
                <span className="text-sm text-gray-600">
                  {deploymentResults.deployed} products deployed
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
