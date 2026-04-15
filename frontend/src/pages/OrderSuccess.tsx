import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Package, ChevronRight, ShoppingBag, Loader2, Clock, MapPin, CreditCard } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { formatINR } from '../lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  payment_provider: string;
  payment_status: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  special_instructions?: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const { data: response } = await apiClient.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--saffron-500)]" />
      </div>
    );
  }

  if (!order) return null;

  const isCOD = order.payment_provider === 'cod';
  const addressLine = `${order.delivery_address.street}, ${order.delivery_address.city}, ${order.delivery_address.state} - ${order.delivery_address.postal_code}`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4">
      <div className="mx-auto max-w-2xl">

        {/* Success Banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--leaf-600)]/20 to-[var(--leaf-500)]/10 border border-[var(--leaf-500)]/30 p-8 text-center shadow-lg">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 60%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 60%)' }}>
          </div>

          {/* Animated Check */}
          <div className="relative flex justify-center mb-5">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[var(--leaf-500)]/15 border-2 border-[var(--leaf-500)]/40">
              <div className="absolute inset-0 rounded-full animate-ping bg-[var(--leaf-500)]/10"></div>
              <CheckCircle2 className="h-12 w-12 text-[var(--leaf-400)]" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-[var(--text-secondary)] text-base">
            {isCOD
              ? 'Your order has been placed. Pay with cash when your food arrives.'
              : 'Payment received! Your order is being prepared.'}
          </p>
          <p className="mt-3 text-sm font-mono text-[var(--saffron-400)] bg-[var(--saffron-500)]/10 px-4 py-1.5 rounded-full inline-block border border-[var(--saffron-500)]/20">
            Order #{order.id.split('-')[0].toUpperCase()}
          </p>
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 flex flex-col items-center gap-2 text-center">
            <Clock className="h-6 w-6 text-[var(--saffron-400)]" />
            <p className="text-xs text-[var(--text-muted)]">Estimated Time</p>
            <p className="font-semibold text-[var(--text-primary)]">30–45 mins</p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 flex flex-col items-center gap-2 text-center">
            <CreditCard className="h-6 w-6 text-[var(--saffron-400)]" />
            <p className="text-xs text-[var(--text-muted)]">Payment</p>
            <p className="font-semibold text-[var(--text-primary)]">
              {isCOD ? 'Cash on Delivery' : order.payment_provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 flex flex-col items-center gap-2 text-center">
            <Package className="h-6 w-6 text-[var(--saffron-400)]" />
            <p className="text-xs text-[var(--text-muted)]">Items</p>
            <p className="font-semibold text-[var(--text-primary)]">{order.order_items?.length || 0} item(s)</p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[var(--saffron-400)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Delivery Address</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{addressLine}</p>
          {order.special_instructions && (
            <p className="mt-2 text-xs text-[var(--text-muted)] italic">Note: {order.special_instructions}</p>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[var(--saffron-400)]" />
            Order Items
          </h2>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-[var(--border-subtle)]" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.product_name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.variant_name || 'Standard'} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{formatINR(item.total_price)}</p>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-1.5 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Delivery Fee</span>
              <span>{Number(order.delivery_fee) === 0 ? <span className="text-[var(--leaf-400)]">Free</span> : formatINR(order.delivery_fee)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-[var(--leaf-400)]">
                <span>Discount</span><span>-{formatINR(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
              <span>Total</span>
              <span className="text-[var(--saffron-400)]">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/orders/${order.id}/track`} className="flex-1">
            <Button className="w-full py-5 font-semibold shadow-[0_0_20px_rgba(245,137,10,0.25)]">
              <Package className="mr-2 h-4 w-4" />
              Track Order
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" className="w-full py-5 font-semibold border-[var(--border-strong)] hover:border-[var(--saffron-500)] hover:text-[var(--saffron-400)]">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
