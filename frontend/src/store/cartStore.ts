import { create } from 'zustand';
import apiClient from '../lib/apiClient';

interface CartItem {
  id: string; // Cart item ID
  product_id: string;
  variant_id: string | null;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    status: string;
  };
  variants: {
    id: string;
    name: string;
    price: number;
  } | null;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get('/cart');
      set({
        items: data.data.items,
        subtotal: data.data.subtotal,
        itemCount: data.data.item_count,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, variantId = null, quantity = 1) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/cart', { product_id: productId, variant_id: variantId, quantity });
      await get().fetchCart();
      set({ isOpen: true }); // Open cart sidebar on add
    } catch (error) {
      console.error('Failed to add to cart:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return;
    set({ isLoading: true });
    try {
      await apiClient.put(`/cart/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      set({ isLoading: false });
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true });
    try {
      await apiClient.delete(`/cart/${itemId}`);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await apiClient.delete('/cart/clear');
      set({ items: [], subtotal: 0, itemCount: 0, isLoading: false, isOpen: false });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      set({ isLoading: false });
    }
  },
}));
