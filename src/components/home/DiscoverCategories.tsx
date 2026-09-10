import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/products';

export const DiscoverCategories: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-2">
            02 / Curated Spaces
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
            DISCOVER NEXORA
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-charcoal-500 max-w-md font-sans leading-relaxed">
          Explore refined utilities grouped by the areas of your life and home where small enhancements make the greatest daily difference.
        </p>
      </div>

      {/* Interactive Category Panels (Horizontal Scroll on Mobile, Asymmetric Staggered Grid on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {CATEGORIES.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group"
          >
            <Link
              to={`/products?category=${cat.slug}`}
              className="relative block h-[380px] sm:h-[420px] lg:h-[460px] rounded-xl overflow-hidden bg-ivory-200 border border-stone/30 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Image with gentle zoom */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Dynamic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent group-hover:from-charcoal-950/90 transition-colors duration-500" />

              {/* Top Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="text-[9px] uppercase tracking-widest text-ivory-100/90 bg-charcoal-900/60 backdrop-blur-md px-2.5 py-1 rounded-full font-medium">
                  0{index + 1}
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-ivory-100 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-ivory-50 mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-ivory-300 font-sans line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {cat.tagline}
                  </p>
                </div>

                {/* Animated Arrow button appearing on hover */}
                <div className="flex items-center justify-between pt-3 border-t border-ivory-100/20 mt-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] uppercase tracking-luxury font-medium text-sage-300">
                    Explore Space
                  </span>
                  <div className="w-7 h-7 rounded-full bg-ivory-100 text-charcoal-950 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-45 transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
