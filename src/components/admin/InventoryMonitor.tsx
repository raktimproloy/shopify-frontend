'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface InventoryItem {
  id: number;
  sku: string;
  productName: string;
  channels: {
    [key: string]: {
      quantity: number;
      available: number;
      lastSync: string;
    };
  };
}

interface InventoryResponse {
  success: boolean;
  items: InventoryItem[];
}

export function InventoryMonitor() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: InventoryResponse = await response.json();
      if (data.success) {
        setInventory(data.items);
        setLastRefresh(new Date());
      } else {
        throw new Error('Failed to fetch inventory data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchInventory();
    
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ensure filters are always valid
  useEffect(() => {
    if (statusFilter === '') {
      setStatusFilter('all');
    }
    if (channelFilter === '') {
      setChannelFilter('all');
    }
  }, [statusFilter, channelFilter]);

  // Filter and search inventory items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' || 
                         item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentStatusFilter = statusFilter === '' ? 'all' : statusFilter;
    const matchesStatus = currentStatusFilter === 'all' || 
      (currentStatusFilter === 'in-stock' && getTotalAvailable(item) > 0) ||
      (currentStatusFilter === 'out-of-stock' && getTotalAvailable(item) === 0) ||
      (currentStatusFilter === 'low-stock' && getTotalAvailable(item) > 0 && getTotalAvailable(item) <= 10);
    
    const currentChannelFilter = channelFilter === '' ? 'all' : channelFilter;
    const matchesChannel = currentChannelFilter === 'all' || 
      Object.keys(item.channels).includes(currentChannelFilter);
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Helper functions
  const getTotalQuantity = (item: InventoryItem): number => {
    return Object.values(item.channels).reduce((sum, channel) => sum + channel.quantity, 0);
  };

  const getTotalAvailable = (item: InventoryItem): number => {
    return Object.values(item.channels).reduce((sum, channel) => sum + channel.available, 0);
  };

  const getStatusBadge = (item: InventoryItem) => {
    const totalAvailable = getTotalAvailable(item);
    
    if (totalAvailable === 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Out of Stock</Badge>;
    } else if (totalAvailable <= 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const getChannelStatus = (channel: { quantity: number; available: number; lastSync: string }) => {
    const isOutOfSync = new Date().getTime() - new Date(channel.lastSync).getTime() > 300000; // 5 minutes
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${channel.available > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {channel.available}/{channel.quantity}
        </span>
        {isOutOfSync && <Clock className="w-3 h-3 text-yellow-500" />}
      </div>
    );
  };

  const getSyncStatus = (lastSync: string) => {
    const timeDiff = new Date().getTime() - new Date(lastSync).getTime();
    const minutesAgo = Math.floor(timeDiff / 60000);
    
    if (minutesAgo < 5) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Live</Badge>;
    } else if (minutesAgo < 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{minutesAgo}m ago</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">{minutesAgo}m ago</Badge>;
    }
  };

  // Calculate summary statistics
  const totalProducts = inventory.length;
  const inStockProducts = inventory.filter(item => getTotalAvailable(item) > 0).length;
  const outOfStockProducts = inventory.filter(item => getTotalAvailable(item) === 0).length;
  const lowStockProducts = inventory.filter(item => {
    const available = getTotalAvailable(item);
    return available > 0 && available <= 10;
  }).length;

  const totalInventoryValue = inventory.reduce((sum, item) => {
    // Assuming average price of $25 per item (you can adjust this)
    return sum + (getTotalAvailable(item) * 25);
  }, 0);

  if (loading && inventory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Monitor
          </CardTitle>
          <CardDescription>
            Real-time inventory status across all channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Monitor
            </CardTitle>
            <CardDescription>
              Real-time inventory status across all channels
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInventory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">In Stock</p>
                <p className="text-2xl font-bold text-green-900">{inStockProducts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-900">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">{outOfStockProducts}</p>
              </div>
              <Minus className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter === '' ? 'all' : statusFilter} onValueChange={(value) => setStatusFilter(value === '' ? 'all' : value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={channelFilter === '' ? 'all' : channelFilter} onValueChange={(value) => setChannelFilter(value === '' ? 'all' : value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="shopify">Shopify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-700">Product</th>
                <th className="text-left p-3 font-medium text-gray-700">SKU</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-left p-3 font-medium text-gray-700">Internal</th>
                <th className="text-left p-3 font-medium text-gray-700">Shopify</th>
                <th className="text-left p-3 font-medium text-gray-700">Last Sync</th>
                <th className="text-left p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">
                        Total: {getTotalQuantity(item)} | Available: {getTotalAvailable(item)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.sku}</code>
                  </td>
                  
                  <td className="p-3">
                    {getStatusBadge(item)}
                  </td>
                  
                  <td className="p-3">
                    {item.channels.internal ? (
                      getChannelStatus(item.channels.internal)
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="p-3">
                    {item.channels.shopify ? (
                      getChannelStatus(item.channels.shopify)
                    ) : (
                      <span className="text-gray-400">Not synced</span>
                    )}
                  </td>
                  
                  <td className="p-3">
                    <div className="space-y-1">
                      {Object.entries(item.channels).map(([channelName, channelData]) => (
                        <div key={channelName} className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 capitalize">{channelName}:</span>
                          {getSyncStatus(channelData.lastSync)}
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Update
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInventory.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-600">
              {(searchTerm !== '') || (statusFilter !== 'all') || (channelFilter !== 'all') 
                ? 'Try adjusting your filters or search terms'
                : 'No inventory data available'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
