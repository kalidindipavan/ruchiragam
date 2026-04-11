import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Users, IndianRupee, TrendingUp, Package, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import apiClient from '../../lib/apiClient';

export default function AdminDashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/stats/dashboard');
      return data.data;
    },
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminRecentOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders', { params: { limit: 5 } });
      return data.data?.orders || [];
    },
  });

  const cards = [
    { title: 'Gross Revenue', value: statsData ? `₹${statsData.totalRevenue}` : '...', icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pending Shipments', value: statsData?.pendingOrders ?? '...', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Total Customers', value: statsData?.totalUsers ?? '...', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Catalog', value: statsData?.activeProducts ?? '...', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    confirmed: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    processing: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    shipped: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    delivered: 'text-green-400 border-green-500/50 bg-green-500/10',
    cancelled: 'text-red-400 border-red-500/50 bg-red-500/10',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Command Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Monitor real-time sales and system vital signs.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-[var(--bg-card)] rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] shadow-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-md overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${card.bg.split('/')[0]}`}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {isLoadingStats ? <div className="h-9 w-24 bg-[var(--bg-card)] rounded animate-pulse" /> : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Timeline */}
        <Card className="lg:col-span-2 bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm flex flex-col">
          <CardHeader className="border-b border-[var(--border-subtle)] pb-4 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-bold flex items-center gap-2">
               <ShoppingBag className="w-5 h-5 text-[var(--saffron-500)]" /> Recent Transactions
             </CardTitle>
             <Link to="/admin/orders">
               <Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1"/></Button>
             </Link>
          </CardHeader>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-[var(--bg-card)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-6 py-3 font-bold">Client</th>
                  <th className="px-6 py-3 font-bold">Total</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                  <th className="px-6 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] italic">
                      No recent orders to show.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-card)] transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{order.users?.full_name || 'Guest'}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">#{order.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4 font-black tabular-nums text-[var(--saffron-500)]">
                        ₹{order.total}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={statusColors[order.status] || 'text-[var(--text-secondary)]'}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions Board */}
        <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm">
          <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
             <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
              <Link to="/admin/products" className="block w-full">
                <Button className="w-full justify-start h-12 bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--saffron-500)] hover:text-black border border-[var(--border-strong)] transition-all group">
                   <div className="bg-[var(--bg-elevated)] p-1.5 rounded mr-3 group-hover:bg-black/10">
                      <Package className="w-4 h-4" />
                   </div>
                   Manage Catalog
                </Button>
              </Link>

              <Link to="/admin/orders" className="block w-full">
                <Button className="w-full justify-start h-12 bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--saffron-500)] hover:text-black border border-[var(--border-strong)] transition-all group">
                   <div className="bg-[var(--bg-elevated)] p-1.5 rounded mr-3 group-hover:bg-black/10">
                      <ShoppingBag className="w-4 h-4" />
                   </div>
                   Fulfill Shipments
                </Button>
              </Link>

              <Link to="/admin/users" className="block w-full">
                <Button className="w-full justify-start h-12 bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--saffron-500)] hover:text-black border border-[var(--border-strong)] transition-all group">
                   <div className="bg-[var(--bg-elevated)] p-1.5 rounded mr-3 group-hover:bg-black/10">
                      <Users className="w-4 h-4" />
                   </div>
                   View User Accounts
                </Button>
              </Link>
              
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                 <div className="bg-[var(--saffron-500)]/5 border border-[var(--saffron-500)]/20 p-4 rounded-xl text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-[var(--saffron-500)] mb-2" />
                    <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">Store is Online</h4>
                    <p className="text-xs text-[var(--text-secondary)]">Your systems are fully operational and processing orders.</p>
                 </div>
              </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
