import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../lib/database';
import { ProductCard } from '../product/ProductCard';

export const FeaturedFavorites: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    db.getProducts().then(setProducts);

    const handleUpdate = () => {
      db.getProducts().then(setProducts);
    };
    window.addEventListener('nexora_products_updated', handleUpdate);
    return () => window.removeEventListener('nexora_products_updated', handleUpdate);
  }, []);

  if (products.length === 0) return null;

  // Curate up to 4 distinct items for the editorial layout
  const leadProduct = products[0] || null;
  const secondProduct = products[1] || null;
  const thirdProduct = products[2] || null;
  const fourthProduct = products[3] || null;

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-2">
            03 / Selection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
            CURRENT FAVOURITES
          </h2>
          <p className="font-serif italic text-lg text-charcoal-600 mt-1">
            Things worth making room for.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 transition-colors"
        >
          <span>View All Everyday Finds</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Asymmetric Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left: Large Feature Product (Columns 1-6) */}
        {leadProduct && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={products.length === 1 ? 'lg:col-span-12 flex flex-col' : 'lg:col-span-6 flex flex-col'}
          >
            <ProductCard product={leadProduct} variant="featured-large" className="h-full" />
          </motion.div>
        )}

        {/* Right: Stack of Two Medium Products (Columns 7-12) */}
        {products.length > 1 && (
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {secondProduct && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={!thirdProduct && !fourthProduct ? 'sm:col-span-2' : ''}
              >
                <ProductCard product={secondProduct} variant="standard" className="h-full" />
              </motion.div>
            )}

            {thirdProduct && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={thirdProduct} variant="standard" className="h-full" />
              </motion.div>
            )}

            {/* Fourth Anchor Feature */}
            {fourthProduct && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="sm:col-span-2"
              >
                <div className="bg-sand/30 border border-stone/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-sand/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={fourthProduct.images[0]}
                      alt={fourthProduct.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-stone/30 shrink-0"
                    />
                    <div>
                      <span className="text-[9px] uppercase tracking-luxury text-sage-800 font-semibold block">
                        Routine Highlight
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl text-charcoal-950 font-normal">
                        {fourthProduct.name}
                      </h4>
                      <p className="text-xs text-charcoal-600 line-clamp-1 mt-0.5">{fourthProduct.tagline}</p>
                      <div className="mt-1 text-xs font-semibold text-charcoal-900">
                        ₹{fourthProduct.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/product/${fourthProduct.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-6 py-3 rounded transition-colors"
                  >
                    <span>Explore Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
