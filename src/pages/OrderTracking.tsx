import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  MapPin,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { db } from '../lib/database';
import { useToast } from '../context/ToastContext';

export const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('order') || '';
  const phoneParam = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(orderParam);
  const [phone, setPhone] = useState(phoneParam);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const STATUS_STEPS: OrderStatus[] = [
    'ORDER PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'IN TRANSIT',
    'OUT FOR DELIVERY',
    'DELIVERED',
  ];

  useEffect(() => {
    if (orderParam && phoneParam) {
      handleSearch(orderParam, phoneParam);
    } else if (orderParam) {
      // Direct lookup by ID/Order Number
      db.getOrderById(orderParam).then((res) => {
        if (res) {
          setFoundOrder(res);
          setHasSearched(true);
        }
      });
    }
  }, [orderParam, phoneParam]);

  const handleSearch = async (numToSearch = orderNumber, phoneToSearch = phone) => {
    if (!numToSearch.trim()) {
      showToast('Please enter your Order Reference Number (e.g. NX-89210)', 'error');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      let order: Order | null = null;
      if (phoneToSearch.trim()) {
        order = await db.getOrderByNumberAndPhone(numToSearch, phoneToSearch);
      } else {
        order = await db.getOrderById(numToSearch);
      }
      setFoundOrder(order);
      if (!order) {
        showToast('No matching order found. Please verify the order number.', 'error');
      }
    } catch {
      showToast('Unable to track order. Please check inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: OrderStatus, currentStatus: OrderStatus) => {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    const stepIndex = STATUS_STEPS.indexOf(step);

    if (currentStatus === 'CANCELLED') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
          Live Dispatch Timeline
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          TRACK YOUR ORDER
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans font-light">
          Enter your order reference number (received via email or SMS) to view verified courier movement.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-ivory-100 p-6 sm:p-8 rounded-2xl border border-stone/30 shadow-md mb-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4"
        >
          <div className="sm:col-span-6">
            <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. NX-89210"
              className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-900 uppercase"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs uppercase tracking-luxury font-semibold rounded transition-colors shadow"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ivory-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-stone/20 flex items-center justify-between text-[11px] text-charcoal-500">
          <span>Demo Tracking Reference: <strong className="font-mono text-charcoal-800">NX-89210</strong></span>
          <button
            type="button"
            onClick={() => {
              setOrderNumber('NX-89210');
              handleSearch('NX-89210', '');
            }}
            className="text-sage-800 hover:underline font-medium"
          >
            Load Demo Order
          </button>
        </div>
      </div>

      {/* Found Order Timeline Result */}
      {foundOrder ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Order Snapshot Card */}
          <div className="bg-ivory-100 p-6 sm:p-8 rounded-2xl border border-stone/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone/20 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
                  Current Status
                </span>
                <h3 className="font-serif text-3xl font-light text-charcoal-950 mt-0.5">
                  {foundOrder.order_status}
                </h3>
                <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                  Order placed on {new Date(foundOrder.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-ivory-200/60 border border-stone/30 space-y-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-charcoal-500">Estimated Arrival:</span>
                  <span className="font-semibold text-charcoal-900">{foundOrder.estimated_delivery || '2-4 business days'}</span>
                </div>
                {foundOrder.courier_name && (
                  <div className="flex justify-between gap-4">
                    <span className="text-charcoal-500">Courier Partner:</span>
                    <span className="font-medium text-charcoal-900">{foundOrder.courier_name}</span>
                  </div>
                )}
                {foundOrder.tracking_number && (
                  <div className="flex justify-between gap-4">
                    <span className="text-charcoal-500">AWB Number:</span>
                    <span className="font-mono text-charcoal-900">{foundOrder.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 7-Stage Visual Timeline */}
            <div className="py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {STATUS_STEPS.map((step, idx) => {
                  const status = getStepStatus(step, foundOrder.order_status);
                  return (
                    <div key={step} className="flex flex-col items-center text-center relative group">
                      {/* Step Bubble */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-all ${
                          status === 'completed'
                            ? 'bg-sage-700 text-ivory-100 shadow-sm'
                            : status === 'current'
                            ? 'bg-charcoal-900 text-ivory-100 ring-4 ring-sage-300'
                            : 'bg-stone/30 text-charcoal-400'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>0{idx + 1}</span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold leading-tight ${
                          status === 'current'
                            ? 'text-charcoal-950 font-bold'
                            : status === 'completed'
                            ? 'text-sage-800'
                            : 'text-charcoal-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Tracking Action Link if present */}
            {foundOrder.tracking_url && (
              <div className="pt-4 border-t border-stone/20 flex justify-end">
                <a
                  href={foundOrder.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 transition-colors"
                >
                  <span>Open Official Courier Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Activity Log / Status History */}
          <div className="bg-ivory-100 p-6 sm:p-8 rounded-2xl border border-stone/30 shadow-sm space-y-4">
            <h4 className="font-serif text-2xl font-light text-charcoal-950 pb-2 border-b border-stone/20">
              Verified Status Log
            </h4>
            <div className="space-y-4 pt-2">
              {foundOrder.status_history.map((hist, idx) => (
                <div key={idx} className="flex items-start gap-4 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sage-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-charcoal-900 uppercase tracking-wide">
                        {hist.status}
                      </span>
                      <span className="text-charcoal-400 text-[11px] font-mono">
                        {new Date(hist.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {hist.note && <p className="text-charcoal-600 mt-0.5">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : hasSearched && !loading ? (
        <div className="p-8 text-center bg-ivory-100 rounded-2xl border border-stone/30 space-y-3">
          <AlertCircle className="w-8 h-8 text-charcoal-400 mx-auto" />
          <h3 className="font-serif text-2xl text-charcoal-800">Order Not Located</h3>
          <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
            Please check that your order number matches the format <strong>NX-XXXXX</strong>. If you recently completed your purchase, dispatch updates will appear shortly.
          </p>
        </div>
      ) : null}
    </div>
  );
};
