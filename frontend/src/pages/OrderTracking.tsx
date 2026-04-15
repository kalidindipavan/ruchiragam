import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, Package, Truck, Home, XCircle,
  ChevronLeft, Loader2, RefreshCw, MapPin, Phone, CreditCard
} from 'lucide-react';
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
  payment_provider: string;
  payment_status: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

type TrackingStep = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  time?: string;
};

const ORDER_STEPS: TrackingStep[] = [
  {
    key: 'pending',
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: CheckCircle2,
  },
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    description: 'Restaurant confirmed your order',
    icon: CheckCircle2,
  },
  {
    key: 'preparing',
    label: 'Preparing',
    description: 'Chef is cooking your food',
    icon: Package,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Your order is on the way',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Enjoy your meal!',
    icon: Home,
  },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function getStepIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function formatDateTime(isoString: string) {
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending:           { label: 'Pending',          color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    confirmed:         { label: 'Confirmed',        color: 'text-[var(--leaf-400)] bg-[var(--leaf-500)]/10 border-[var(--leaf-500)]/30' },
    preparing:         { label: 'Preparing',        color: 'text-[var(--saffron-400)] bg-[var(--saffron-500)]/10 border-[var(--saffron-500)]/30' },
    out_for_delivery:  { label: 'Out for Delivery', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    delivered:         { label: 'Delivered',        color: 'text-[var(--leaf-400)] bg-[var(--leaf-500)]/10 border-[var(--leaf-500)]/30' },
    cancelled:         { label: 'Cancelled',        color: 'text-red-400 bg-red-400/10 border-red-400/30' },
    refunded:          { label: 'Refunded',         color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  };
  const config = map[status] || { label: status, color: 'text-[var(--text-muted)] bg-[var(--bg-card)]' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color.split(' ')[0]}`}></span>
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.color.split(' ')[0].replace('text-', 'bg-')}`}></span>
      </span>
      {config.label}
    </span>
  );
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = async (quiet = false) => {
    if (!id) return;
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const { data: response } = await apiClient.get(`/orders/${id}`);
      setOrder(response.data);
    } catch {
      if (!quiet) navigate('/products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto-refresh every 30s if order is not delivered/cancelled
    const interval = setInterval(() => {
      if (order && !['delivered', 'cancelled', 'refunded'].includes(order.status)) {
        fetchOrder(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--saffron-500)]" />
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentStep = getStepIndex(order.status);
  const isCOD = order.payment_provider === 'cod';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-[var(--text-muted)] hover:text-[var(--saffron-400)] pl-0 gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => fetchOrder(true)}
            disabled={isRefreshing}
            className="text-[var(--text-muted)] hover:text-[var(--saffron-400)] gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Track Order</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm font-mono text-[var(--text-muted)]">#{order.id.split('-')[0].toUpperCase()}</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* ─── Tracking Timeline ─────────────────────────────────── */}
        <div className="mb-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">Order Progress</h2>

          {isCancelled ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-lg font-semibold text-red-400">
                {order.status === 'refunded' ? 'Order Refunded' : 'Order Cancelled'}
              </p>
              <p className="text-sm text-[var(--text-muted)] text-center">
                {order.status === 'refunded'
                  ? 'Your payment has been refunded.'
                  : 'This order has been cancelled.'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isActive = idx === currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Line */}
                    {idx < ORDER_STEPS.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 z-0"
                        style={{
                          background: idx < currentStep
                            ? 'linear-gradient(to bottom, #f5890a, #f5890a)'
                            : 'var(--border-subtle)',
                          height: 'calc(100% - 16px)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {isCompleted ? (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isActive
                            ? 'border-[var(--saffron-500)] bg-[var(--saffron-500)]/20 shadow-[0_0_12px_rgba(245,137,10,0.4)]'
                            : 'border-[var(--saffron-500)] bg-[var(--saffron-500)]/10'
                        }`}>
                          {isActive ? (
                            <div className="relative flex h-4 w-4 items-center justify-center">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--saffron-400)] opacity-40"></span>
                              <Icon className="h-4 w-4 text-[var(--saffron-400)]" />
                            </div>
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-[var(--saffron-400)]" />
                          )}
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-[var(--border-subtle)] bg-[var(--bg-card)]">
                          <Circle className="h-4 w-4 text-[var(--border-strong)]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-8 flex-1 ${idx === ORDER_STEPS.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-semibold text-sm transition-colors ${isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                        {step.label}
                        {isActive && <span className="ml-2 text-xs text-[var(--saffron-400)] font-normal">(Current)</span>}
                      </p>
                      <p className={`text-xs mt-0.5 ${isCompleted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                        {step.description}
                      </p>
                      {isCompleted && idx === 0 && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">{formatDateTime(order.created_at)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Order Items ───────────────────────────────────────── */}
        <div className="mb-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider text-[var(--text-muted)]">Items in this order</h2>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-12 w-12 rounded-xl object-cover flex-shrink-0 border border-[var(--border-subtle)] group-hover:border-[var(--saffron-500)]/50 transition-colors"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl flex-shrink-0 bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
                    <Package className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.product_name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.variant_name || 'Standard'} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{formatINR(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
            <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
            <span className="text-base font-bold text-[var(--saffron-400)]">{formatINR(order.total)}</span>
          </div>
        </div>

        {/* ─── Delivery Address ──────────────────────────────────── */}
        <div className="mb-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[var(--saffron-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Delivery Address</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {order.delivery_address.street}, {order.delivery_address.city},<br />
            {order.delivery_address.state} – {order.delivery_address.postal_code}
          </p>
        </div>

        {/* ─── Payment Info ──────────────────────────────────────── */}
        <div className="mb-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[var(--saffron-400)]" />
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Payment</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">
              {isCOD ? '💵 Cash on Delivery' : order.payment_provider === 'razorpay' ? '💳 Razorpay' : '💳 Stripe'}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              order.payment_status === 'completed'
                ? 'bg-[var(--leaf-500)]/10 text-[var(--leaf-400)]'
                : 'bg-yellow-400/10 text-yellow-400'
            }`}>
              {order.payment_status === 'completed' ? '✓ Paid' : isCOD ? 'Pay on Delivery' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Support Note */}
        <div className="text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <Phone className="h-3 w-3" />
          Need help? Call us at <span className="text-[var(--saffron-400)]">+91 98765 43210</span>
        </div>

      </div>
    </div>
  );
}
