import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Utensils, Users, Ticket, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Categories', path: '/admin/categories', icon: LayoutGrid },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)]">
          <Link to="/" className="flex items-center gap-2 text-[var(--saffron-400)] hover:text-[var(--saffron-500)] transition">
            <Utensils className="h-6 w-6" />
            <span className="font-display font-bold text-xl tracking-tight">Ruchi Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive 
                  ? 'bg-[var(--saffron-500)] text-[#1a1814] font-bold shadow-[0_0_15px_rgba(245,137,10,0.3)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center font-bold text-[var(--saffron-400)]">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.full_name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-[var(--chili-400)] border-[var(--border-subtle)] hover:bg-[var(--chili-500)]/10"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
