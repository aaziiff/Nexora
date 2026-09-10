import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '../../context/CartContext';
import { SearchModal } from '../common/SearchModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalCount, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Shop All', href: '/products' },
    { name: 'Home', href: '/products?category=home' },
    { name: 'Care', href: '/products?category=care' },
    { name: 'Kitchen', href: '/products?category=kitchen' },
    { name: 'Bath', href: '/products?category=bath' },
    { name: 'Your Orders', href: '/orders' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Our Story', href: '/story' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3.5 shadow-sm'
            : 'bg-transparent py-5 border-b border-charcoal-900/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Toggle & Desktop Quick Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-charcoal-800 hover:text-charcoal-950 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden lg:flex items-center gap-7">
              <Link
                to="/products"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-800 hover:text-charcoal-950 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-charcoal-900 hover:after:w-full after:transition-all after:duration-300"
              >
                Shop All
              </Link>
              <Link
                to="/products?category=home"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/products?category=care"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Care
              </Link>
              <Link
                to="/products?category=kitchen"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Kitchen
              </Link>
              <Link
                to="/products?category=bath"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Bath
              </Link>
            </nav>
          </div>

          {/* Center: NEXORA Brand Wordmark */}
          <div className="flex items-center justify-center">
            <Logo variant="full" size="md" showTagline={false} />
          </div>

          {/* Right: Actions (Orders, Track, Story, Search, Bag) */}
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden lg:flex items-center gap-5 mr-1">
              <Link
                to="/orders"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Your Orders
              </Link>
              <Link
                to="/track-order"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Track
              </Link>
              <Link
                to="/story"
                className="text-[11px] font-medium tracking-luxury uppercase text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                Story
              </Link>
            </nav>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-charcoal-700 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-charcoal-800 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors flex items-center gap-1.5"
              aria-label={`Shopping bag with ${totalCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {totalCount > 0 && (
                <span className="text-[11px] font-semibold bg-charcoal-900 text-ivory-100 rounded-full w-4 h-4 flex items-center justify-center -ml-1">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-4/5 max-w-sm h-full bg-ivory-100 p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-stone/30 mb-8">
                  <Logo variant="full" size="sm" showTagline={false} />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-charcoal-600 hover:text-charcoal-950 rounded-full"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] tracking-luxury uppercase text-sage-800 font-semibold mb-2">
                    Explore NEXORA
                  </p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block font-serif text-2xl text-charcoal-900 hover:text-sage-800 hover:translate-x-1 transition-all py-1"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-stone/30 space-y-4 text-xs text-charcoal-600">
                <div className="flex items-center justify-between">
                  <span>Concierge Support</span>
                  <a href="mailto:concierge@nexoralife.com" className="font-medium text-charcoal-900">
                    concierge@nexoralife.com
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instagram</span>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-medium text-charcoal-900">
                    @nexora.official
                  </a>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-[11px] text-charcoal-400 hover:text-charcoal-800 pt-2"
                >
                  <span>Operator Login</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
