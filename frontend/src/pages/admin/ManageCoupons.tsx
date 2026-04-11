import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, Plus, Edit, Trash2, Calendar, 
  Percent, IndianRupee, AlertCircle, X, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { formatINR } from '../../lib/utils';

export default function ManageCoupons() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch Coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/coupons');
      return data.data;
    },
  });

  // Create/Update Mutation
  const couponMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingCoupon) {
        return apiClient.patch(`/coupons/${editingCoupon.id}`, formData);
      }
      return apiClient.post('/coupons', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon deleted');
      setIsDeleting(null);
    },
  });

  const openModal = (coupon: any = null) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setIsDeleting(id);
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      discount_type: formData.get('discount_type'),
      discount_value: Number(formData.get('discount_value')),
      min_order_amount: Number(formData.get('min_order_amount')),
      usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
      max_discount: formData.get('max_discount') ? Number(formData.get('max_discount')) : null,
      expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null,
      is_active: formData.get('is_active') === 'true',
    };
    couponMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Coupons</h1>
        <Button onClick={() => openModal()} className="shadow-saffron">
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Discount</th>
                <th className="px-6 py-4 font-bold">Min Order</th>
                <th className="px-6 py-4 font-bold">Usage</th>
                <th className="px-6 py-4 font-bold">Expiry</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                  </td>
                </tr>
              ) : coupons?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[var(--text-muted)] italic">
                    No coupons found. Create your first one!
                  </td>
                </tr>
              ) : (
                coupons?.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[var(--saffron-400)]">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)] font-medium">
                      {coupon.discount_type === 'percentage' ? (
                        <div className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5 opacity-60"/> {coupon.discount_value}%</div>
                      ) : (
                        <div className="flex items-center gap-1.5">{formatINR(coupon.discount_value)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {formatINR(coupon.min_order_amount)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-primary)] font-medium">{coupon.usage_count} / {coupon.usage_limit || '∞'}</span>
                        <span className="text-[xs] opacity-60">Uses</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {coupon.expires_at ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-60"/>
                          {new Date(coupon.expires_at).toLocaleDateString()}
                        </div>
                      ) : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'} className={coupon.is_active ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" size="sm" onClick={() => openModal(coupon)} className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10">
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(coupon.id)} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          disabled={isDeleting === coupon.id}
                        >
                          {isDeleting === coupon.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white bg-[var(--bg-card)] p-1.5 rounded-full border border-[var(--border-subtle)]">
              <X className="h-5 w-5" />
            </button>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[var(--saffron-500)]/10 rounded-lg">
                  <Ticket className="h-6 w-6 text-[var(--saffron-500)]" />
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Coupon Code</label>
                  <Input name="code" defaultValue={editingCoupon?.code} placeholder="E.g., SAVE20" required className="font-mono uppercase" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Discount Type</label>
                    <select name="discount_type" defaultValue={editingCoupon?.discount_type || 'percentage'} className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:ring-[var(--saffron-500)] focus:border-[var(--saffron-500)] outline-none transition-all">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Discount Value</label>
                    <Input name="discount_value" type="number" defaultValue={editingCoupon?.discount_value} required placeholder="20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Min Order (₹)</label>
                    <Input name="min_order_amount" type="number" defaultValue={editingCoupon?.min_order_amount || 0} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Usage Limit</label>
                    <Input name="usage_limit" type="number" defaultValue={editingCoupon?.usage_limit} placeholder="Unlimited" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Max Discount (₹)</label>
                  <Input name="max_discount" type="number" defaultValue={editingCoupon?.max_discount} placeholder="Optional" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Expiry Date</label>
                  <Input 
                    name="expires_at" 
                    type="date" 
                    defaultValue={editingCoupon?.expires_at ? new Date(editingCoupon.expires_at).toISOString().split('T')[0] : ''} 
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <select name="is_active" defaultValue={editingCoupon?.is_active?.toString() || 'true'} className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-1 text-sm outline-none">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                   </select>
                   <span className="text-xs text-[var(--text-muted)]">Set visibility status for this coupon</span>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full py-6 font-bold text-lg shadow-saffron" disabled={couponMutation.isPending}>
                    {couponMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
