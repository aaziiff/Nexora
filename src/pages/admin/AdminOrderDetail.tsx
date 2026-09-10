import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Save,
  Clock,
  ExternalLink,
  Package,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderStatus } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Form edit states
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('ORDER PLACED');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadOrder = () => {
    if (id) {
      db.getOrderById(id).then((found) => {
        if (found) {
          setOrder(found);
          setCurrentStatus(found.order_status);
          setPaymentStatus(found.payment_status);
          setCourierName(found.courier_name || '');
          setTrackingNumber(found.tracking_number || '');
          setTrackingUrl(found.tracking_url || '');
          setEstimatedDelivery(found.estimated_delivery || '2-4 business days');
        }
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleVerifyUpi = async () => {
    if (!order) return;
    await db.updateOrderStatus(
      order.id,
      order.order_status === 'ORDER PLACED' ? 'CONFIRMED' : order.order_status,
      undefined,
      'verified'
    );
    setPaymentStatus('verified');
    if (order.order_status === 'ORDER PLACED') setCurrentStatus('CONFIRMED');
    showToast('UPI Payment marked as VERIFIED and order confirmed.', 'success');
    loadOrder();
  };

  const handleSaveFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSaving(true);

    await db.updateOrderStatus(
      order.id,
      currentStatus,
      {
        courier_name: courierName.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
        tracking_url: trackingUrl.trim() || undefined,
        estimated_delivery: estimatedDelivery.trim() || undefined,
      },
      paymentStatus
    );

    setIsSaving(false);
    showToast('Order fulfillment details & timeline updated successfully.', 'success');
    loadOrder();
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal-600">Loading order file...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-charcoal-900">Order Not Located</h2>
        <Link
          to="/admin/orders"
          className="text-xs uppercase tracking-luxury font-semibold text-charcoal-800 underline"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const handleDeleteOrder = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      await db.deleteOrder(order.id);
      showToast(`Order ${order.order_number} and customer delivery information permanently deleted.`, 'success');
      navigate('/admin/orders');
    } catch (e) {
      showToast('Failed to delete order record.', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxury text-charcoal-500 hover:text-charcoal-900 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
              Order {order.order_number}
            </h1>
            <span className="text-xs font-mono bg-charcoal-900 text-ivory-100 px-2.5 py-1 rounded">
              {order.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 border border-rose-300 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs uppercase tracking-luxury font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Order</span>
          </button>

          <Link
            to={`/track-order?order=${order.order_number}&phone=${order.customer.phone}`}
            target="_blank"
            className="inline-flex items-center gap-2 border border-charcoal-900/40 text-charcoal-900 text-xs uppercase tracking-luxury font-semibold px-4 py-2.5 rounded hover:bg-stone/20 transition-colors"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Order Info & Items (Columns 1-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Card */}
          <div className="bg-ivory-100 p-6 rounded-xl border border-stone/30 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
              Customer & Delivery Address
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  Name
                </span>
                <span className="font-medium text-charcoal-950 text-sm">{order.customer.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  Phone
                </span>
                <span className="font-mono text-charcoal-950">{order.customer.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  Email
                </span>
                <span className="text-charcoal-900">{order.customer.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  PIN Code & City
                </span>
                <span className="font-medium text-charcoal-950">
                  {order.customer.pincode}, {order.customer.city} ({order.customer.state})
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  Full Street Address
                </span>
                <span className="text-charcoal-800">{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-ivory-100 p-6 rounded-xl border border-stone/30 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
              Ordered Items ({order.items.length})
            </h3>

            <div className="divide-y divide-stone/20 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-14 h-14 rounded object-cover border border-stone/30 shrink-0"
                    />
                    <div>
                      <h4 className="font-medium text-charcoal-950">{item.product_name}</h4>
                      <span className="text-charcoal-500">
                        ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-charcoal-950 font-mono">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone/30 space-y-2 text-xs text-charcoal-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-sage-800 font-semibold">{order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-charcoal-950 pt-2 border-t border-stone/20 font-mono">
                <span>Total Amount</span>
                <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment & Verification Card */}
          <div className="bg-ivory-100 p-6 rounded-xl border border-stone/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone/20">
              <h3 className="font-serif text-xl font-normal text-charcoal-950">
                Payment Verification
              </h3>
              <span
                className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded ${
                  paymentStatus === 'verified'
                    ? 'bg-sage-100 text-sage-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Method:</span>
                <span className="font-semibold text-charcoal-900">{order.payment_method}</span>
              </div>
              {order.upi_reference_id && (
                <div className="p-3 bg-sand/30 rounded border border-stone/40 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-500 block">
                    Customer Submitted UPI UTR / Transaction ID
                  </span>
                  <span className="font-mono text-sm font-bold text-charcoal-950">
                    {order.upi_reference_id}
                  </span>
                </div>
              )}
            </div>

            {order.payment_method === 'UPI' && paymentStatus === 'pending' && (
              <button
                onClick={handleVerifyUpi}
                className="w-full flex items-center justify-center gap-2 bg-sage-800 hover:bg-sage-700 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-3 rounded transition-colors shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify UPI Payment & Confirm Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Fulfillment & Tracking Controls (Columns 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSaveFulfillment} className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-5">
            <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-2 border-b border-stone/20">
              Fulfillment Controls
            </h3>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Order Timeline Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-semibold"
              >
                <option value="ORDER PLACED">ORDER PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="IN TRANSIT">IN TRANSIT</option>
                <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              >
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified & Settled</option>
                <option value="failed">Failed / Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Courier Logistics Partner
              </label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g. BlueDart Express, Delhivery, DTDC"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Tracking Number (AWB)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BD89201948IN"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Courier Tracking URL
              </label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://www.bluedart.com/tracking..."
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                placeholder="e.g. 2-3 business days"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-3.5 px-4 rounded transition-colors shadow"
            >
              <Save className="w-4 h-4" />
              <span>Update Order & Live Timeline</span>
            </button>
          </form>

          {/* Status History Log */}
          <div className="bg-ivory-100 p-6 rounded-xl border border-stone/30 shadow-sm space-y-3">
            <h4 className="font-serif text-lg font-normal text-charcoal-950 pb-2 border-b border-stone/20">
              Timeline History Log
            </h4>
            <div className="space-y-3 text-xs">
              {order.status_history.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sage-600 mt-1 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-charcoal-900 uppercase">{h.status}</strong>
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.note && <p className="text-charcoal-600 text-[11px]">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Delete Order & Delivery Info */}
          <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <h4 className="text-xs uppercase tracking-luxury font-semibold text-rose-900">
              Delivery Record Management
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed font-light">
              Permanently erase this completed delivery information and customer record from the database.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-luxury rounded transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete This Delivery Information</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Delete Order & Delivery Data?
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Are you sure you want to permanently delete order <strong className="font-mono text-charcoal-900">{order.order_number}</strong>? All customer delivery information ({order.customer.name}, {order.customer.address}, {order.customer.phone}) will be completely erased.
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  ⚠️ This action cannot be reversed.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
