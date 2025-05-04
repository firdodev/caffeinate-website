import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUsers, getProducts, getOrders } from '@/lib/firebase';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign, Truck, Coffee } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  orderType: 'pickup' | 'delivery';
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalDeliveries: 0,
    totalPickups: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    topProducts: [] as { name: string; sales: number }[],
    revenueByCategory: {} as Record<string, number>,
    dailyRevenue: [] as { date: string; amount: number }[]
  });

  useEffect(() => {
    const unsubscribeUsers = getUsers(users => {
      setStats(prev => ({ ...prev, totalUsers: users.length }));
    });

    const unsubscribeProducts = getProducts(products => {
      setStats(prev => ({ ...prev, totalProducts: products.length }));
    });

    const unsubscribeOrders = getOrders(orders => {
      const orderData = orders as Order[];
      const productData = orders.flatMap(order => order.products || []) as Product[];

      // Calculate total revenue
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.total || 0), 0);

      // Calculate order types
      const totalDeliveries = orderData.filter(order => order.orderType === 'delivery').length;
      const totalPickups = orderData.filter(order => order.orderType === 'pickup').length;

      // Calculate order statuses
      const completedOrders = orderData.filter(order => order.status === 'completed').length;
      const pendingOrders = orderData.filter(order => order.status === 'pending').length;
      const processingOrders = orderData.filter(order => order.status === 'processing').length;
      const cancelledOrders = orderData.filter(order => order.status === 'cancelled').length;

      // Calculate average order value
      const averageOrderValue = orderData.length > 0 ? totalRevenue / orderData.length : 0;

      // Calculate top products
      const productSales = productData.reduce((acc, product) => {
        acc[product.name] = (acc[product.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Calculate revenue by category
      const revenueByCategory = productData.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + product.price;
        return acc;
      }, {} as Record<string, number>);

      // Calculate daily revenue
      const dailyRevenue = orderData.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + (order.total || 0);
        return acc;
      }, {} as Record<string, number>);

      const dailyRevenueArray = Object.entries(dailyRevenue)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Last 7 days

      setStats(prev => ({
        ...prev,
        totalOrders: orderData.length,
        totalRevenue,
        totalDeliveries,
        totalPickups,
        completedOrders,
        pendingOrders,
        processingOrders,
        cancelledOrders,
        averageOrderValue,
        topProducts,
        revenueByCategory,
        dailyRevenue: dailyRevenueArray
      }));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${stats.totalRevenue.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalOrders}</div>
            <p className='text-xs text-muted-foreground'>+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Order Value</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${stats.averageOrderValue.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers}</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Breakdown of order types and statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Delivery Orders</span>
                  <span className='text-sm font-medium'>{stats.totalDeliveries}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-primary rounded-full'
                    style={{ width: `${(stats.totalDeliveries / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Pickup Orders</span>
                  <span className='text-sm font-medium'>{stats.totalPickups}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-primary rounded-full'
                    style={{ width: `${(stats.totalPickups / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current status of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Completed</span>
                  <span className='text-sm font-medium'>{stats.completedOrders}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-green-500 rounded-full'
                    style={{ width: `${(stats.completedOrders / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Processing</span>
                  <span className='text-sm font-medium'>{stats.processingOrders}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-blue-500 rounded-full'
                    style={{ width: `${(stats.processingOrders / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Pending</span>
                  <span className='text-sm font-medium'>{stats.pendingOrders}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-yellow-500 rounded-full'
                    style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>Cancelled</span>
                  <span className='text-sm font-medium'>{stats.cancelledOrders}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-red-500 rounded-full'
                    style={{ width: `${(stats.cancelledOrders / stats.totalOrders) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Most ordered products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats.topProducts.map((product, index) => (
                <div key={index}>
                  <div className='flex justify-between mb-2'>
                    <span className='text-sm font-medium'>{product.name}</span>
                    <span className='text-sm font-medium'>{product.sales} orders</span>
                  </div>
                  <div className='h-2 bg-secondary rounded-full'>
                    <div
                      className='h-2 bg-primary rounded-full'
                      style={{ width: `${(product.sales / stats.totalOrders) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue</CardTitle>
          <CardDescription>Daily revenue for the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stats.dailyRevenue.map((day, index) => (
              <div key={index}>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-medium'>{day.date}</span>
                  <span className='text-sm font-medium'>${day.amount.toFixed(2)}</span>
                </div>
                <div className='h-2 bg-secondary rounded-full'>
                  <div
                    className='h-2 bg-primary rounded-full'
                    style={{
                      width: `${(day.amount / Math.max(...stats.dailyRevenue.map(d => d.amount))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
