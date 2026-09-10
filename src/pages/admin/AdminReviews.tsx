import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Trash2, Plus } from 'lucide-react';
import { Review } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadReviews = () => {
    db.getReviews().then((data) => {
      setReviews(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            Reputation Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            Customer Reviews ({reviews.length})
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 rounded-xl bg-ivory-100 border border-stone/30 text-center space-y-2">
          <p className="font-serif text-2xl text-charcoal-800">No customer reviews yet</p>
          <p className="text-xs text-charcoal-500">
            Verified reflections submitted by customers will be managed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
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
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-mono">
                    Product: {rev.product_id}
                  </span>
                </div>

                <h4 className="font-serif text-xl font-normal text-charcoal-950">
                  “{rev.title}”
                </h4>

                <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone/20 flex items-center justify-between text-xs text-charcoal-500">
                <div>
                  <span className="font-semibold text-charcoal-900 block">{rev.customer_name}</span>
                  <span>{rev.location || 'India'}</span>
                </div>
                <span className="text-[11px] font-mono">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
