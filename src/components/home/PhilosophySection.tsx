import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  return (
    <section id="philosophy" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Large Editorial Statement */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-4"
        >
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            01 / Philosophy
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal-900 font-light leading-[1.05]">
            Thoughtful products
            <br />
            <span className="italic">for a better everyday.</span>
          </h2>
        </motion.div>

        {/* Right: Short Brand Description & Action */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 lg:pt-8 space-y-8"
        >
          <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed font-sans font-light">
            At NEXORA, we discover useful, beautifully considered products for your home, kitchen, bathroom, personal care and everyday routines.
          </p>
          <p className="text-sm text-charcoal-500 leading-relaxed font-sans">
            We prioritize quiet utility over loud gimmicks. Every object in our roster is evaluated for material longevity, daily ergonomic comfort, and visual harmony with modern living spaces.
          </p>

          <div>
            <Link
              to="/story"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 border-b border-charcoal-900 hover:border-sage-800 pb-1 transition-all group"
            >
              <span>Our Philosophy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
