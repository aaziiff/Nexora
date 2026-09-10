import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, Compass, HeartHandshake } from 'lucide-react';

export const WhyNexoraSection: React.FC = () => {
  const principles = [
    {
      number: '01',
      title: 'THOUGHTFULLY CHOSEN',
      icon: Eye,
      description:
        'We test hundreds of items and only select the handful that genuinely elevate daily routines and solve micro-frictions.',
    },
    {
      number: '02',
      title: 'MADE FOR EVERYDAY',
      icon: Shield,
      description:
        'Objects built from honest, durable materials — diatomite stone, solid brass, and borosilicate glass that withstand frequent daily handling.',
    },
    {
      number: '03',
      title: 'SIMPLE BY DESIGN',
      icon: Compass,
      description:
        'Clean geometry, serene earth tones, and tactile ergonomics designed to bring visual calm and quiet order to modern spaces.',
    },
    {
      number: '04',
      title: 'VALUE THAT MATTERS',
      icon: HeartHandshake,
      description:
        'Direct-to-consumer curation without retail middlemen markups, delivering heirloom craftsmanship at accessible, honest prices.',
    },
  ];

  return (
    <section id="why-nexora" className="py-24 sm:py-32 bg-charcoal-950 text-ivory-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sage-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="text-[10px] uppercase tracking-luxury text-sage-400 font-semibold block">
            05 / Core Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-ivory-50 tracking-tight">
            MORE THAN JUST PRODUCTS.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-400 font-sans leading-relaxed font-light">
            We are not a generic marketplace or dropshipping outlet. Every piece in the NEXORA catalogue represents a considered standard.
          </p>
        </div>

        {/* 4 Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group p-6 rounded-xl bg-charcoal-900/60 border border-charcoal-800 hover:border-sage-500/40 hover:bg-charcoal-900 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-sage-400 font-medium">
                      {p.number}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-charcoal-800 text-sage-300 group-hover:text-ivory-100 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-light text-ivory-100 tracking-wide mb-3">
                    {p.title}
                  </h3>

                  <p className="text-xs text-charcoal-400 font-sans leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-charcoal-800/60">
                  <span className="text-[9px] uppercase tracking-luxury text-sage-500 font-semibold">
                    The NEXORA Standard
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
