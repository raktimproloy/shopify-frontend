'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Upload } from 'lucide-react';

interface ProductImportProps {
  onImportComplete: (products: any[]) => void;
}

export function ProductImport({ onImportComplete }: ProductImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importLimit, setImportLimit] = useState(50);
  const [importResults, setImportResults] = useState<any>(null);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/integrations/ssactivewear/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          limit: importLimit,
        }),
      });

      const result = await response.json();
      setImportResults(result);
      onImportComplete(result.products || []);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import from SSActiveWear
        </CardTitle>
        <CardDescription>
          Import products from SSActiveWear catalog into your local inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="1">T-Shirts</SelectItem>
                <SelectItem value="2">Hoodies</SelectItem>
                <SelectItem value="3">Tank Tops</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limit">Import Limit</Label>
            <Input
              id="limit"
              type="number"
              value={importLimit}
              onChange={(e) => setImportLimit(parseInt(e.target.value))}
              min={1}
              max={500}
            />
          </div>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing Products...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Import Products
            </>
          )}
        </Button>

        {importResults && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Import Complete
              </Badge>
              <span className="text-sm text-gray-600">
                {importResults.imported} products imported
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}