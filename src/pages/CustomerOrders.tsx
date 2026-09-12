import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  Receipt,
  RotateCcw,
  HelpCircle,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Printer,
  X,
  Phone,
  Mail,
  AlertCircle,
  CornerUpLeft,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Order, OrderStatus, ReturnRequest, ReturnType, ReturnRequestItem } from '../types';
import { db, getReturnEligibility, ReturnEligibility } from '../lib/database';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../lib/clipboard';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered' | 'returns' | 'upi' | 'cod'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Lookup states
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showLookupBox, setShowLookupBox] = useState(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Return Request Modal State
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<ReturnType>('replacement');
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: { selected: boolean; quantity: number } }>({});
  const [returnReason, setReturnReason] = useState<string>('Damaged in transit');
  const [customReason, setCustomReason] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [refundUpiId, setRefundUpiId] = useState<string>('');
  const [bankHolderName, setBankHolderName] = useState<string>('');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankIfscCode, setBankIfscCode] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [returnComments, setReturnComments] = useState<string>('');
  const [returnImageUrl, setReturnImageUrl] = useState<string>('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  const fetchOrders = async (phoneOrEmailQuery?: { phone?: string; email?: string }) => {
    setLoading(true);
    try {
      // Check saved phone or email if not explicitly queried
      const savedPhone = phoneOrEmailQuery?.phone || localStorage.getItem('nexora_customer_phone') || '';
      const savedEmail = phoneOrEmailQuery?.email || localStorage.getItem('nexora_customer_email') || '';

      let results: Order[] = [];
      if (phoneOrEmailQuery?.phone || phoneOrEmailQuery?.email) {
        results = await db.getCustomerOrders(phoneOrEmailQuery);
      } else if (savedPhone || savedEmail) {
        results = await db.getCustomerOrders({ phone: savedPhone, email: savedEmail });
      } else {
        results = await db.getCustomerOrders();
      }

      setOrders(results);
    } catch (err) {
      console.error(err);
      showToast('Could not retrieve orders. Showing available records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener('nexora_orders_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchOrders();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('nexora_orders_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleCopyOrderNumber = async (orderNumber: string) => {
    await copyToClipboard(orderNumber);
    setCopiedId(orderNumber);
    showToast(`Order reference ${orderNumber} copied!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim() && !lookupEmail.trim()) {
      showToast('Please enter your mobile number or email address', 'error');
      return;
    }
    setIsLookingUp(true);
    await fetchOrders({ phone: lookupPhone, email: lookupEmail });
    setIsLookingUp(false);
    showToast('Orders search refreshed!', 'success');
  };

  const handleReorder = async (order: Order) => {
    try {
      const allProducts = await db.getProducts();
      let addedCount = 0;

      for (const item of order.items) {
        const fullProduct = allProducts.find(p => p.id === item.product_id || p.name === item.product_name);
        if (fullProduct) {
          addToCart(fullProduct, item.quantity);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        showToast(`Added ${addedCount} item(s) from ${order.order_number} to your bag!`, 'success');
        setIsCartOpen(true);
      } else {
        showToast('Items from this order are being updated.', 'info');
      }
    } catch {
      showToast('Failed to reorder items.', 'error');
    }
  };

  const openReturnModal = (order: Order) => {
    const eligibility = getReturnEligibility(order);
    if (!eligibility.isEligible && !eligibility.hasExistingReturn) {
      showToast(eligibility.message || 'Return window has closed.', 'error');
      return;
    }

    setReturnModalOrder(order);
    setReturnType('replacement');
    const initialItems: { [productId: string]: { selected: boolean; quantity: number } } = {};
    order.items.forEach(item => {
      initialItems[item.product_id] = { selected: true, quantity: item.quantity };
    });
    setSelectedItems(initialItems);
    setReturnReason('Damaged in transit');
    setCustomReason('');
    setRefundMethod('UPI');
    setRefundUpiId(order.upi_reference_id || '');
    setBankHolderName(order.customer.name || '');
    setBankAccountNumber('');
    setBankIfscCode('');
    setBankName('');
    setReturnComments('');
    setReturnImageUrl('');
  };

  const handleToggleItem = (productId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId]?.selected,
      }
    }));
  };

  const handleQuantityChange = (productId: string, qty: number, maxQty: number) => {
    const clamped = Math.max(1, Math.min(qty, maxQty));
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: clamped,
      }
    }));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    const selectedList: ReturnRequestItem[] = [];
    returnModalOrder.items.forEach(item => {
      const state = selectedItems[item.product_id];
      if (state?.selected) {
        selectedList.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: state.quantity,
          price: item.price,
          image: item.image,
        });
      }
    });

    if (selectedList.length === 0) {
      showToast('Please select at least one item to return.', 'error');
      return;
    }

    if (returnReason === 'Other / Custom reason' && !customReason.trim()) {
      showToast('Please describe your specific return reason.', 'error');
      return;
    }

    if (returnType === 'refund') {
      if (refundMethod === 'UPI' && !refundUpiId.trim()) {
        showToast('Please provide your UPI ID for the refund transfer.', 'error');
        return;
      }
      if (refundMethod === 'BANK_TRANSFER') {
        if (!bankHolderName.trim() || !bankAccountNumber.trim() || !bankIfscCode.trim()) {
          showToast('Please enter complete bank details (Holder name, Account #, IFSC).', 'error');
          return;
        }
      }
    }

    setIsSubmittingReturn(true);
    try {
      const returnPayload: Omit<ReturnRequest, 'request_id' | 'requested_at'> = {
        return_type: returnType,
        reason: returnReason === 'Other / Custom reason' ? `Other: ${customReason}` : returnReason,
        custom_reason: customReason.trim() || undefined,
        items: selectedList,
        refund_method: returnType === 'refund' ? refundMethod : undefined,
        refund_upi_id: returnType === 'refund' && refundMethod === 'UPI' ? refundUpiId.trim() : undefined,
        refund_bank_details: returnType === 'refund' && refundMethod === 'BANK_TRANSFER' ? {
          account_holder_name: bankHolderName.trim(),
          account_number: bankAccountNumber.trim(),
          ifsc_code: bankIfscCode.trim().toUpperCase(),
          bank_name: bankName.trim() || undefined,
        } : undefined,
        comments: returnComments.trim() || undefined,
        images: returnImageUrl.trim() ? [returnImageUrl.trim()] : undefined,
      };

      await db.submitReturnRequest(returnModalOrder.id, returnPayload);
      showToast('Return request submitted! Our concierge will review it within 24 hours.', 'success');
      setReturnModalOrder(null);
      await fetchOrders();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit return request.', 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // Tab filtering
    if (activeTab === 'active') {
      const activeStatuses: OrderStatus[] = ['ORDER PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN TRANSIT', 'OUT FOR DELIVERY'];
      if (!activeStatuses.includes(order.order_status)) return false;
    } else if (activeTab === 'delivered') {
      if (order.order_status !== 'DELIVERED') return false;
    } else if (activeTab === 'returns') {
      const returnStatuses: OrderStatus[] = [
        'RETURN_REQUESTED',
        'RETURN_APPROVED',
        'RETURN_REJECTED',
        'RETURN_PICKED_UP',
        'REFUNDED',
        'REPLACED',
      ];
      if (!returnStatuses.includes(order.order_status) && !order.return_request) return false;
    } else if (activeTab === 'upi') {
      if (order.payment_method !== 'UPI') return false;
    } else if (activeTab === 'cod') {
      if (order.payment_method !== 'COD') return false;
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.order_number.toLowerCase().includes(q);
      const matchCustomer = order.customer.name.toLowerCase().includes(q) || order.customer.city.toLowerCase().includes(q);
      const matchItem = order.items.some(i => i.product_name.toLowerCase().includes(q));
      const matchStatus = order.order_status.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchItem || matchStatus;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Return Under Review</span>
          </span>
        );
      case 'RETURN_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Return Approved</span>
          </span>
        );
      case 'RETURN_PICKED_UP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-100 text-purple-900 border border-purple-200 shadow-sm">
            <Truck className="w-3 h-3 text-purple-700" />
            <span>Return Picked Up</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-teal-100 text-teal-900 border border-teal-300 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-teal-700" />
            <span>Refund Completed</span>
          </span>
        );
      case 'REPLACED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-sage-800 text-ivory-100 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-sage-200" />
            <span>Replacement Dispatched</span>
          </span>
        );
      case 'RETURN_REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Return Declined</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-sage-800 text-ivory-100 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'OUT FOR DELIVERY':
      case 'IN TRANSIT':
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-sage-200 text-charcoal-950 border border-sage-400/60">
            <span className="w-2 h-2 rounded-full bg-sage-700 animate-pulse" />
            <Truck className="w-3 h-3 text-sage-800" />
            <span>{status}</span>
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-sand/60 text-charcoal-900 border border-stone/50">
            <Clock className="w-3 h-3 text-charcoal-700" />
            <span>{status}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-stone/40 text-charcoal-600">
            <span>Cancelled</span>
          </span>
        );
      case 'ORDER PLACED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-ivory-200 text-charcoal-800 border border-stone/40">
            <Package className="w-3 h-3 text-charcoal-600" />
            <span>Order Placed</span>
          </span>
        );
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-stone/30 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold">
              Customer Account & Purchases
            </span>
            <span className="text-charcoal-300">•</span>
            <span className="text-[10px] text-charcoal-500 font-mono">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-950">
            YOUR ORDERS
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl font-sans font-light">
            View verified tracking updates, courier dispatch receipts, invoice summaries, and reorder your favourite everyday essentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLookupBox(!showLookupBox)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-charcoal-900/20 hover:border-charcoal-900 bg-ivory-50 text-xs font-semibold uppercase tracking-luxury text-charcoal-900 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-sage-800" />
            <span>{showLookupBox ? 'Hide Phone Lookup' : 'Find by Phone / Email'}</span>
          </button>
          
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury transition-colors shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>

      {/* Lookup Collapsible Box */}
      <AnimatePresence>
        {showLookupBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8 pt-6"
          >
            <div className="bg-ivory-200/80 p-6 rounded-2xl border border-stone/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sage-800" />
                  <h3 className="font-serif text-xl font-normal text-charcoal-950">
                    Find Orders on Another Device
                  </h3>
                </div>
                <button
                  onClick={() => setShowLookupBox(false)}
                  className="text-charcoal-500 hover:text-charcoal-900 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-charcoal-600 font-light max-w-2xl">
                Enter the mobile number or email you used at checkout. We will instantly pull all matching orders from our secure database.
              </p>

              <form onSubmit={handleLookupSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-5">
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3.5 top-3 text-charcoal-400" />
                    <input
                      type="tel"
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2.5 bg-ivory-50 border border-stone/50 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3.5 top-3 text-charcoal-400" />
                    <input
                      type="email"
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="Email address (e.g. name@domain.com)"
                      className="w-full pl-9 pr-3 py-2.5 bg-ivory-50 border border-stone/50 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="w-full h-full min-h-[38px] flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs uppercase tracking-luxury font-semibold rounded-lg transition-colors"
                  >
                    {isLookingUp ? (
                      <span className="w-3.5 h-3.5 border-2 border-ivory-100 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Search</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Toolbar */}
      <div className="my-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Transit / Active' },
            { id: 'delivered', label: 'Delivered' },
            {
              id: 'returns',
              label: `Returns & Replacements (${
                orders.filter(
                  (o) =>
                    o.order_status.startsWith('RETURN') ||
                    o.order_status === 'REFUNDED' ||
                    o.order_status === 'REPLACED' ||
                    Boolean(o.return_request)
                ).length
              })`,
            },
            { id: 'upi', label: 'UPI Orders' },
            { id: 'cod', label: 'COD Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal-900 text-ivory-100 shadow-sm'
                  : 'bg-ivory-200/70 text-charcoal-700 hover:bg-stone/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, product, city..."
            className="w-full pl-8 pr-3 py-2 bg-ivory-100 border border-stone/40 rounded-lg text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-charcoal-900"
          />
        </div>
      </div>

      {/* Order List */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-sage-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-charcoal-700">Loading your orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const eligibility = getReturnEligibility(order);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ivory-100 rounded-2xl border border-stone/30 shadow-sm overflow-hidden hover:border-stone/60 transition-all"
              >
                {/* Card Header Bar */}
                <div className="p-5 sm:p-6 bg-ivory-200/50 border-b border-stone/20 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                        Order Reference
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-sm text-charcoal-950">
                          {order.order_number}
                        </span>
                        <button
                          onClick={() => handleCopyOrderNumber(order.order_number)}
                          className="p-1 hover:bg-stone/30 rounded text-charcoal-500 hover:text-charcoal-900 transition-colors"
                          title="Copy order number"
                        >
                          {copiedId === order.order_number ? (
                            <Check className="w-3.5 h-3.5 text-sage-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="hidden sm:block w-[1px] h-8 bg-stone/30" />

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                        Date Placed
                      </span>
                      <span className="text-xs font-medium text-charcoal-800 mt-0.5 block">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="hidden sm:block w-[1px] h-8 bg-stone/30" />

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                        Total Amount
                      </span>
                      <span className="text-xs font-bold text-charcoal-950 mt-0.5 block font-mono">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="hidden sm:block w-[1px] h-8 bg-stone/30" />

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                        Payment
                      </span>
                      <span className="text-xs font-medium text-charcoal-800 mt-0.5 block">
                        {order.payment_method === 'UPI' ? 'Direct UPI' : 'Cash on Delivery'}
                        <span className="ml-1 text-[10px] text-sage-800 font-semibold">
                          ({order.payment_status})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>{getStatusBadge(order.order_status)}</div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Items Mini List (Columns 1-8) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="divide-y divide-stone/20">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-14 h-14 object-cover rounded-lg border border-stone/30 shrink-0 bg-ivory-50"
                            />
                            <div>
                              <h4 className="font-serif text-sm sm:text-base text-charcoal-900 font-medium line-clamp-1">
                                {item.product_name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                <span>•</span>
                                <span>₹{item.price.toLocaleString('en-IN')} each</span>
                              </div>
                            </div>
                          </div>

                          <span className="font-mono font-semibold text-xs text-charcoal-900 shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Destination Snippet */}
                    <div className="pt-2 flex items-center gap-2 text-xs text-charcoal-500">
                      <MapPin className="w-3.5 h-3.5 text-sage-800 shrink-0" />
                      <span className="truncate">
                        Shipping to <strong>{order.customer.name}</strong> • {order.customer.city}, {order.customer.state} ({order.customer.pincode})
                      </span>
                    </div>

                    {/* Courier & AWB Banner if assigned */}
                    {order.courier_name && (
                      <div className="p-3 bg-ivory-200/60 rounded-xl border border-stone/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-sage-800" />
                          <span>
                            Courier: <strong className="text-charcoal-900">{order.courier_name}</strong>
                            {order.tracking_number && (
                              <span className="ml-2 font-mono text-charcoal-700">AWB: {order.tracking_number}</span>
                            )}
                          </span>
                        </div>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-800 hover:underline uppercase tracking-wider"
                          >
                            <span>Courier Tracking Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* 7-Day Return Guarantee Active Banner */}
                    {eligibility.isEligible && (
                      <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0" />
                          <span className="text-amber-950 font-medium">
                            7-Day Replacement & Return Guarantee Active: <strong className="font-semibold">{eligibility.daysLeft} day{eligibility.daysLeft === 1 ? '' : 's'} left</strong> (until {eligibility.expiryDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openReturnModal(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-ivory-100 text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Request Return / Replace</span>
                        </button>
                      </div>
                    )}

                    {/* Return Window Closed Banner */}
                    {order.order_status === 'DELIVERED' && !eligibility.isEligible && !eligibility.hasExistingReturn && (
                      <div className="p-2.5 bg-ivory-200/50 rounded-xl border border-stone/20 flex items-center gap-2 text-[11px] text-charcoal-500">
                        <Info className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                        <span>7-day replacement and return policy ended on {eligibility.expiryDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.</span>
                      </div>
                    )}

                    {/* Return Request Summary Card if exists */}
                    {order.return_request && (
                      <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
                            <span className="font-semibold text-charcoal-950 uppercase tracking-wider text-[11px]">
                              {order.return_request.return_type === 'replacement' ? 'Free Replacement Request' : 'Refund Request'}
                            </span>
                          </div>
                          <span className="text-[10px] text-charcoal-500">
                            Submitted on {new Date(order.return_request.requested_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-charcoal-700 pt-1">
                          <div><span className="text-charcoal-500">Reason:</span> <strong>{order.return_request.reason}</strong></div>
                          {order.return_request.refund_method && (
                            <div>
                              <span className="text-charcoal-500">Refund Target:</span>{' '}
                              <strong>
                                {order.return_request.refund_method === 'UPI'
                                  ? `UPI (${order.return_request.refund_upi_id})`
                                  : `Bank A/C (${order.return_request.refund_bank_details?.account_number})`}
                              </strong>
                            </div>
                          )}
                          {order.return_request.pickup_date && (
                            <div className="sm:col-span-2 text-sage-800 font-medium">
                              🚚 Pickup Scheduled: <strong>{order.return_request.pickup_date}</strong>{' '}
                              {order.return_request.pickup_courier ? `via ${order.return_request.pickup_courier}` : ''}
                            </div>
                          )}
                          {order.return_request.admin_notes && (
                            <div className="sm:col-span-2 text-charcoal-700 bg-ivory-50 p-2 rounded border border-stone/20">
                              <strong>Concierge Note:</strong> {order.return_request.admin_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Action Column (Columns 9-12) */}
                  <div className="lg:col-span-4 flex flex-col gap-2.5 pt-4 lg:pt-0 lg:border-l lg:border-stone/20 lg:pl-6">
                    <Link
                      to={`/track-order?order=${order.order_number}&phone=${order.customer.phone}`}
                      className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-3 px-4 rounded-lg transition-colors shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Live Dispatch</span>
                    </Link>

                    {/* Request Return Button if Eligible */}
                    {eligibility.isEligible && (
                      <button
                        onClick={() => openReturnModal(order)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-2.5 px-3 rounded-lg transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return / Replace ({eligibility.daysLeft}d Left)</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="flex items-center justify-center gap-1.5 border border-stone/50 hover:bg-stone/20 text-charcoal-900 text-xs font-medium uppercase tracking-wider py-2.5 px-3 rounded-lg transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-charcoal-600" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center justify-center gap-1.5 border border-stone/50 hover:bg-stone/20 text-charcoal-900 text-xs font-medium uppercase tracking-wider py-2.5 px-3 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-charcoal-600" />
                        <span>Buy Again</span>
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hello NEXORA Concierge, I have an inquiry regarding my order ${order.order_number}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-500 hover:text-sage-800 transition-colors py-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Need Help with this Order?</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 bg-ivory-100 rounded-2xl border border-stone/30 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-ivory-200 text-charcoal-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-3xl font-light text-charcoal-950">
              No Orders Found
            </h3>
            <p className="text-xs text-charcoal-600 font-light max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching with a different term.`
                : "You haven't placed any orders yet on this device, or your previous orders are registered under a different phone number."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowLookupBox(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-charcoal-900/40 text-charcoal-900 hover:bg-stone/20 text-xs uppercase tracking-luxury font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Lookup by Mobile / Email</span>
            </button>

            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs uppercase tracking-luxury font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Curated Catalog</span>
            </Link>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <AnimatePresence>
        {receiptOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            >
              {/* Receipt Top Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-stone/30">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-sage-800" />
                  <span className="font-serif text-2xl font-light text-charcoal-950">
                    Official Tax Invoice & Receipt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-charcoal-700 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReceiptOrder(null)}
                    className="p-2 text-charcoal-700 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Brand & Invoice Meta */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="font-serif text-xl tracking-widest font-bold text-charcoal-950">NEXORA</h4>
                  <p className="text-charcoal-500 mt-1">Small things. Better everyday.</p>
                  <p className="text-charcoal-500">concierge@nexoralife.com</p>
                </div>
                <div className="text-right space-y-1">
                  <p><strong className="text-charcoal-900">Invoice Ref:</strong> <span className="font-mono">{receiptOrder.order_number}</span></p>
                  <p><strong className="text-charcoal-900">Date:</strong> {new Date(receiptOrder.created_at).toLocaleDateString('en-IN')}</p>
                  <p><strong className="text-charcoal-900">Status:</strong> <span className="uppercase text-sage-800 font-semibold">{receiptOrder.order_status}</span></p>
                </div>
              </div>

              {/* Billed To Address */}
              <div className="p-4 bg-ivory-100 rounded-xl border border-stone/30 text-xs space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                  Billed & Shipped To:
                </span>
                <p className="font-semibold text-charcoal-950">{receiptOrder.customer.name}</p>
                <p className="text-charcoal-600">{receiptOrder.customer.address}</p>
                <p className="text-charcoal-600">{receiptOrder.customer.city}, {receiptOrder.customer.state} - {receiptOrder.customer.pincode}</p>
                <p className="text-charcoal-600">Mobile: {receiptOrder.customer.phone} • Email: {receiptOrder.customer.email}</p>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone/30 text-charcoal-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2 font-medium">Item Description</th>
                    <th className="py-2 text-center font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Price</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/20">
                  {receiptOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium text-charcoal-900">{item.product_name}</td>
                      <td className="py-3 text-center text-charcoal-700">{item.quantity}</td>
                      <td className="py-3 text-right font-mono text-charcoal-700">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono font-semibold text-charcoal-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="pt-4 border-t border-stone/30 space-y-2 text-xs text-charcoal-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{receiptOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-sage-800">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone/30 font-bold text-sm text-charcoal-950">
                  <span>Total Paid</span>
                  <span className="font-mono font-serif text-lg">₹{receiptOrder.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {receiptOrder.upi_reference_id && (
                <div className="p-3 bg-sand/30 rounded-lg text-xs text-charcoal-700">
                  <span>Verified UPI UTR: <strong className="font-mono text-charcoal-950">{receiptOrder.upi_reference_id}</strong></span>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setReceiptOrder(null)}
                  className="px-6 py-2.5 bg-charcoal-900 text-ivory-100 text-xs uppercase tracking-luxury font-semibold rounded-lg hover:bg-charcoal-950 transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return & Replacement Request Modal */}
      <AnimatePresence>
        {returnModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                    <RotateCcw className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-charcoal-950">
                      Request Return / Replacement
                    </h3>
                    <p className="text-[11px] text-charcoal-500">
                      Order Reference: <span className="font-mono font-semibold text-charcoal-900">{returnModalOrder.order_number}</span> • 7-Day Guarantee
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="p-2 text-charcoal-500 hover:text-charcoal-900 hover:bg-stone/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReturn} className="space-y-6">
                {/* 1. Item Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block">
                      1. Select Items to Return / Replace *
                    </label>
                    <span className="text-[11px] text-charcoal-500">
                      Choose items & quantities
                    </span>
                  </div>

                  <div className="bg-ivory-100 p-3 rounded-xl border border-stone/30 divide-y divide-stone/20 space-y-2">
                    {returnModalOrder.items.map((item) => {
                      const itemState = selectedItems[item.product_id] || { selected: false, quantity: item.quantity };

                      return (
                        <div key={item.product_id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleItem(item.product_id)}
                              className="text-sage-800 hover:text-sage-900 p-0.5"
                            >
                              {itemState.selected ? (
                                <CheckSquare className="w-4 h-4 text-amber-800" />
                              ) : (
                                <Square className="w-4 h-4 text-charcoal-400" />
                              )}
                            </button>
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-10 h-10 object-cover rounded-lg border border-stone/30 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-medium text-charcoal-900 truncate">{item.product_name}</p>
                              <span className="text-[11px] text-charcoal-500 font-mono">₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {itemState.selected && (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-charcoal-500 uppercase">Qty:</span>
                              <div className="flex items-center border border-stone/40 rounded bg-ivory-50">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.product_id, itemState.quantity - 1, item.quantity)}
                                  className="px-2 py-0.5 text-xs text-charcoal-700 hover:bg-stone/20"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-semibold text-charcoal-950 font-mono">
                                  {itemState.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.product_id, itemState.quantity + 1, item.quantity)}
                                  className="px-2 py-0.5 text-xs text-charcoal-700 hover:bg-stone/20"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Choose Resolution: Replacement vs Refund */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block">
                    2. Resolution Preference *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        returnType === 'replacement'
                          ? 'border-amber-800 bg-amber-500/10 shadow-sm'
                          : 'border-stone/40 bg-ivory-100 hover:bg-sand/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnType"
                        value="replacement"
                        checked={returnType === 'replacement'}
                        onChange={() => setReturnType('replacement')}
                        className="mt-0.5 text-amber-800"
                      />
                      <div>
                        <span className="font-semibold text-xs text-charcoal-950 block">
                          Free Replacement
                        </span>
                        <p className="text-[11px] text-charcoal-600 mt-0.5">
                          We dispatch a brand-new unit to your address at ₹0 extra fee.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        returnType === 'refund'
                          ? 'border-amber-800 bg-amber-500/10 shadow-sm'
                          : 'border-stone/40 bg-ivory-100 hover:bg-sand/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnType"
                        value="refund"
                        checked={returnType === 'refund'}
                        onChange={() => setReturnType('refund')}
                        className="mt-0.5 text-amber-800"
                      />
                      <div>
                        <span className="font-semibold text-xs text-charcoal-950 block">
                          Refund Payout
                        </span>
                        <p className="text-[11px] text-charcoal-600 mt-0.5">
                          Amount transferred directly back to your UPI or Bank Account.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Reason Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block">
                    3. Reason for Return / Replacement *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                  >
                    <option value="Damaged in transit">Damaged in courier transit</option>
                    <option value="Defective / Not functioning">Defective / Not functioning properly</option>
                    <option value="Wrong item or size received">Received wrong item or size</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Missing accessories or parts">Missing parts or accessories</option>
                    <option value="Other / Custom reason">Other / Custom reason</option>
                  </select>

                  {returnReason === 'Other / Custom reason' && (
                    <input
                      type="text"
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please specify why you are returning..."
                      className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/50 rounded-lg text-xs text-charcoal-900 mt-2 focus:outline-none focus:border-charcoal-900"
                    />
                  )}
                </div>

                {/* 4. Refund Payout Details if Refund Selected */}
                {returnType === 'refund' && (
                  <div className="p-4 bg-ivory-100 rounded-xl border border-stone/30 space-y-4 animate-fade-in">
                    <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block">
                      4. Refund Payout Details *
                    </label>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                        <input
                          type="radio"
                          name="refundMethod"
                          value="UPI"
                          checked={refundMethod === 'UPI'}
                          onChange={() => setRefundMethod('UPI')}
                          className="text-amber-800"
                        />
                        <span>Direct UPI (Fastest)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-800">
                        <input
                          type="radio"
                          name="refundMethod"
                          value="BANK_TRANSFER"
                          checked={refundMethod === 'BANK_TRANSFER'}
                          onChange={() => setRefundMethod('BANK_TRANSFER')}
                          className="text-amber-800"
                        />
                        <span>Bank NEFT / IMPS</span>
                      </label>
                    </div>

                    {refundMethod === 'UPI' ? (
                      <div>
                        <label className="text-[11px] text-charcoal-700 block mb-1 font-medium">
                          Your UPI ID for Refund Transfer *
                        </label>
                        <input
                          type="text"
                          required
                          value={refundUpiId}
                          onChange={(e) => setRefundUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/50 rounded-lg text-xs font-mono text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-charcoal-700 block mb-1">Account Holder Name *</label>
                          <input
                            type="text"
                            required
                            value={bankHolderName}
                            onChange={(e) => setBankHolderName(e.target.value)}
                            placeholder="Full name as in bank passbook"
                            className="w-full px-3 py-2 bg-ivory-50 border border-stone/50 rounded text-xs text-charcoal-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-charcoal-700 block mb-1">Account Number *</label>
                          <input
                            type="text"
                            required
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            placeholder="Bank Account Number"
                            className="w-full px-3 py-2 bg-ivory-50 border border-stone/50 rounded text-xs font-mono text-charcoal-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-charcoal-700 block mb-1">IFSC Code *</label>
                          <input
                            type="text"
                            required
                            value={bankIfscCode}
                            onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                            placeholder="e.g. HDFC0001234"
                            className="w-full px-3 py-2 bg-ivory-50 border border-stone/50 rounded text-xs font-mono uppercase text-charcoal-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-charcoal-700 block mb-1">Bank Name (Optional)</label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. HDFC Bank"
                            className="w-full px-3 py-2 bg-ivory-50 border border-stone/50 rounded text-xs text-charcoal-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Additional Comments & Photo URL */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block mb-1">
                      Additional Comments / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={returnComments}
                      onChange={(e) => setReturnComments(e.target.value)}
                      placeholder="Describe any specific defect or notes for our concierge team..."
                      className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-luxury text-charcoal-900 block mb-1">
                      Unboxing Photo / Image Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={returnImageUrl}
                      onChange={(e) => setReturnImageUrl(e.target.value)}
                      placeholder="https://... (photo link of defect or package)"
                      className="w-full px-3.5 py-2.5 bg-ivory-100 border border-stone/50 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                    />
                  </div>
                </div>

                {/* Assurance notice */}
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-charcoal-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    Our concierge team reviews all 7-day guarantee requests within 24 hours. Courier pickup is scheduled at your doorstep.
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone/30">
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(null)}
                    className="px-5 py-2.5 border border-stone/40 text-charcoal-800 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="px-6 py-2.5 bg-amber-900 hover:bg-amber-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury rounded-lg transition-colors shadow-md flex items-center gap-2"
                  >
                    {isSubmittingReturn ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-ivory-100 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Submit Return Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
