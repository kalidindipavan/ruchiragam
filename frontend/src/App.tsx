import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/AuthCallback';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import FAQ from './pages/info/FAQ';
import ShippingPolicy from './pages/info/ShippingPolicy';
import Returns from './pages/info/Returns';
import ContactUs from './pages/info/ContactUs';
import Support from './pages/info/Support';
import About from './pages/info/About';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageCategories from './pages/admin/ManageCategories';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent shadow-[0_0_15px_rgba(245,137,10,0.5)]"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          },
        }}
      />
      <SpeedInsights />
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="*" element={<h1 className="text-2xl font-bold text-[var(--saffron-400)]">Admin Page Under Construction</h1>} />
        </Route>

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />

          {/* Missing Pages Placeholder */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-[50vh] p-10 text-center">
              <h1 className="text-3xl font-display text-[var(--saffron-400)]">Coming Soon</h1>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
