import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const BrandStorySection: React.FC = () => {
  return (
    <section id="story" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Editorial Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-8"
        >
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
              06 / Origin & Vision
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-charcoal-900 leading-[1.05]">
              OUR STORY
            </h2>
          </div>

          <div className="space-y-5 text-charcoal-700 font-sans font-light leading-relaxed">
            <p className="text-lg sm:text-xl font-serif text-charcoal-900 italic">
              We believe better everyday living doesn’t always require bigger things.
            </p>
            <p className="text-base sm:text-lg font-medium text-charcoal-900">
              Sometimes, it’s the small things.
            </p>

            <ul className="space-y-3 pt-2 text-sm sm:text-base border-l-2 border-sage-500/50 pl-4 text-charcoal-800 font-serif italic">
              <li>The tool that makes a morning routine easier.</li>
              <li>The accessory that solves a tiny countertop frustration.</li>
              <li>The tactile product you didn’t know you needed until you held it.</li>
            </ul>

            <p className="text-sm sm:text-base text-charcoal-600 font-sans pt-2">
              That’s what NEXORA is about. We are building an antidote to disposable fast-commerce by curating calm, durable objects made to serve you reliably every single day.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/story"
              className="inline-flex items-center gap-3 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-4 rounded transition-all duration-300 shadow-md group"
            >
              <span>Discover Our Full Story</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Right: Curated Lifestyle Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-ivory-200 border border-stone/40">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
              alt="NEXORA studio lifestyle scene"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/40 via-transparent to-transparent" />
          </div>

          <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-ivory-100 border border-stone/40 shadow-xl hidden sm:block max-w-[200px]">
            <span className="text-[9px] uppercase tracking-luxury font-semibold text-sage-800 block">
              Independent Studio
            </span>
            <p className="text-xs text-charcoal-800 font-serif mt-1">
              Curated in India for mindful homes everywhere.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
