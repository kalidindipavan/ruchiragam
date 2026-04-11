import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X, Eye, Package, IndianRupee, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function ManageOrders() {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders', { params: { limit: 50 } });
      return data.data;
    },
  });

  const { data: viewingOrder, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['adminOrderDetails', viewingId],
    queryFn: async () => {
      if (!viewingId) return null;
      const { data } = await apiClient.get(`/orders/${viewingId}`);
      return data.data;
    },
    enabled: !!viewingId,
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    confirmed: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    processing: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    shipped: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    delivered: 'text-green-400 border-green-500/50 bg-green-500/10',
    cancelled: 'text-red-400 border-red-500/50 bg-red-500/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] relative z-0">
          Order Fulfillment
        </h1>
      </div>

      <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Total Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 rounded-tr-xl font-bold flex justify-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                  </td>
                </tr>
              ) : ordersData?.orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No orders have been placed yet!
                  </td>
                </tr>
              ) : (
                ordersData?.orders?.map((order: any) => (
                  <tr key={order.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)]">
                      {order.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{order.users?.full_name || 'Guest User'}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{order.users?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {new Date(order.created_at).toLocaleDateString()} <br />
                        <span className="text-xs opacity-70">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)] tabular-nums">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--saffron-500)] appearance-none cursor-pointer text-center ${statusColors[order.status] || 'text-[var(--text-secondary)]'}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                      >
                        <option value="pending" className="bg-[var(--bg-elevated)] text-yellow-400">Pending</option>
                        <option value="confirmed" className="bg-[var(--bg-elevated)] text-blue-400">Confirmed</option>
                        <option value="processing" className="bg-[var(--bg-elevated)] text-blue-400">Processing</option>
                        <option value="shipped" className="bg-[var(--bg-elevated)] text-purple-400">Shipped</option>
                        <option value="delivered" className="bg-[var(--bg-elevated)] text-green-400">Delivered</option>
                        <option value="cancelled" className="bg-[var(--bg-elevated)] text-red-500">Cancelled</option>
                      </select>
                      {updatingId === order.id && <Loader2 className="h-3 w-3 animate-spin inline-block ml-2 text-[var(--saffron-500)]" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingId(order.id)} 
                          className="text-[var(--saffron-400)] hover:text-[var(--saffron-500)] hover:bg-[var(--saffron-500)]/10 px-3"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      {viewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-xl relative mt-20 sm:my-8 border-t-4 border-t-[var(--saffron-500)]">
            <button 
              onClick={() => setViewingId(null)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 bg-[var(--bg-card)] rounded-full hover:bg-[var(--border-subtle)]"
            >
              <X className="h-5 w-5" />
            </button>
            <CardContent className="p-6 sm:p-8">
              {isLoadingDetails || !viewingOrder ? (
                 <div className="py-20 flex justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[var(--saffron-500)]" />
                 </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-subtle)]">
                    <div className="bg-[var(--saffron-500)]/20 p-2 rounded-lg">
                        <Package className="h-6 w-6 text-[var(--saffron-500)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                        Order Details
                        </h2>
                        <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">#{viewingOrder.id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div className="space-y-1.5 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Eye className="w-3 h-3"/> Customer Info</div>
                      <div className="text-[var(--text-primary)] font-bold text-base">{viewingOrder.users?.full_name || 'Guest User'}</div>
                      <div className="text-[var(--text-secondary)]">{viewingOrder.users?.email || 'N/A'}</div>
                      {viewingOrder.users?.phone && <div className="text-[var(--text-secondary)]">{viewingOrder.users.phone}</div>}
                    </div>
                    
                    <div className="space-y-1.5 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <div className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><IndianRupee className="w-3 h-3"/> Payment Status</div>
                      <Badge variant="outline" className={viewingOrder.payment_status === 'completed' ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'}>
                        {viewingOrder.payment_status?.toUpperCase() || 'UNPAID'}
                      </Badge>
                      <div className="text-[var(--text-secondary)] mt-2">Provider: <span className="capitalize text-[var(--text-primary)]">{viewingOrder.payment_provider || 'N/A'}</span></div>
                      {viewingOrder.payment_id && <div className="text-xs font-mono text-[var(--text-muted)] mt-1 truncate">ID: {viewingOrder.payment_id}</div>}
                    </div>

                    <div className="space-y-1.5 md:col-span-2 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] shadow-inner">
                      <div className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin className="w-3 h-3"/> Shipping Address</div>
                      {viewingOrder.delivery_address ? (
                        <address className="not-italic text-[var(--text-primary)] leading-relaxed">
                          <span className="font-bold">{viewingOrder.delivery_address.street}</span><br/>
                          {viewingOrder.delivery_address.city}, {viewingOrder.delivery_address.state} {viewingOrder.delivery_address.postal_code}<br/>
                          {viewingOrder.delivery_address.country}
                        </address>
                      ) : (
                        <div className="text-[var(--text-secondary)] italic">No shipping address provided.</div>
                      )}
                      
                      {viewingOrder.special_instructions && (
                        <div className="mt-4 text-[var(--saffron-500)] text-sm bg-[var(--saffron-500)]/10 p-3 rounded-lg border border-[var(--saffron-500)]/20">
                          <span className="font-bold block mb-1">Customer Note:</span> {viewingOrder.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-strong)] pb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[var(--saffron-500)]"/> Items Purchased
                    </h3>
                    
                    <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                      {viewingOrder.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--saffron-500)]/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-[var(--bg-elevated)] rounded-md flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-strong)] overflow-hidden shrink-0">
                                <Package className="h-5 w-5 opacity-50" />
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-primary)] leading-tight mb-1">{item.product_name || 'Unknown Item'}</div>
                              <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] inline-block px-2 py-0.5 rounded border border-[var(--border-subtle)]">Qty: {item.quantity} × ₹{item.unit_price}</div>
                            </div>
                          </div>
                          <div className="font-black text-[var(--text-primary)] tabular-nums px-2">
                            ₹{(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      
                      {(!viewingOrder.order_items || viewingOrder.order_items.length === 0) && (
                         <div className="p-4 text-center text-[var(--text-muted)] italic">No items found in this order.</div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-5 border-t border-[var(--border-strong)] mt-4 bg-[var(--bg-card)] p-4 rounded-xl">
                      <div className="text-[var(--text-secondary)] font-bold text-lg uppercase tracking-wider">Total Amount Paid</div>
                      <div className="text-3xl font-black text-[var(--saffron-500)] tabular-nums drop-shadow-sm">
                        ₹{viewingOrder.total}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
