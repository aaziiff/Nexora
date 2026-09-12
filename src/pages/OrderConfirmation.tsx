import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Package, Clock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { db } from '../lib/database';

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top immediately so confirmation is front and center
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Fire elegant minimal confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7C8D7B', '#141B17', '#D8D4CC', '#A2B3A1'],
      });
    } catch {
      // safe fallback
    }

    if (id) {
      db.getOrderById(id).then((found) => {
        setOrder(found);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-lg text-charcoal-700">Retrieving order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8 bg-ivory-100 p-8 sm:p-12 rounded-2xl border border-stone/30 shadow-lg"
      >
        <div className="w-16 h-16 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            Thank you for ordering with NEXORA
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-950">
            ORDER CONFIRMED.
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans max-w-md mx-auto">
            Your everyday essentials are being prepared for dispatch in our eco-friendly packaging.
          </p>
        </div>

        {order ? (
          <div className="space-y-4">
            {/* Order Snapshot Card */}
            <div className="bg-ivory-200/50 p-6 rounded-xl border border-stone/30 text-left space-y-4 text-xs text-charcoal-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-stone/30">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                    Order Number
                  </span>
                  <span className="font-mono font-semibold text-charcoal-900 text-sm">
                    {order.order_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                    Customer
                  </span>
                  <span className="font-medium text-charcoal-900 truncate block">
                    {order.customer.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                    Total Amount
                  </span>
                  <span className="font-semibold text-charcoal-900 text-sm font-mono">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                    Payment Method
                  </span>
                  <span className="font-medium text-charcoal-900 block">
                    {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Direct UPI'}
                  </span>
                  <span className="text-[10px] text-charcoal-500 font-sans block">
                    {order.payment_method === 'COD' ? '(Includes ₹29 COD fee)' : '(Zero handling fee)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage-700" />
                  <span>Estimated Arrival: <strong className="text-charcoal-900">{order.estimated_delivery || '2-4 business days'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-sage-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Direct Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded bg-ivory-200/50 text-xs text-charcoal-600">
            Order Reference: <strong className="font-mono text-charcoal-900">{id}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={order ? `/track-order?order=${order.order_number}&phone=${order.customer.phone}` : '/track-order'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs uppercase tracking-luxury font-semibold px-6 py-3.5 rounded transition-colors shadow-md"
          >
            <Package className="w-4 h-4" />
            <span>Track Live Dispatch</span>
          </Link>

          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sage-800 hover:bg-sage-900 text-ivory-100 text-xs uppercase tracking-luxury font-semibold px-6 py-3.5 rounded transition-colors shadow-md"
          >
            <span>View in Your Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-charcoal-900/30 text-charcoal-900 hover:bg-stone/20 text-xs uppercase tracking-luxury font-semibold px-6 py-3.5 rounded transition-colors"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>

        <p className="text-[11px] text-charcoal-500 pt-2">
          This order has been saved to your device. You can access live tracking, downloadable receipts, and reorders anytime from <Link to="/orders" className="text-sage-800 font-semibold hover:underline">Your Orders</Link>.
        </p>
      </motion.div>
    </div>
  );
};
