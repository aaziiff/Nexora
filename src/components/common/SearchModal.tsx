import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../lib/database';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      db.getProducts().then(setProducts);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, products]);

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-charcoal-950/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl bg-ivory-100 rounded-xl shadow-2xl border border-stone/40 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-5 py-4 border-b border-stone/30 bg-ivory-200/50">
              <Search className="w-5 h-5 text-charcoal-600 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search everyday essentials, bath, kitchen, care..."
                className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 text-base focus:outline-none font-sans"
              />
              <button
                onClick={onClose}
                className="p-1.5 text-charcoal-500 hover:text-charcoal-900 rounded-md hover:bg-stone/20 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-stone/20">
              {query.trim() === '' ? (
                <div className="py-8 text-center text-charcoal-500">
                  <p className="text-xs uppercase tracking-[0.2em] font-medium text-charcoal-400 mb-3">
                    Popular Categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Diatomite Stone', 'Coffee Mill', 'Bian Stone Care', 'Solid Brass', 'Everyday Carry'].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="text-xs px-3 py-1.5 rounded-full bg-stone/20 hover:bg-sage-100 text-charcoal-800 transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-stone/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover border border-stone/30"
                        />
                        <div>
                          <span className="text-[10px] tracking-luxury uppercase text-sage-700 font-semibold">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-medium text-charcoal-900 group-hover:text-charcoal-950 font-sans">
                            {product.name}
                          </h4>
                          <p className="text-xs text-charcoal-500 line-clamp-1">{product.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-charcoal-900 font-sans">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:translate-x-1 group-hover:text-charcoal-900 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-charcoal-500">
                  <p className="text-sm">No curated products found matching "{query}"</p>
                  <p className="text-xs text-charcoal-400 mt-1">Try searching for kitchen, stone, brass, or care.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
