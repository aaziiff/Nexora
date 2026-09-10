import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Review } from '../../types';
import { db } from '../../lib/database';

export const SocialProofSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getReviews()
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleUpdate = () => {
      db.getReviews().then(setReviews);
    };
    window.addEventListener('nexora_reviews_updated', handleUpdate);
    return () => window.removeEventListener('nexora_reviews_updated', handleUpdate);
  }, []);

  if (loading) return null;

  // If no real reviews yet, show clean brand quality pledge
  if (reviews.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-ivory-200/40 border border-stone/30">
          <MessageSquare className="w-8 h-8 text-sage-600 mx-auto mb-3" />
          <h3 className="font-serif text-2xl text-charcoal-900 font-light">
            Crafted for Unhurried Living
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto mt-2 font-sans">
            Every product is dispatched with our personal quality guarantee. Experience our pieces in your home risk-free.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
          07 / Real Experiences
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
          VERIFIED WORDS
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 font-sans">
          Honest reflections from customers who have incorporated NEXORA pieces into their daily rituals.
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {reviews.slice(0, 3).map((rev, idx) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 sm:p-8 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-sage-700">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating ? 'fill-sage-600 text-sage-600' : 'text-stone'
                    }`}
                  />
                ))}
              </div>

              <h4 className="font-serif text-xl font-normal text-charcoal-950">
                “{rev.title}”
              </h4>

              <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
                {rev.comment}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone/20 flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-charcoal-900 block">{rev.customer_name}</span>
                {rev.location && (
                  <span className="text-[11px] text-charcoal-400 font-sans">{rev.location}</span>
                )}
              </div>

              {rev.verified_purchase && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-sage-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                  Verified
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
