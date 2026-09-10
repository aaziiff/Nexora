import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[94vh] flex flex-col justify-between pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Top Tagline Pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center sm:justify-start items-center mb-4"
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand/60 text-charcoal-800 text-[10px] tracking-[0.25em] uppercase font-semibold border border-stone/40">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-600 animate-pulse" />
          The Everyday Collection 2026
        </span>
      </motion.div>

      {/* Main Editorial Layout (Split Typography & Visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
        {/* Left: Large Editorial Headline & CTAs */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10 text-center sm:text-left">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-light text-charcoal-900 leading-[0.98] tracking-tight"
            >
              SMALL THINGS.
              <br />
              <span className="italic font-normal text-charcoal-800">BETTER EVERYDAY.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-charcoal-600 max-w-xl font-sans font-light leading-relaxed mx-auto sm:mx-0"
          >
            Thoughtfully chosen essentials for a simpler, smarter everyday. We discover useful, beautifully considered objects for your daily spaces and routines.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2"
          >
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-charcoal-900 text-ivory-100 px-8 py-4 rounded text-xs uppercase tracking-luxury font-semibold hover:bg-charcoal-950 transition-all duration-300 shadow-md group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/story"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-charcoal-900/30 text-charcoal-900 px-8 py-4 rounded text-xs uppercase tracking-luxury font-semibold hover:bg-stone/20 transition-all duration-300"
            >
              <span>Our Story</span>
            </Link>
          </motion.div>

          {/* Quick Metrics / Proofs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-6 sm:pt-10 border-t border-stone/30 grid grid-cols-3 gap-4 max-w-md mx-auto sm:mx-0 text-left"
          >
            <div>
              <div className="font-serif text-2xl font-normal text-charcoal-900">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-medium">Curated Utility</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-normal text-charcoal-900">4.9/5</div>
              <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-medium">Verified Calm</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-normal text-charcoal-900">Zero</div>
              <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-medium">Plastic Waste</div>
            </div>
          </motion.div>
        </div>

        {/* Right: Immersive Lifestyle / Product Composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative mt-4 lg:mt-0"
        >
          {/* Main Visual Frame */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-ivory-200 border border-stone/40">
            <img
              src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop"
              alt="NEXORA lifestyle essentials"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />

            {/* Overlaid Editorial Feature Card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-ivory-100/90 backdrop-blur-md border border-stone/40 text-charcoal-900 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-luxury font-semibold text-sage-800">
                    Featured Routine Essential
                  </span>
                  <h3 className="font-serif text-lg font-medium text-charcoal-950">
                    Diatomite Fast-Dry Stone Caddy
                  </h3>
                  <p className="text-[11px] text-charcoal-600 font-sans">
                    Absorbs sink water droplets in 60 seconds
                  </p>
                </div>
                <Link
                  to="/product/diatomite-quick-dry-stone-tray"
                  className="w-8 h-8 rounded-full bg-charcoal-900 text-ivory-100 flex items-center justify-center shrink-0 hover:bg-sage-800 transition-colors"
                  aria-label="View featured stone caddy"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Corner Offset Element */}
          <div className="absolute -top-4 -right-4 w-28 h-28 border border-sage-500/30 rounded-2xl -z-10 hidden sm:block pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-sand/40 rounded-2xl -z-10 hidden sm:block pointer-events-none" />
        </motion.div>
      </div>

      {/* Bottom Scroll Hint */}
      <div className="flex justify-center pt-8">
        <a
          href="#scroll-transition"
          className="flex flex-col items-center gap-2 text-charcoal-400 hover:text-charcoal-800 transition-colors group"
          aria-label="Scroll to discover more"
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium">Scroll to Discover</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-sage-600" />
        </a>
      </div>
    </section>
  );
};
