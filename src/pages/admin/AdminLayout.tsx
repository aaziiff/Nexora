import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Sliders,
  Star,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAdminAuthenticated, adminLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders & Dispatch', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customer Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Store Settings', href: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-ivory-200/50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-950 text-ivory-200 p-6 flex flex-col justify-between border-r border-charcoal-800 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-charcoal-800/80">
            <Logo variant="full" theme="light" size="sm" />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-luxury text-sage-400 font-semibold px-3 block mb-2">
              Operator Management
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-charcoal-800 text-ivory-50 border border-charcoal-700'
                      : 'text-charcoal-400 hover:text-ivory-100 hover:bg-charcoal-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sage-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-charcoal-800/80">
            <Link
              to="/admin/products/new"
              className="flex items-center justify-center gap-2 w-full bg-sage-800 hover:bg-sage-700 text-ivory-50 py-2.5 px-3 rounded text-xs font-semibold uppercase tracking-luxury transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-charcoal-800/80 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-charcoal-400 hover:text-ivory-100 transition-colors"
          >
            <span>Live Brand Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              adminLogout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors w-full text-left pt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
