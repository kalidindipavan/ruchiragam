import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  LogOut,
  User,
  Mail,
  Phone,
  Shield,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Truck,
  Star,
  XCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id?: string;
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

interface SavedAddress {
  id: string;
  name: string | null;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone_number: string | null;
  country: string | null;
  is_default: boolean;
}

interface AddressResponse {
  addresses: SavedAddress[];
  total: number;
}

type ProfileSection = 'address' | 'orders';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'preparing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'out_for_delivery': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'refunded': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default: return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
  }
};

const formatINR = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value || 0);

const canCancelOrder = (order: Order) => ['pending', 'confirmed'].includes(order.status) && order.payment_status !== 'completed';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<ProfileSection>('orders');

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
    enabled: Boolean(user?.id),
  });

  const { data: addressResponse, isLoading: isAddressLoading } = useQuery({
    queryKey: ['my-addresses', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AddressResponse }>('/user/addresses');
      return data.data;
    },
    enabled: Boolean(user?.id) && activeSection === 'address',
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.patch(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['my-orders', user?.id] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Unable to cancel this order';
      toast.error(message);
    },
  });

  const orders = response?.orders || [];
  const addresses = addressResponse?.addresses || [];

  const sectionTitle = useMemo(() => {
    return activeSection === 'orders' ? 'My Orders' : 'Address Book';
  }, [activeSection]);

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[var(--text-secondary)]">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

        <div className="space-y-6 md:col-span-1">
          <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg">
            <div className="h-32 bg-gradient-to-br from-[var(--saffron-600)] to-[var(--cherry-red)]"></div>
            <CardContent className="relative px-6 pb-6 pt-0">
              <div className="-mt-12 mb-4 flex justify-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-elevated)] shadow-xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-[var(--text-secondary)]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 space-y-1 text-center">
                <h2 className="font-display text-2xl font-bold text-[var(--saffron-400)]">{user.full_name}</h2>
                <Badge variant="outline" className="capitalize border-[var(--saffron-500)/30] text-[var(--saffron-400)]">
                  {user.role} Account
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <Mail className="h-4 w-4 text-[var(--saffron-500)]" />
                  <span className="truncate text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <Phone className="h-4 w-4 text-[var(--saffron-500)]" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <div className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-6 text-[var(--text-secondary)]">
                  <Shield className="h-4 w-4 text-[var(--saffron-500)]" />
                  <span className="text-sm">Password secured</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant={activeSection === 'address' ? 'default' : 'outline'}
                onClick={() => setActiveSection('address')}
                className="w-full justify-start"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Saved Addresses
              </Button>
              <Button
                type="button"
                variant={activeSection === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveSection('orders')}
                className="w-full justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                My Orders
              </Button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-red-500/20 text-red-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout Securely
          </Button>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">{sectionTitle}</h1>
            {activeSection === 'orders' && (
              <Badge variant="outline" className="border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1 text-[var(--text-secondary)]">
                {orders.length} Orders
              </Badge>
            )}
          </div>

          {activeSection === 'address' && (
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <CardContent>
                {isAddressLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 text-center">
                    <MapPin className="mx-auto mb-3 h-6 w-6 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-secondary)]">No saved addresses yet.</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Add an address during checkout and it will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-[var(--text-primary)]">{address.name || 'Delivery Address'}</p>
                          {address.is_default && (
                            <Badge variant="outline" className="border-[var(--saffron-500)/30] text-[var(--saffron-400)]">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {address.street}, {address.city}, {address.state} - {address.postal_code}
                          {address.phone_number ? <><br />Phone: {address.phone_number}</> : null}
                          {address.country ? <><br />Country: {address.country}</> : null}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === 'orders' && (
            <>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent shadow-[0_0_15px_rgba(245,137,10,0.5)]"></div>
                </div>
              ) : orders.length === 0 ? (
                <Card className="border-dashed border-[var(--border-subtle)] bg-[var(--bg-transparent)] py-16 text-center">
                  <CardContent>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <Package className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-medium text-[var(--text-primary)]">No orders yet</h3>
                    <p className="mx-auto mb-6 max-w-sm text-[var(--text-secondary)]">
                      You have not placed any orders yet. Start shopping to see your order timeline here.
                    </p>
                    <Button onClick={() => navigate('/products')} className="bg-[var(--saffron-600)] text-white hover:bg-[var(--saffron-500)]">
                      Explore Products
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all hover:border-[var(--saffron-500)/30]">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-4">
                        <div>
                          <CardTitle className="flex items-center gap-2 font-mono text-sm text-[var(--text-secondary)]">
                            #{order.id.split('-')[0]}
                          </CardTitle>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Clock className="h-3.5 w-3.5" />
                            {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(order.created_at))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-sans text-lg font-bold text-[var(--turmeric-400)]">{formatINR(order.total)}</div>
                          <Badge className={`mt-1 capitalize ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        <div className="divide-y divide-[var(--border-subtle)]">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="truncate font-medium text-[var(--text-primary)]">{item.product_name}</h4>
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  Qty: {item.quantity} x {formatINR(item.unit_price)}
                                </p>
                              </div>

                              <div className="shrink-0 font-medium text-[var(--text-primary)]">
                                {formatINR(item.total_price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                              <span>Payment:</span>
                              <span className="capitalize">{order.payment_provider || 'Pending'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                              {order.payment_status === 'completed' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-500">Paid</span>
                                </>
                              ) : (
                                <span className="capitalize text-yellow-500">{order.payment_status}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/orders/${order.id}/track`)}>
                              <Truck className="mr-1.5 h-4 w-4" />
                              Track Order
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canCancelOrder(order) || cancelOrderMutation.isPending}
                              onClick={() => cancelOrderMutation.mutate(order.id)}
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Cancel Order
                            </Button>

                            {order.status === 'delivered' && order.order_items[0]?.product_id && (
                              <Button
                                size="sm"
                                onClick={() => navigate(`/products/${order.order_items[0].product_id}#reviews`)}
                                className="bg-[var(--saffron-600)] text-white hover:bg-[var(--saffron-500)]"
                              >
                                <Star className="mr-1.5 h-4 w-4" />
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
