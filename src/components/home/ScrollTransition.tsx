import React from 'react';
import { motion } from 'framer-motion';

export const ScrollTransition: React.FC = () => {
  return (
    <section id="scroll-transition" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-ivory-200/40 border-y border-stone/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-sage-700 font-semibold">
            Brand Manifesto
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-charcoal-950 tracking-tight leading-tight"
        >
          “WE BELIEVE THE LITTLE THINGS MATTER.”
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif italic text-xl sm:text-2xl md:text-3xl text-charcoal-600 font-normal max-w-2xl mx-auto"
        >
          Because everyday life is made of everyday things.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="pt-6 flex justify-center items-center gap-3"
        >
          <div className="w-12 h-[1px] bg-stone/60" />
          <div className="w-2 h-2 rounded-full bg-sage-500" />
          <div className="w-12 h-[1px] bg-stone/60" />
        </motion.div>
      </div>
    </section>
  );
};
