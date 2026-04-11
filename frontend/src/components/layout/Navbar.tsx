import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Utensils } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, setIsOpen } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Prevent double injection during React StrictMode development
  //   if (document.getElementById('google-translate-script')) return;

  //   // Add the callback function to the global window object
  //   // @ts-ignore
  //   window.googleTranslateElementInit = () => {
  //     const container = document.getElementById('google_translate_element');
  //     if (container && container.childNodes.length === 0) {
  //       // @ts-ignore
  //       new window.google.translate.TranslateElement(
  //         { pageLanguage: 'en', includedLanguages: 'te,en' },
  //         'google_translate_element'
  //       );
  //     }
  //   };

  //   // Dynamically inject the script to ensure DOM contains the target div FIRST
  //   const script = document.createElement('script');
  //   script.id = 'google-translate-script';
  //   script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  //   script.async = true;
  //   document.body.appendChild(script);
  // }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] navbar-glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5890a] to-[#e8b84b] shadow-lg shadow-[#f5890a]/30">
              <Utensils className="h-5 w-5 text-[#1a1814]" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5890a] to-[#e8b84b]">
              రుచి రాగం
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:gap-x-8">
          <Link to="/" className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--saffron-400)]">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--saffron-400)]">
            Products
          </Link>
          <Link to="/about" className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--saffron-400)]">
            Our Story
          </Link>
          <Link to="/support" className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--saffron-400)]">
            Support
          </Link>
        </div>

        {/* Universal Actions Container */}
        <div className="flex items-center gap-3 md:gap-4">
          <div id="google_translate_element" className="h-[30px] overflow-hidden rounded border border-[var(--border-subtle)] flex items-center bg-[var(--bg-elevated)] hidden sm:flex shadow-sm"></div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:gap-x-5">
            <button
              className="group relative rounded-full p-2 transition-colors hover:bg-[var(--bg-hover)]"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--saffron-400)]" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--chili-500)] text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--bg-primary)]">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="h-5 w-px bg-[var(--border-strong)]" />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--saffron-400)] transition-colors">
                  <User className="h-4 w-4" />
                  <span>{user?.full_name?.split(' ')[0]}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Badge variant="outline" className="border-[var(--saffron-500)] text-[var(--saffron-400)] cursor-pointer hover:bg-[var(--saffron-500)] hover:text-white transition-colors">Admin</Badge>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-[var(--text-muted)] hover:text-[var(--chili-400)] transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/login">
                  <Button variant="ghost" className="text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:text-[var(--saffron-400)]">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="shadow-[0_0_15px_rgba(245,137,10,0.25)]">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            <button
              className="relative p-1 text-[var(--text-secondary)] hover:text-[var(--saffron-400)]"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--chili-500)] text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--saffron-400)] p-1"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4 shadow-xl">
          <div className="flex flex-col space-y-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-[var(--text-primary)]">Home</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-[var(--text-primary)]">Products</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-[var(--text-primary)]">Our Story</Link>
            <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-[var(--text-primary)]">Support</Link>

            <div className="h-px w-full bg-[var(--border-subtle)] my-2" />

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-base font-medium text-[var(--text-primary)]">
                  <User className="h-5 w-5 text-[var(--saffron-400)]" /> Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-base font-medium text-[var(--text-primary)]">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-base font-medium text-[var(--chili-400)] text-left"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Log in</Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
