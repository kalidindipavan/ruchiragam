import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LogOut, User, Mail, Phone, Shield, Package, Clock, CheckCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_provider: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

import { useNavigate } from 'react-router-dom';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'preparing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'out_for_delivery': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'refunded': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default: return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]';
  }
};

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: OrdersResponse }>('/orders/me');
      return data.data;
    },
  });

  const orders = response?.orders || [];

  if (!user) {
    return (
      <div className="flexh-[60vh] items-center justify-center">
        <p className="text-[var(--text-secondary)]">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: User Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-[var(--saffron-600)] to-[var(--cherry-red)]"></div>
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="h-24 w-24 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden shadow-xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-[var(--text-secondary)]" />
                  )}
                </div>
              </div>

              <div className="space-y-1 text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-[var(--saffron-400)]">{user.full_name}</h2>
                <Badge variant="outline" className="border-[var(--saffron-500)/30] text-[var(--saffron-400)] capitalize">
                  {user.role} Account
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <Mail className="h-4 w-4 text-[var(--saffron-500)]" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <Phone className="h-4 w-4 text-[var(--saffron-500)]" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[var(--text-secondary)] mt-6 pt-6 border-t border-[var(--border-subtle)]">
                  <Shield className="h-4 w-4 text-[var(--saffron-500)]" />
                  <span className="text-sm">Password secured</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout Securely
          </Button>
        </div>

        {/* Right Column: Order History */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Order History</h1>
            <Badge variant="outline" className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] px-3 py-1">
              {orders.length} Orders
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent shadow-[0_0_15px_rgba(245,137,10,0.5)]"></div>
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed border-[var(--border-subtle)] bg-[var(--bg-transparent)] text-center py-16">
              <CardContent>
                <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-medium text-[var(--text-primary)] mb-2">No orders yet</h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                  You haven't placed any orders yet. Discover our authentic range of homemade pickles and podis.
                </p>
                <Button
                  onClick={() => window.location.href = '/products'}
                  className="bg-[var(--saffron-600)] hover:bg-[var(--saffron-500)] text-white"
                >
                  Explore Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden transition-all hover:border-[var(--saffron-500)/30]">
                  <CardHeader className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-mono text-[var(--text-secondary)] flex items-center gap-2">
                        #{order.id.split('-')[0]}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-muted)]">
                        <Clock className="h-3.5 w-3.5" />
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(order.created_at))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-[var(--turmeric-400)] font-sans">
                        ₹{order.total}
                      </div>
                      <Badge className={`mt-1 capitalize ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center p-4 gap-4">
                          <div className="h-16 w-16 rounded-md bg-[var(--bg-primary)] border border-[var(--border-subtle)] overflow-hidden shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] border">🌶️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">{item.product_name}</h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              Qty: {item.quantity} × ₹{item.unit_price}
                            </p>
                          </div>
                          <div className="font-medium text-[var(--text-primary)] shrink-0">
                            ₹{item.total_price}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[var(--bg-elevated)] p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span>Payment:</span>
                        <span className="capitalize">{order.payment_provider || 'Pending'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        {order.payment_status === 'completed' ? (
                          <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-green-500">Paid</span></>
                        ) : (
                          <span className="text-yellow-500 capitalize">{order.payment_status}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
