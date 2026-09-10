import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setIsSubmitted(true);
    showToast('Welcome to NEXORA. We will keep you quietly updated.', 'success');
  };

  return (
    <section className="py-24 sm:py-32 bg-ivory-200/50 border-t border-stone/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-3"
        >
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            08 / Correspondence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900 tracking-tight">
            DISCOVER WHAT'S NEXT.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans font-light max-w-md mx-auto">
            New finds, useful ideas and everyday inspiration delivered once a month. No spam or noisy promotions.
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-ivory-100 border border-sage-400/40 inline-flex items-center gap-3 text-xs text-charcoal-800 font-medium"
          >
            <div className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>You are now subscribed to NEXORA editorial updates.</span>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full sm:flex-1 px-5 py-3.5 bg-ivory-100 border border-stone/60 rounded text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-charcoal-900 font-sans"
            />
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-6 py-3.5 rounded transition-all duration-300 group shrink-0"
            >
              <span>Join NEXORA</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.form>
        )}

        <p className="text-[10px] text-charcoal-400 uppercase tracking-widest pt-2">
          Strictly confidential • Unsubscribe at any time
        </p>
      </div>
    </section>
  );
};
