import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Feather, Sliders } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../lib/database';

export const ProductStorySection: React.FC = () => {
  const [spotlightProduct, setSpotlightProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchSpotlight = () => {
      db.getProducts().then((products) => {
        if (products.length > 0) {
          const item =
            products.find((p) => p.slug === 'ergonomic-ceramic-burr-coffee-grinder') ||
            products[1] ||
            products[0];
          setSpotlightProduct(item);
        } else {
          setSpotlightProduct(null);
        }
      });
    };

    fetchSpotlight();
    window.addEventListener('nexora_products_updated', fetchSpotlight);
    return () => window.removeEventListener('nexora_products_updated', fetchSpotlight);
  }, []);

  const benefits = [
    {
      number: '01',
      title: 'SIMPLE',
      icon: Feather,
      subtitle: 'Zero unnecessary parts',
      description:
        'Stripped of superfluous plastic, noisy electronics, and fragile mechanisms. Only tactile, honest materials that operate intuitively from day one.',
    },
    {
      number: '02',
      title: 'USEFUL',
      icon: Sliders,
      subtitle: 'Solves real daily frictions',
      description:
        'Engineered directly around high-frequency routines: stopping countertop water puddles, organizing desk cords, or grinding fresh coffee beans at sunrise.',
    },
    {
      number: '03',
      title: 'BETTER',
      icon: Sparkles,
      subtitle: 'Crafted to age gracefully',
      description:
        'Solid brass, volcanic stone, borosilicate glass, and aerospace titanium develop a natural, warm patina over years of reliable everyday ownership.',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-ivory-200/50 border-y border-stone/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            04 / Spotlight
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-charcoal-900">
            DESIGNED FOR YOUR ROUTINE.
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-sans font-light leading-relaxed max-w-xl mx-auto">
            We believe that improving your everyday experience doesn’t require overcomplicated gadgets. It requires thoughtful material curation.
          </p>
        </div>

        {/* Immersive Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Large Visual Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-ivory-300 border border-stone/40">
              <img
                src={spotlightProduct?.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop'}
                alt={spotlightProduct?.name || 'Tactile hand coffee mill detail'}
                className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent" />

              {spotlightProduct && (
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-ivory-100/90 backdrop-blur-md border border-stone/30">
                  <span className="text-[9px] uppercase tracking-luxury font-semibold text-sage-800">
                    Featured Product Anatomy
                  </span>
                  <h4 className="font-serif text-xl font-normal text-charcoal-950 mt-0.5 line-clamp-1">
                    {spotlightProduct.name}
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 font-sans line-clamp-1">
                    {spotlightProduct.tagline}
                  </p>
                  <div className="pt-3 mt-3 border-t border-stone/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-900">
                      ₹{spotlightProduct.price.toLocaleString('en-IN')}
                    </span>
                    <Link
                      to={`/product/${spotlightProduct.slug}`}
                      className="text-[10px] uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 flex items-center gap-1"
                    >
                      <span>View Anatomy</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: 3 Benefits List (01 SIMPLE, 02 USEFUL, 03 BETTER) */}
          <div className="lg:col-span-6 space-y-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.number}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="group p-6 sm:p-7 rounded-xl bg-ivory-100 border border-stone/30 hover:border-sage-500/50 hover:shadow-lg transition-all duration-400"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-stone/20 group-hover:bg-sage-100 text-charcoal-800 group-hover:text-sage-800 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-sage-700">
                          {benefit.number}
                        </span>
                        <h3 className="font-serif text-2xl font-light tracking-wide text-charcoal-950">
                          {benefit.title}
                        </h3>
                      </div>
                      <h4 className="text-xs uppercase tracking-luxury font-semibold text-charcoal-700">
                        {benefit.subtitle}
                      </h4>
                      <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed pt-1">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
