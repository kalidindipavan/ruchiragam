import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { CreditCard, Loader2, ArrowLeft, Ticket, Tag, X, Banknote } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import apiClient from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { formatINR } from '../lib/utils';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(4, 'Postal code is required'),
  special_instructions: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, subtotal, fetchCart } = useCartStore();
  
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number} | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const { data: response } = await apiClient.post('/coupons/validate', { 
        code: couponCode.trim(), 
        subtotal 
      });
      setAppliedCoupon(response.data);
      toast.success(`Coupon "${response.data.code}" applied!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  const deliveryFee = subtotal > 500 ? 0 : 50;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + deliveryFee - discountAmount;

  const onSubmit = async (data: AddressFormValues) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Order
      const { data: orderResponse } = await apiClient.post('/orders', {
        delivery_address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: 'India',
        },
        payment_provider: paymentProvider,
        special_instructions: data.special_instructions,
        coupon_code: appliedCoupon?.code,
      });

      const orderId = orderResponse.data?.id;
      const orderTotal = Number(orderResponse.data?.total || 0);

      if (!orderId) {
        throw new Error('Order was created but ID is missing');
      }

      // COD: order is already confirmed server-side, go directly to success
      if (paymentProvider === 'cod') {
        toast.success('Order placed! Pay cash on delivery.');
        await fetchCart();
        navigate(`/orders/${orderId}`);
        setIsProcessing(false);
        return;
      }

      // Free/fully-discounted order: no gateway payment required
      if (orderTotal <= 0) {
        toast.success('Order placed successfully!');
        await fetchCart();
        navigate(`/orders/${orderId}`);
        setIsProcessing(false);
        return;
      }

      // 2. Initiate Payment
      if (paymentProvider === 'stripe') {
        const { data: stripeResponse } = await apiClient.post('/payments/stripe/create', { order_id: orderId });
        // Redirect to Stripe Checkout
        window.location.href = stripeResponse.data.sessionUrl;
      } 
      else if (paymentProvider === 'razorpay') {
        const res = await loadRazorpayScript();
        if (!res) {
           toast.error('Razorpay SDK failed to load. Are you online?');
           setIsProcessing(false);
           return;
        }

        const { data: rzpResponse } = await apiClient.post('/payments/razorpay/create', { order_id: orderId });
        const { razorpayOrderId, amount, currency, keyId, prefill } = rzpResponse.data;

        const options = {
          key: keyId,
          amount: amount.toString(),
          currency: currency,
          name: 'Ruchi Ragam',
          description: 'Authentic Indian Food Order',
          image: '/logo.png', // Add a logo asset layer
          order_id: razorpayOrderId,
          handler: async function (response: any) {
             try {
               await apiClient.post('/payments/razorpay/verify', {
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 order_id: orderId,
               });
               toast.success('Payment successful!');
               await fetchCart(); // Clear cart in UI
               navigate(`/orders/${orderId}`); // Take to order success page
             } catch (err) {
               toast.error('Payment verification failed.');
             }
          },
          prefill: {
            name: prefill.name,
            email: prefill.email,
            contact: prefill.contact,
          },
          readonly: {
            contact: true,
            email: true,
          },
          timeout: 600, // 10 minutes session timeout
          retry: {
            enabled: true,
            max_count: 3,
          },
          theme: {
            color: '#f5890a',
          },
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
           toast.error(`Payment Failed: ${response.error.description}`);
        });
        rzp1.open();
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const serverMessage = error.response?.data?.message;
      const clientMessage = error.message || 'Failed to process checkout';
      toast.error(serverMessage || clientMessage);
      setIsProcessing(false);
    }
  };

  if (!user) {
     navigate('/auth/login', { state: { from: { pathname: '/checkout' } } });
     return null;
  }

  if (items.length === 0 && !isProcessing) {
     return (
       <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/products')}>Browse Menu</Button>
       </div>
     );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="mb-8 flex items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-[var(--text-muted)] hover:text-[var(--saffron-400)] pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] ml-auto mr-auto pl-10">Secure Checkout</h1>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-7">
               <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Delivery Address */}
                  <Card className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-sm">
                     <CardHeader>
                        <CardTitle className="text-xl">Delivery Details</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-[var(--text-secondary)]">Street Address</label>
                           <Input placeholder="House No, Building, Street" {...register('street')} />
                           {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-secondary)]">City</label>
                              <Input placeholder="Hyderabad" {...register('city')} />
                              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-secondary)]">State</label>
                              <Input placeholder="Telangana" {...register('state')} />
                              {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-medium text-[var(--text-secondary)]">Postal / PIN Code</label>
                           <Input placeholder="500001" {...register('postal_code')} />
                           {errors.postal_code && <p className="text-xs text-red-500">{errors.postal_code.message}</p>}
                        </div>

                        <div className="space-y-2 pt-4">
                           <label className="text-sm font-medium text-[var(--text-secondary)]">Special Delivery Instructions (Optional)</label>
                           <Input placeholder="E.g., Please ring the bell and leave at door" {...register('special_instructions')} />
                        </div>
                     </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-sm">
                     <CardHeader>
                        <CardTitle className="text-xl">Payment Method</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                           
                           {/* Razorpay (India) */}
                           <div 
                              onClick={() => setPaymentProvider('razorpay')}
                              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                 paymentProvider === 'razorpay' 
                                 ? 'border-[var(--saffron-500)] bg-[var(--saffron-500)]/10 text-[var(--saffron-400)] shadow-[0_0_15px_rgba(245,137,10,0.15)]' 
                                 : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--saffron-400)]'
                               }`}
                           >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg">💳 Razorpay / UPI</span>
                                <input type="radio" checked={paymentProvider === 'razorpay'} readOnly className="accent-[var(--saffron-500)] w-4 h-4" />
                              </div>
                              <p className="text-xs opacity-80">(Recommended for India) Pay via UPI, Cards, Netbanking.</p>
                           </div>

                           {/* Stripe (International/Cards) */}
                           <div 
                              onClick={() => setPaymentProvider('stripe')}
                              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                 paymentProvider === 'stripe' 
                                 ? 'border-[var(--saffron-500)] bg-[var(--saffron-500)]/10 text-[var(--saffron-400)] shadow-[0_0_15px_rgba(245,137,10,0.15)]' 
                                 : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--saffron-400)]'
                               }`}
                           >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5"/> Credit Card</span>
                                <input type="radio" checked={paymentProvider === 'stripe'} readOnly className="accent-[var(--saffron-500)] w-4 h-4" />
                              </div>
                              <p className="text-xs opacity-80">Pay securely via Stripe (International & Domestic Cards).</p>
                           </div>

                           {/* Cash on Delivery */}
                           <div 
                              onClick={() => setPaymentProvider('cod')}
                              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                 paymentProvider === 'cod' 
                                 ? 'border-[var(--leaf-500)] bg-[var(--leaf-500)]/10 text-[var(--leaf-400)] shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                                 : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--leaf-400)]'
                               }`}
                           >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg flex items-center gap-2"><Banknote className="w-5 h-5"/> Cash on Delivery</span>
                                <input type="radio" checked={paymentProvider === 'cod'} readOnly className="accent-[var(--leaf-500)] w-4 h-4" />
                              </div>
                              <p className="text-xs opacity-80">Pay with cash when your food arrives at your doorstep.</p>
                           </div>

                        </div>
                     </CardContent>
                  </Card>
               </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
               <Card className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-saffron lg:sticky lg:top-24">
                  <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
                     <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                     <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6">
                        {items.map((item) => (
                           <div key={item.id} className="flex justify-between items-start text-sm">
                              <div>
                                 <p className="font-semibold text-[var(--text-primary)]">{item.products.name}</p>
                                 <p className="text-[var(--text-muted)] text-xs">{item.variants?.name || 'Standard'} x {item.quantity}</p>
                              </div>
                              <p className="font-medium text-[var(--text-primary)] tabular-nums">
                                {formatINR((item.variants ? item.variants.price : item.products.price) * item.quantity)}
                              </p>
                           </div>
                        ))}
                     </div>

                     <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3 text-sm">
                        <div className="flex justify-between text-[var(--text-secondary)]">
                           <span>Subtotal</span>
                           <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatINR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                           <span>Delivery Fee</span>
                           <span className="tabular-nums font-medium text-[var(--text-primary)]">
                             {deliveryFee === 0 ? <span className="text-[var(--leaf-500)]">Free</span> : formatINR(deliveryFee)}
                           </span>
                        </div>

                        {appliedCoupon && (
                           <div className="flex justify-between text-[var(--leaf-500)] font-medium">
                              <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> Discount ({appliedCoupon.code})</span>
                              <span className="tabular-nums">-{formatINR(appliedCoupon.discountAmount)}</span>
                           </div>
                        )}
                     </div>

                     {/* Coupon Input */}
                     <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        {!appliedCoupon ? (
                           <div className="flex gap-2">
                              <div className="relative flex-1">
                                 <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                 <Input 
                                    placeholder="Coupon Code" 
                                    className="pl-9 bg-[var(--bg-card)] border-[var(--border-strong)]"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                 />
                              </div>
                              <Button 
                                 type="button" 
                                 variant="outline" 
                                 onClick={handleApplyCoupon}
                                 disabled={isValidatingCoupon || !couponCode}
                                 className="border-[var(--saffron-500)] text-[var(--saffron-400)] hover:bg-[var(--saffron-500)]/10"
                              >
                                 {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                              </Button>
                           </div>
                        ) : (
                           <div className="flex items-center justify-between p-3 bg-[var(--leaf-500)]/10 border border-[var(--leaf-500)]/30 rounded-xl">
                              <div className="flex items-center gap-2">
                                 <Tag className="w-4 h-4 text-[var(--leaf-500)]" />
                                 <div>
                                    <p className="text-sm font-bold text-[var(--leaf-500)]">{appliedCoupon.code}</p>
                                    <p className="text-xs text-[var(--leaf-600)]">Coupon Applied</p>
                                 </div>
                              </div>
                              <button 
                                 type="button"
                                 onClick={handleRemoveCoupon}
                                 className="p-1 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="border-t border-[var(--border-subtle)] mt-4 pt-4 flex justify-between items-center text-lg font-bold">
                        <span className="text-[var(--text-primary)]">Total</span>
                        <span className="text-[var(--saffron-400)] tabular-nums">{formatINR(total)}</span>
                     </div>

                     <Button 
                        type="submit" 
                        form="checkout-form"
                        className="w-full mt-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(245,137,10,0.3)] transition-all"
                        disabled={isProcessing}
                     >
                        {isProcessing ? (
                           <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing... </>
                        ) : paymentProvider === 'cod' ? (
                           '🛵 Place Order (Cash on Delivery)'
                        ) : (
                           `Pay ${formatINR(total)}`
                        )}
                     </Button>
                     <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                       Your payment is securely processed. Need help? Call +91 98765 43210
                     </p>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
