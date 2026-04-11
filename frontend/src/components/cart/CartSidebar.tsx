import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/button';
import { formatINR } from '../../lib/utils';
import { useEffect } from 'react';

export default function CartSidebar() {
  const { isOpen, setIsOpen, items, subtotal, updateQuantity, removeFromCart, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchCart(); // Refresh cart on open
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, fetchCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] shadow-2xl transition-transform duration-300 transform flex flex-col slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--saffron-400)]" /> My Cart
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[var(--text-muted)]">
              <div className="p-4 rounded-full bg-[var(--bg-hover)]">
                <ShoppingBag className="h-12 w-12 text-[var(--border-strong)]" />
              </div>
              <p className="text-lg font-medium text-[var(--text-secondary)]">Your cart is empty</p>
              <p className="text-sm">Looks like you haven't added any authentic pickles or podis yet.</p>
              <Button 
                onClick={() => { setIsOpen(false); navigate('/products'); }}
                variant="outline"
                className="mt-4"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex py-2">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                    <img
                      src={item.products.image_url || 'https://via.placeholder.com/150'}
                      alt={item.products.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-base font-bold text-[var(--text-primary)]">
                        <h3 className="line-clamp-1 group-hover:text-[var(--saffron-400)] transition-colors">
                          <a href={`/products/${item.products.id}`}>{item.products.name}</a>
                        </h3>
                        <p className="ml-4 tabular-nums">
                          {formatINR(item.variants ? item.variants.price : item.products.price)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {item.variants?.name || 'Standard'}
                      </p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-card)]">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--saffron-400)] disabled:opacity-50 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--saffron-400)] transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-[var(--text-muted)] hover:text-[var(--chili-400)] transition flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] px-6 py-6 bg-[var(--bg-card)]">
            <div className="flex justify-between text-base font-medium text-[var(--text-primary)] mb-2">
              <p>Subtotal</p>
              <p className="font-bold">{formatINR(subtotal)}</p>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Delivery and taxes calculated at checkout.
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
                className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(245,137,10,0.25)] flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
