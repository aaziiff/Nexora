import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Feather, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Story: React.FC = () => {
  return (
    <div className="editorial-noise">
      {/* Hero Header */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block"
        >
          Our Origins & Philosophy
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-charcoal-900 leading-[1.05]"
        >
          THE ART OF SMALL THINGS.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif italic text-xl sm:text-2xl text-charcoal-600 max-w-2xl mx-auto"
        >
          “Because everyday life is not lived in grand moments alone — it is made of everyday routines.”
        </motion.p>
      </section>

      {/* Narrative Section 1 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-charcoal-700 font-sans font-light leading-relaxed">
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal">
              An Antidote to Disposable Fast-Commerce
            </h2>
            <p className="text-sm sm:text-base">
              NEXORA was born out of a shared frustration with the noise of modern online marketplaces: thousands of low-grade plastic products, flashy discounts, fake urgency timers, and items designed to break within months.
            </p>
            <p className="text-sm sm:text-base">
              We asked a simple question: What if a brand existed solely to discover, test, and curate genuinely useful, beautifully built objects that make ordinary daily moments quieter and better?
            </p>
            <p className="text-sm sm:text-base text-charcoal-900 font-medium">
              From morning coffee grinding and bathroom sink organization to evening wind-down rituals, NEXORA pieces are chosen to serve you faithfully every single day.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-stone/30 bg-ivory-200">
              <img
                src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1200&auto=format&fit=crop"
                alt="NEXORA studio craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Materials Manifesto */}
      <section className="py-24 bg-ivory-200/50 border-y border-stone/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
              Material Standards
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
              Honest, Tactile Materials
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 font-sans">
              We seek out authentic minerals, metals, and ceramics that feel balanced in the hand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-ivory-100 border border-stone/30 space-y-3">
              <span className="text-xs font-mono text-sage-700">01</span>
              <h4 className="font-serif text-2xl text-charcoal-900">Natural Diatomite & Stone</h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Fossilized mineral earth with microscopic porosity that instantly dissipates water without synthetic chemicals.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-ivory-100 border border-stone/30 space-y-3">
              <span className="text-xs font-mono text-sage-700">02</span>
              <h4 className="font-serif text-2xl text-charcoal-900">Solid Milled Brass & Titanium</h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Machined metal monoliths that provide satisfying tactile weight and develop a rich, timeless natural patina.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-ivory-100 border border-stone/30 space-y-3">
              <span className="text-xs font-mono text-sage-700">03</span>
              <h4 className="font-serif text-2xl text-charcoal-900">Apothecary Borosilicate Glass</h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Heavyweight tinted glass flacons designed to eliminate bathroom single-use plastics indefinitely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-6 text-center max-w-xl mx-auto space-y-6">
        <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-light">
          Experience the Difference
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans">
          Discover pieces worth making room for in your home and daily routines.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-4 rounded transition-colors shadow-md"
          >
            <span>Explore Curated Essentials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
