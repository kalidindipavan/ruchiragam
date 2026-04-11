import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import CartSidebar from '../components/cart/CartSidebar';

function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f5890a] to-[#e8b84b]">
              Ruchi Ragam
            </span>
            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed">
              Authentic homemade Indian pickles, podis, and masalas prepared with traditional recipes and love. Delivering the true taste of home to your doorstep.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-sm mb-4">Shop</h3>
            <ul className="flex flex-col space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="/products?category=mango-pickles" className="hover:text-[var(--saffron-400)] transition">Mango Pickles</a></li>
              <li><a href="/products?category=veg-pickles" className="hover:text-[var(--saffron-400)] transition">Veg Pickles</a></li>
              <li><a href="/products?category=non-veg-pickles" className="hover:text-[var(--saffron-400)] transition">Non-Veg Pickles</a></li>
              <li><a href="/products?category=podis-powders" className="hover:text-[var(--saffron-400)] transition">Spice Podis</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-sm mb-4">Support</h3>
            <ul className="flex flex-col space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="/support" className="flex items-center gap-1.5 text-[var(--saffron-500)] hover:text-[var(--saffron-400)] transition font-medium">Support Hub &rarr;</a></li>
              <li><a href="/faq" className="hover:text-[var(--saffron-400)] transition">FAQ</a></li>
              <li><a href="/shipping" className="hover:text-[var(--saffron-400)] transition">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-[var(--saffron-400)] transition">Returns</a></li>
              <li><a href="/contact" className="hover:text-[var(--saffron-400)] transition">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-sm mb-4">Contact</h3>
            <ul className="flex flex-col space-y-2 text-sm text-[var(--text-secondary)]">
              <li>support@ruchiragam.com</li>
              <li>+91 98765 43210</li>
              <li className="pt-2">Hyderabad, Telangana<br />India - 500081</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Ruchi Ragam. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-[var(--text-muted)]">
            <a href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</a>
            <a href="/terms" className="hover:text-[var(--text-primary)]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
