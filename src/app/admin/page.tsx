'use client';

import { InventoryMonitor } from '@/components/admin/InventoryMonitor';
import { ProductImport } from '@/components/admin/ProductImport';
import { ShopifyDeployment } from '@/components/admin/ShopifyDeployment';
import { JobStats } from '@/components/admin/JobStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Multi-channel inventory management and product operations
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Monitor - Full Width */}
          <div className="lg:col-span-2">
            <InventoryMonitor />
          </div>

        </div>

        {/* Background Jobs Statistics */}
        <div className="mt-8">
          <JobStats />
        </div>
      </div>
    </div>
  );
}
