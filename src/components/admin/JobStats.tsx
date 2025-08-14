'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Pause,
  RefreshCw,
  Database
} from 'lucide-react';

interface JobStats {
  inventory: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    status: string;
    recurringJobs: {
      count: number;
      nextRun: number;
      cron: string;
    };
  };
  product: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    status: string;
    recurringJobs: {
      count: number;
      nextRun: number;
      cron: string;
    };
  };
  redisStatus: string;
}

interface JobStatsResponse {
  success: boolean;
  stats: JobStats;
  redisAvailable: boolean;
  message: string;
}

export function JobStats() {
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [executingInventory, setExecutingInventory] = useState(false);
  const [executingProduct, setExecutingProduct] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string; type: 'success' | 'error'; message: string; timestamp: Date}>>([]);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, type, message, timestamp: new Date() };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const fetchJobStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/jobs/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: JobStatsResponse = await response.json();
      if (data.success) {
        setJobStats(data.stats);
        setLastRefresh(new Date());
      } else {
        throw new Error('Failed to fetch job statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job stats');
      console.error('Error fetching job stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute inventory job
  const executeInventoryJob = async () => {
    try {
      setExecutingInventory(true);
      console.log('🔄 Executing inventory job...');
      
      // Call inventory API
      const inventoryResponse = await fetch('/api/inventory');
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        console.log('✅ Inventory job completed:', inventoryData);
        addNotification('success', 'Inventory job completed successfully');
        
        // Update job stats to reflect execution
        if (jobStats) {
          setJobStats(prev => prev ? {
            ...prev,
            inventory: {
              ...prev.inventory,
              completed: prev.inventory.completed + 1,
              nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
            }
          } : null);
        }
      } else {
        console.error('❌ Inventory job failed:', inventoryResponse.status);
        addNotification('error', 'Inventory job failed');
        
        // Update failed count
        if (jobStats) {
          setJobStats(prev => prev ? {
            ...prev,
            inventory: {
              ...prev.inventory,
              failed: prev.inventory.failed + 1,
              nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('❌ Inventory job execution error:', error);
      addNotification('error', 'Inventory job execution error');
      
      // Update failed count
      if (jobStats) {
        setJobStats(prev => prev ? {
          ...prev,
          inventory: {
            ...prev.inventory,
            failed: prev.inventory.failed + 1,
            nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
          }
        } : null);
      }
    } finally {
      setExecutingInventory(false);
    }
  };

  // Execute product job
  const executeProductJob = async () => {
    try {
      setExecutingProduct(true);
      console.log('🔄 Executing product job...');
      
      // Call products API
      const productsResponse = await fetch('http://localhost:3001/api/products?limit=1&offset=0');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('✅ Product job completed:', productsData);
        addNotification('success', 'Product job completed successfully');
        
        // Update job stats to reflect execution
        if (jobStats) {
          setJobStats(prev => prev ? {
            ...prev,
            product: {
              ...prev.product,
              completed: prev.product.completed + 1,
              nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
            }
          } : null);
        }
      } else {
        console.error('❌ Product job failed:', productsResponse.status);
        addNotification('error', 'Product job failed');
        
        // Update failed count
        if (jobStats) {
          setJobStats(prev => prev ? {
            ...prev,
            product: {
              ...prev.product,
              failed: prev.product.failed + 1,
              nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('❌ Product job execution error:', error);
      addNotification('error', 'Product job execution error');
      
      // Update failed count
      if (jobStats) {
        setJobStats(prev => prev ? {
          ...prev,
          product: {
            ...prev.product,
            failed: prev.product.failed + 1,
            nextRun: new Date().getTime() + (6 * 60 * 1000) // Next run in 6 minutes
          }
        } : null);
      }
    } finally {
      setExecutingProduct(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchJobStats();
    
    const interval = setInterval(fetchJobStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-execute jobs when countdown finishes
  useEffect(() => {
    if (!jobStats) return;

    const checkAndExecuteJobs = () => {
      const now = new Date().getTime();
      
      // Check inventory jobs
      if (jobStats.inventory.recurringJobs.nextRun <= now) {
        executeInventoryJob();
      }
      
      // Check product jobs
      if (jobStats.product.recurringJobs.nextRun <= now) {
        executeProductJob();
      }
    };

    // Check every 10 seconds for job execution
    const jobCheckInterval = setInterval(checkAndExecuteJobs, 10000);
    
    return () => clearInterval(jobCheckInterval);
  }, [jobStats]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'stopped':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Stopped</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatNextRun = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Running now';
    }
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `in ${hours}h ${minutes % 60}m`;
    }
    return `in ${minutes}m`;
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Database className="h-5 w-5" />;
      case 'product':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  if (loading && !jobStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Background Jobs
          </CardTitle>
          <CardDescription>
            Real-time background job statistics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job statistics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !jobStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Background Jobs
          </CardTitle>
          <CardDescription>
            Real-time background job statistics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading job stats</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchJobStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobStats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Background Jobs
            </CardTitle>
            <CardDescription>
              Real-time background job statistics and status
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchJobStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {notification.type === 'success' ? '✅' : '❌'} {notification.message}
                  </span>
                  <span className="text-xs opacity-75">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redis Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Redis Status</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {jobStats.redisStatus === 'enabled' ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        {/* Job Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getJobTypeIcon('inventory')}
                  Inventory Jobs
                </h3>
                {executingInventory && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">Executing...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(jobStats.inventory.status)}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={executeInventoryJob}
                  disabled={executingInventory}
                  className="ml-2"
                >
                  {executingInventory ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Waiting</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{jobStats.inventory.waiting}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{jobStats.inventory.active}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{jobStats.inventory.completed}</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{jobStats.inventory.failed}</p>
              </div>
            </div>
            
            {/* Recurring Jobs Info */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Recurring Jobs</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {jobStats.inventory.recurringJobs.count} active
                </Badge>
              </div>
              <div className="text-sm text-yellow-700">
                <p>Cron: <code className="bg-yellow-100 px-2 py-1 rounded">{jobStats.inventory.recurringJobs.cron}</code></p>
                <p>Next run: {formatNextRun(jobStats.inventory.recurringJobs.nextRun)}</p>
              </div>
            </div>
          </div>

          {/* Product Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getJobTypeIcon('product')}
                  Product Jobs
                </h3>
                {executingProduct && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">Executing...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(jobStats.product.status)}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={executeProductJob}
                  disabled={executingProduct}
                  className="ml-2"
                >
                  {executingProduct ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Waiting</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{jobStats.product.waiting}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{jobStats.product.active}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{jobStats.product.completed}</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{jobStats.product.failed}</p>
              </div>
            </div>
            
            {/* Recurring Jobs Info */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Recurring Jobs</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {jobStats.product.recurringJobs.count} active
                </Badge>
              </div>
              <div className="text-sm text-yellow-700">
                <p>Cron: <code className="bg-yellow-100 px-2 py-1 rounded">{jobStats.product.recurringJobs.cron}</code></p>
                <p>Next run: {formatNextRun(jobStats.product.recurringJobs.nextRun)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">System Status</h4>
              <p className="text-sm text-gray-600">
                Background jobs are running every 6 minutes for both inventory and product updates
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobStats.inventory.completed + jobStats.product.completed}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
