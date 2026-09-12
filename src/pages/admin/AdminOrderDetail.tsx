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
  RotateCcw,
  Check,
  XCircle,
  Calendar,
  CreditCard,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderStatus } from '../../types';
import { db, getReturnEligibility } from '../../lib/database';
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

  // Return Management modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupCourier, setPickupCourier] = useState('Delhivery Reverse Logistics');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTxnId, setRefundTxnId] = useState('');

  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementCourier, setReplacementCourier] = useState('BlueDart Express');
  const [replacementTracking, setReplacementTracking] = useState('');

  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

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
    const targetStatus = order.order_status === 'ORDER PLACED' ? 'CONFIRMED' : order.order_status;
    const updated = await db.updateOrderStatus(
      order.id,
      targetStatus,
      undefined,
      'verified'
    );
    if (updated) {
      setOrder(updated);
      setPaymentStatus(updated.payment_status);
      setCurrentStatus(updated.order_status);
    }
    showToast('UPI Payment marked as VERIFIED and order confirmed.', 'success');
  };

  const handleSaveFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSaving(true);

    try {
      const updated = await db.updateOrderStatus(
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

      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
        setPaymentStatus(updated.payment_status);
        setCourierName(updated.courier_name || '');
        setTrackingNumber(updated.tracking_number || '');
        setTrackingUrl(updated.tracking_url || '');
        setEstimatedDelivery(updated.estimated_delivery || '2-4 business days');
      }
      showToast(`Order status updated to ${currentStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save order updates', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsSaving(true);
    setCurrentStatus(newStatus);

    try {
      const updated = await db.updateOrderStatus(
        order.id,
        newStatus,
        {
          courier_name: courierName.trim() || undefined,
          tracking_number: trackingNumber.trim() || undefined,
          tracking_url: trackingUrl.trim() || undefined,
          estimated_delivery: estimatedDelivery.trim() || undefined,
        },
        paymentStatus
      );

      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
        setPaymentStatus(updated.payment_status);
      }
      showToast(`Status successfully changed to ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsProcessingReturn(true);
    try {
      const updated = await db.processAdminReturnAction(order.id, 'approve', {
        pickup_date: pickupDate || new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        pickup_courier: pickupCourier,
      });
      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
      }
      showToast('Return request approved. Doorstep pickup scheduled.', 'success');
      setShowApproveModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve return', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleRejectReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for declining the return request.', 'error');
      return;
    }
    setIsProcessingReturn(true);
    try {
      const updated = await db.processAdminReturnAction(order.id, 'reject', {
        rejection_reason: rejectionReason.trim(),
      });
      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
      }
      showToast('Return request declined. Customer notified.', 'info');
      setShowRejectModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to decline return', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handlePickupReturn = async () => {
    if (!order) return;
    setIsProcessingReturn(true);
    try {
      const updated = await db.processAdminReturnAction(order.id, 'pickup');
      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
      }
      showToast('Package marked as picked up from customer doorstep.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update pickup status', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleRefundReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsProcessingReturn(true);
    try {
      const updated = await db.processAdminReturnAction(order.id, 'refund', {
        refund_transaction_id: refundTxnId.trim() || undefined,
      });
      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
      }
      showToast('Direct refund settled and recorded successfully.', 'success');
      setShowRefundModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete refund', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleReplaceReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsProcessingReturn(true);
    try {
      const updated = await db.processAdminReturnAction(order.id, 'replace', {
        replacement_courier: replacementCourier.trim() || undefined,
        replacement_tracking: replacementTracking.trim() || undefined,
      });
      if (updated) {
        setOrder(updated);
        setCurrentStatus(updated.order_status);
      }
      showToast('Fresh replacement unit marked as dispatched.', 'success');
      setShowReplacementModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch replacement', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
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

      {/* Return Eligibility / 7-Day Window Status Banner */}
      {(() => {
        const eligibility = getReturnEligibility(order);
        if (eligibility.eligible) {
          return (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-semibold block uppercase tracking-luxury text-[11px] text-emerald-900">
                    7-Day Customer Return Guarantee Active (Day {8 - eligibility.daysLeft} of 7)
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    Delivered on {eligibility.deliveredDate?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Eligible for return/replacement until {eligibility.expiryDate?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({eligibility.daysLeft} days remaining).
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-200/70 text-emerald-900 rounded font-semibold text-[10px] uppercase tracking-wider font-mono">
                {eligibility.daysLeft} Days Left
              </span>
            </div>
          );
        } else if (eligibility.isDelivered) {
          return (
            <div className="p-3.5 rounded-xl bg-stone/20 border border-stone/30 flex items-center justify-between text-xs text-charcoal-700">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-charcoal-500 shrink-0" />
                <span>
                  7-Day Return Guarantee Window closed on {eligibility.expiryDate?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}. Order is non-returnable.
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-charcoal-500 font-mono">
                Window Closed
              </span>
            </div>
          );
        }
        return null;
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Order Info, Return Requests & Items (Columns 1-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Return & Replacement Card */}
          {order.return_request && (
            <div className="bg-amber-50/50 p-6 rounded-xl border-2 border-amber-300 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-luxury text-amber-900 block">
                      Customer Return / Replacement Request
                    </span>
                    <h3 className="font-serif text-xl font-normal text-charcoal-950">
                      ID: {order.return_request.id}
                    </h3>
                  </div>
                </div>

                <span
                  className={`text-[11px] uppercase font-bold px-3 py-1 rounded-full shadow-sm ${
                    order.return_request.status === 'REQUESTED'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : order.return_request.status === 'APPROVED'
                      ? 'bg-emerald-600 text-white'
                      : order.return_request.status === 'PICKED_UP'
                      ? 'bg-purple-600 text-white'
                      : order.return_request.status === 'REFUNDED'
                      ? 'bg-teal-700 text-white'
                      : order.return_request.status === 'REPLACED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {order.return_request.status}
                </span>
              </div>

              {/* Request Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/70 p-3.5 rounded-lg border border-amber-200">
                <div>
                  <span className="text-[10px] uppercase text-charcoal-500 font-medium block">Requested On</span>
                  <span className="font-semibold text-charcoal-900">
                    {new Date(order.return_request.requested_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-charcoal-500 font-medium block">Resolution</span>
                  <span className="font-bold text-amber-950 font-mono">
                    {order.return_request.return_type === 'REPLACEMENT' ? '🔄 Free Replacement' : '💰 Direct Refund'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase text-charcoal-500 font-medium block">Primary Reason</span>
                  <span className="font-semibold text-charcoal-900">{order.return_request.reason}</span>
                </div>
              </div>

              {/* Customer Comments */}
              {order.return_request.comments && (
                <div className="text-xs space-y-1 bg-sand/30 p-3 rounded border border-amber-200/70">
                  <span className="text-[10px] uppercase font-bold text-charcoal-600 block">
                    Customer Problem Description:
                  </span>
                  <p className="text-charcoal-800 leading-relaxed italic">
                    "{order.return_request.comments}"
                  </p>
                </div>
              )}

              {/* Unboxing Proof Media */}
              {order.return_request.image_url && (
                <div className="text-xs space-y-1.5 bg-white/70 p-3 rounded border border-amber-200/70">
                  <span className="text-[10px] uppercase font-bold text-charcoal-600 block">
                    Customer Photo Proof:
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={order.return_request.image_url}
                      alt="Unboxing proof"
                      className="w-20 h-20 rounded object-cover border border-amber-300"
                    />
                    <a
                      href={order.return_request.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sage-800 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Resolution Photo</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Items Selected for Return */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-charcoal-600 block">
                  Items to Return / Replace ({order.return_request.items.length}):
                </span>
                <div className="divide-y divide-amber-200/70 bg-white/70 rounded border border-amber-200/70">
                  {order.return_request.items.map((retItem, idx) => {
                    const original = order.items.find((i) => i.product_id === retItem.product_id);
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {original?.image && (
                            <img
                              src={original.image}
                              alt={original.product_name}
                              className="w-10 h-10 rounded object-cover border border-stone/30"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-charcoal-950 block">
                              {original?.product_name || `Product ID: ${retItem.product_id}`}
                            </span>
                            <span className="text-charcoal-500 text-[11px]">
                              Returning Qty: <strong className="text-charcoal-900">{retItem.quantity}</strong>
                            </span>
                          </div>
                        </div>
                        {original && (
                          <span className="font-mono font-semibold text-charcoal-900">
                            ₹{(original.price * retItem.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Refund Payout Destination (if REFUND requested) */}
              {order.return_request.return_type === 'REFUND' && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold uppercase tracking-wider text-[11px]">
                    <CreditCard className="w-4 h-4" />
                    <span>Customer Refund Payout Destination</span>
                  </div>
                  {order.return_request.refund_upi_id ? (
                    <div className="space-y-0.5">
                      <span className="text-charcoal-500 text-[10px] block">UPI Virtual Payment Address</span>
                      <span className="font-mono text-sm font-bold text-charcoal-950 bg-white px-2.5 py-1 rounded border border-emerald-200 inline-block">
                        {order.return_request.refund_upi_id}
                      </span>
                    </div>
                  ) : order.return_request.refund_bank_details ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-emerald-200">
                      <div>
                        <span className="text-charcoal-400 block text-[9px] uppercase">Account Holder</span>
                        <strong className="text-charcoal-900">{order.return_request.refund_bank_details.account_holder_name}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[9px] uppercase">Bank Name</span>
                        <strong className="text-charcoal-900">{order.return_request.refund_bank_details.bank_name}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[9px] uppercase">Account Number</span>
                        <strong className="font-mono text-charcoal-900">{order.return_request.refund_bank_details.account_number}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[9px] uppercase">IFSC Code</span>
                        <strong className="font-mono text-charcoal-900">{order.return_request.refund_bank_details.ifsc_code}</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="text-charcoal-500 italic">No specific payout credentials attached.</span>
                  )}
                </div>
              )}

              {/* Logistics & Action Status Details */}
              {(order.return_request.pickup_scheduled_date || order.return_request.refund_transaction_id || order.return_request.replacement_tracking) && (
                <div className="p-3.5 bg-sand/30 rounded border border-amber-200 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-charcoal-700 block">
                    Reverse Logistics & Settlement Log
                  </span>
                  {order.return_request.pickup_scheduled_date && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-charcoal-600">Doorstep Pickup:</span>
                      <strong className="text-charcoal-950">
                        {order.return_request.pickup_scheduled_date} ({order.return_request.pickup_courier || 'Delhivery'})
                      </strong>
                    </div>
                  )}
                  {order.return_request.refund_transaction_id && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-charcoal-600">Refund Settlement Txn ID:</span>
                      <strong className="font-mono text-teal-800 font-bold">
                        {order.return_request.refund_transaction_id}
                      </strong>
                    </div>
                  )}
                  {order.return_request.replacement_tracking && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-charcoal-600">Replacement Courier & Tracking:</span>
                      <strong className="font-mono text-blue-800 font-bold">
                        {order.return_request.replacement_courier} - {order.return_request.replacement_tracking}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Note */}
              {order.return_request.rejection_reason && (
                <div className="p-3 bg-rose-50 rounded border border-rose-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">
                    Decline Reason Provided to Customer:
                  </span>
                  <p className="text-rose-900">{order.return_request.rejection_reason}</p>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {order.return_request.status === 'REQUESTED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowApproveModal(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-luxury py-2.5 px-4 rounded shadow transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Return & Schedule Pickup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 border border-rose-300 text-rose-700 hover:bg-rose-100/60 text-xs font-semibold uppercase tracking-luxury py-2.5 px-4 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {order.return_request.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handlePickupReturn}
                    disabled={isProcessingReturn}
                    className="w-full inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold uppercase tracking-luxury py-3 px-4 rounded shadow transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Confirm Item Picked Up From Customer Doorstep</span>
                  </button>
                )}

                {order.return_request.status === 'PICKED_UP' && (
                  <>
                    {order.return_request.return_type === 'REFUND' ? (
                      <button
                        type="button"
                        onClick={() => setShowRefundModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold uppercase tracking-luxury py-3 px-4 rounded shadow transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Issue Direct UPI / Bank Refund & Settle</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowReplacementModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold uppercase tracking-luxury py-3 px-4 rounded shadow transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>Dispatch Fresh Replacement Unit</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

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
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block">
                  Order Timeline Status
                </label>
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded ${
                    order.order_status === 'DELIVERED'
                      ? 'bg-sage-800 text-ivory-100'
                      : order.order_status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : order.order_status.startsWith('RETURN')
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone/30 text-charcoal-800'
                  }`}
                >
                  Current: {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Quick Status Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                {(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleQuickStatusChange(st)}
                    disabled={isSaving}
                    className={`py-1.5 px-2 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${
                      order.order_status === st
                        ? 'bg-charcoal-900 text-ivory-100 border-charcoal-900 shadow-sm'
                        : 'bg-ivory-50 hover:bg-stone/20 text-charcoal-700 border-stone/40'
                    }`}
                  >
                    {st === 'DELIVERED' ? '✓ Delivered' : st}
                  </button>
                ))}
              </div>

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
                <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                <option value="RETURN_PICKED_UP">RETURN_PICKED_UP</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="REPLACED">REPLACED</option>
                <option value="RETURN_REJECTED">RETURN_REJECTED</option>
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

      {/* Approve Return Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Approve Return Request
                </h3>
                <p className="text-xs text-charcoal-600">
                  Schedule a doorstep reverse-pickup for order <strong className="font-mono text-charcoal-900">{order.order_number}</strong>.
                </p>
              </div>

              <form onSubmit={handleApproveReturn} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Scheduled Pickup Date
                  </label>
                  <input
                    type="text"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    placeholder="e.g. Tomorrow, Sep 15, 2026 or 2:00 PM"
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Reverse Logistics Courier Partner
                  </label>
                  <input
                    type="text"
                    value={pickupCourier}
                    onChange={(e) => setPickupCourier(e.target.value)}
                    placeholder="e.g. Delhivery Reverse Logistics, BlueDart"
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone/20">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingReturn}
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                  >
                    {isProcessingReturn ? 'Scheduling...' : 'Confirm Approval & Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decline Return Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Decline Return Request
                </h3>
                <p className="text-xs text-charcoal-600">
                  Explain clearly why the return or replacement request is ineligible under Nexora policy.
                </p>
              </div>

              <form onSubmit={handleRejectReturn} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    placeholder="e.g. Item was altered / seal tampered / missing original accessories."
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone/20">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingReturn}
                    className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                  >
                    {isProcessingReturn ? 'Declining...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refund Settle Modal */}
      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Complete Direct Refund
                </h3>
                <p className="text-xs text-charcoal-600">
                  Record bank / UPI payout transaction for order <strong className="font-mono text-charcoal-900">{order.order_number}</strong>.
                </p>
              </div>

              <form onSubmit={handleRefundReturn} className="space-y-4 text-xs">
                {order.return_request?.refund_upi_id && (
                  <div className="p-3 bg-teal-50 rounded border border-teal-200">
                    <span className="text-[10px] text-teal-800 uppercase font-semibold block">Customer UPI Target:</span>
                    <span className="font-mono text-xs font-bold text-teal-950">{order.return_request.refund_upi_id}</span>
                  </div>
                )}

                {order.return_request?.refund_bank_details && (
                  <div className="p-3 bg-teal-50 rounded border border-teal-200 space-y-1">
                    <span className="text-[10px] text-teal-800 uppercase font-semibold block">Customer Bank Details:</span>
                    <div className="text-[11px] text-teal-950">
                      <div>A/C Holder: <strong>{order.return_request.refund_bank_details.account_holder_name}</strong></div>
                      <div>Bank: <strong>{order.return_request.refund_bank_details.bank_name}</strong></div>
                      <div className="font-mono">A/C: {order.return_request.refund_bank_details.account_number} | IFSC: {order.return_request.refund_bank_details.ifsc_code}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Bank / UPI Refund Reference UTR / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={refundTxnId}
                    onChange={(e) => setRefundTxnId(e.target.value)}
                    placeholder="e.g. REF-UPI-982103912049"
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone/20">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingReturn}
                    className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                  >
                    {isProcessingReturn ? 'Settling...' : 'Confirm Refund Paid'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Replacement Modal */}
      <AnimatePresence>
        {showReplacementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowReplacementModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Dispatch Replacement Unit
                </h3>
                <p className="text-xs text-charcoal-600">
                  Provide replacement shipment details for order <strong className="font-mono text-charcoal-900">{order.order_number}</strong>.
                </p>
              </div>

              <form onSubmit={handleReplaceReturn} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Courier Logistics Partner
                  </label>
                  <input
                    type="text"
                    value={replacementCourier}
                    onChange={(e) => setReplacementCourier(e.target.value)}
                    placeholder="e.g. BlueDart Express, Delhivery"
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal-800 block mb-1">
                    Replacement Tracking Number (AWB)
                  </label>
                  <input
                    type="text"
                    value={replacementTracking}
                    onChange={(e) => setReplacementTracking(e.target.value)}
                    placeholder="e.g. REP-892183921"
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone/20">
                  <button
                    type="button"
                    onClick={() => setShowReplacementModal(false)}
                    className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingReturn}
                    className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                  >
                    {isProcessingReturn ? 'Dispatching...' : 'Confirm Replacement Dispatched'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
