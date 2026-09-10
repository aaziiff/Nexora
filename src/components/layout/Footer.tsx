import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { ArrowUpRight, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-950 text-ivory-200 border-t border-charcoal-800/80 pt-16 pb-12">
      {/* Brand Value Pillars / Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-charcoal-800/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Truck className="w-5 h-5 text-sage-400" />
            <h5 className="text-xs uppercase tracking-luxury font-medium text-ivory-100">Direct India Dispatch</h5>
            <p className="text-xs text-charcoal-400 leading-relaxed">Fast 2-4 day express delivery across all metro pins.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-sage-400" />
            <h5 className="text-xs uppercase tracking-luxury font-medium text-ivory-100">Curated Durability</h5>
            <p className="text-xs text-charcoal-400 leading-relaxed">Tested materials: solid brass, diatomite & titan alloy.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <RefreshCw className="w-5 h-5 text-sage-400" />
            <h5 className="text-xs uppercase tracking-luxury font-medium text-ivory-100">7-Day Replacement</h5>
            <p className="text-xs text-charcoal-400 leading-relaxed">Hassle-free guarantee if transit damage occurs.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <Lock className="w-5 h-5 text-sage-400" />
            <h5 className="text-xs uppercase tracking-luxury font-medium text-ivory-100">Secure UPI & COD</h5>
            <p className="text-xs text-charcoal-400 leading-relaxed">Zero hidden fees with verified payment processing.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Logo variant="full" theme="light" size="lg" showTagline={true} />
            <p className="text-xs text-charcoal-400 leading-relaxed max-w-sm font-sans pt-2">
              NEXORA is a modern everyday-lifestyle studio that discovers and curates useful, aesthetically pleasing products to make everyday routines simpler, smarter, and better.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-charcoal-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-sage-300 transition-colors uppercase tracking-widest text-[11px]"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span className="text-charcoal-700">•</span>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-sage-300 transition-colors uppercase tracking-widest text-[11px]"
              >
                <span>WhatsApp Concierge</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* SHOP */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-medium tracking-luxury uppercase text-ivory-100">Shop</h4>
              <ul className="space-y-2.5 text-xs text-charcoal-400">
                <li>
                  <Link to="/products" className="hover:text-ivory-100 transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=home" className="hover:text-ivory-100 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=care" className="hover:text-ivory-100 transition-colors">
                    Personal Care
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=kitchen" className="hover:text-ivory-100 transition-colors">
                    Kitchen
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=bath" className="hover:text-ivory-100 transition-colors">
                    Bath Sanctuary
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=everyday" className="hover:text-ivory-100 transition-colors">
                    Everyday Utility
                  </Link>
                </li>
              </ul>
            </div>

            {/* ABOUT */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-medium tracking-luxury uppercase text-ivory-100">About</h4>
              <ul className="space-y-2.5 text-xs text-charcoal-400">
                <li>
                  <Link to="/story" className="hover:text-ivory-100 transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <a href="/#philosophy" className="hover:text-ivory-100 transition-colors">
                    Brand Philosophy
                  </a>
                </li>
                <li>
                  <a href="/#why-nexora" className="hover:text-ivory-100 transition-colors">
                    Why NEXORA?
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-ivory-100 transition-colors">
                    Contact & Inquiries
                  </Link>
                </li>
              </ul>
            </div>

            {/* HELP */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-medium tracking-luxury uppercase text-ivory-100">Help</h4>
              <ul className="space-y-2.5 text-xs text-charcoal-400">
                <li>
                  <Link to="/orders" className="hover:text-ivory-100 transition-colors text-sage-300">
                    Your Orders & History
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" className="hover:text-ivory-100 transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:text-ivory-100 transition-colors">
                    Shipping & Delivery
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-ivory-100 transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-ivory-100 transition-colors">
                    Frequently Asked
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL & ADMIN */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-medium tracking-luxury uppercase text-ivory-100">Legal</h4>
              <ul className="space-y-2.5 text-xs text-charcoal-400">
                <li>
                  <Link to="/privacy-policy" className="hover:text-ivory-100 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-ivory-100 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-ivory-100 transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li className="pt-2">
                  <Link to="/admin" className="text-charcoal-500 hover:text-sage-400 text-[11px] transition-colors">
                    Operator Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Editorial Watermark Wordmark */}
        <div className="py-10 border-t border-charcoal-900 flex justify-center items-center select-none opacity-20 hover:opacity-30 transition-opacity">
          <span className="font-serif text-[clamp(48px,12vw,130px)] tracking-[0.25em] font-light text-ivory-100 leading-none">
            NEXORA
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-charcoal-900/90 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-4">
          <p>© 2026 NEXORA Lifestyle Private Limited. All rights reserved.</p>
          <p className="text-[11px] text-charcoal-500">
            Designed for mindful living • Made for everyday
          </p>
        </div>
      </div>
    </footer>
  );
};
