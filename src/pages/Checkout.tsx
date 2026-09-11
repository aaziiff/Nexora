import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  ExternalLink,
  Smartphone,
  Download,
  X,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/database';
import { PaymentMethod, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/products';
import { copyToClipboard } from '../lib/clipboard';

export const Checkout: React.FC = () => {
  const { items, subtotal, freeShippingThreshold, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiReferenceId, setUpiReferenceId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    db.getSettings().then(setSettings);
  }, []);

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center max-w-md mx-auto space-y-4">
        <h2 className="font-serif text-3xl text-charcoal-900">Your Bag is Empty</h2>
        <p className="text-xs text-charcoal-600">Please add products to your bag before checking out.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-charcoal-900 text-ivory-100 text-xs uppercase tracking-luxury font-semibold px-6 py-3 rounded"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const shippingFee = 0;
  const grandTotal = subtotal;

  const handleCopyUpi = async () => {
    await copyToClipboard(settings.upi_id);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard: ' + settings.upi_id, 'info');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      showToast('Please fill in all shipping details.', 'error');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (paymentMethod === 'UPI' && !upiReferenceId.trim()) {
      showToast('Please enter your 12-digit UPI Transaction / UTR reference ID.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images[0],
      }));

      const newOrder = await db.createOrder({
        customer: {
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
        },
        items: orderItems,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: 0,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        payment_status: 'pending',
        upi_reference_id: paymentMethod === 'UPI' ? upiReferenceId.trim() : undefined,
        order_status: 'ORDER PLACED',
        estimated_delivery: '2-4 business days',
      });

      clearCart();
      showToast('Order confirmed successfully!', 'success');
      navigate(`/order-confirmed/${newOrder.order_number}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to create order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxury text-charcoal-500 hover:text-charcoal-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Bag</span>
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          DISPATCH CHECKOUT
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Customer Information & Payment (Columns 1-7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Details */}
          <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-5">
            <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-3 border-b border-stone/20">
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For tracking notifications"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Flat / House / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 42, Green Avenue, Indiranagar"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit PIN"
                  className="w-full px-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-5">
            <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-3 border-b border-stone/20">
              2. Payment Method
            </h3>

            <div className="space-y-3">
              {/* Option 1: Direct UPI */}
              <label
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-charcoal-900 bg-sand/30 shadow-sm'
                    : 'border-stone/40 bg-ivory-50 hover:bg-sand/20'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-1 mr-3 text-charcoal-900 focus:ring-charcoal-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-luxury text-charcoal-950">
                      Direct UPI / GPay / PhonePe / Paytm
                    </span>
                    <span className="text-[9px] bg-sage-800 text-ivory-100 px-2 py-0.5 rounded font-semibold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 font-sans mt-0.5">
                    Instant transfer with zero convenience surcharges.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-charcoal-900 bg-sand/30 shadow-sm'
                    : 'border-stone/40 bg-ivory-50 hover:bg-sand/20'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 mr-3 text-charcoal-900 focus:ring-charcoal-900"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-luxury text-charcoal-950">
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-xs text-charcoal-600 font-sans mt-0.5">
                    Pay upon physical delivery to your doorstep.
                  </p>
                </div>
              </label>
            </div>

            {/* UPI Instruction Box with QR Code Scanner */}
            {paymentMethod === 'UPI' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-ivory-200/90 border border-stone/40 space-y-5 text-xs animate-fade-in shadow-inner">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sage-800 text-ivory-100">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-charcoal-950">
                        Scan & Pay with UPI QR Scanner
                      </h4>
                      <p className="text-[11px] text-charcoal-500 font-sans">
                        Pay ₹{grandTotal.toLocaleString('en-IN')} instantly using any UPI scanner
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-sage-800 bg-sage-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider border border-sage-400/40">
                    <ShieldCheck className="w-3 h-3 text-sage-700" />
                    <span>Instant Verification</span>
                  </span>
                </div>

                {/* QR Code Scanner Card */}
                <div className="p-4 bg-ivory-50 rounded-xl border border-stone/30 flex flex-col sm:flex-row items-center gap-5">
                  {/* QR Image with interactive enlarge overlay */}
                  <div className="relative group cursor-pointer shrink-0" onClick={() => setShowQrModal(true)}>
                    <div className="p-2 bg-charcoal-950 rounded-xl shadow-md border border-stone/40">
                      <img
                        src={settings.upi_qr_image || '/upi-qr-code.jpg'}
                        alt="NEXORA UPI Payment QR Code"
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                      />
                    </div>
                    <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-ivory-100 gap-1.5 text-[11px] font-medium backdrop-blur-[2px]">
                      <Maximize2 className="w-4 h-4" />
                      <span>Enlarge</span>
                    </div>
                  </div>

                  {/* QR Details & Action */}
                  <div className="space-y-3 flex-1 text-center sm:text-left w-full">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-400 block font-sans">
                        Payable Merchant
                      </span>
                      <span className="font-serif text-lg font-medium text-charcoal-950 block">
                        {settings.upi_name || 'ASIF MUHAMMED'}
                      </span>
                    </div>

                    <div className="inline-block px-3 py-1.5 bg-sand/40 border border-stone/30 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-500 block">Amount to Pay</span>
                      <span className="font-mono text-base font-bold text-charcoal-950">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Supported Apps Badges */}
                    <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      {['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                        <span
                          key={app}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone/20 text-charcoal-700"
                        >
                          {app}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-charcoal-800 bg-ivory-200/80 hover:bg-stone/30 px-3 py-1.5 rounded-lg border border-stone/40 transition-colors"
                      >
                        <Maximize2 className="w-3 h-3 text-sage-800" />
                        <span>Enlarge QR Code</span>
                      </button>

                      <a
                        href={`upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(settings.upi_name || 'ASIF MUHAMMED')}&am=${grandTotal}&cu=INR`}
                        className="inline-flex sm:hidden items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-ivory-100 bg-charcoal-900 hover:bg-charcoal-950 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Open UPI App</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct UPI ID Row */}
                <div className="p-3.5 bg-ivory-50 rounded-xl border border-stone/30 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="text-[10px] text-charcoal-500 uppercase tracking-widest block font-sans">
                      Or Copy Official UPI ID
                    </span>
                    <span className="text-xs font-mono font-bold text-charcoal-950 truncate block">
                      {settings.upi_id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-charcoal-900 bg-stone/30 hover:bg-stone/50 px-3.5 py-2 rounded-lg transition-colors shrink-0 shadow-sm"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied ID' : 'Copy ID'}</span>
                  </button>
                </div>

                {/* Steps */}
                <div className="p-3 bg-stone/20 rounded-xl text-[11px] text-charcoal-700 space-y-1">
                  <p className="font-semibold text-charcoal-900">How to complete payment:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-charcoal-600 font-light">
                    <li>Scan the QR code above using PhonePe, GPay, Paytm, or any UPI app.</li>
                    <li>Pay the exact order amount (<strong>₹{grandTotal.toLocaleString('en-IN')}</strong>).</li>
                    <li>Copy the 12-digit <strong>UTR / UPI Transaction ID</strong> from your receipt and paste below.</li>
                  </ol>
                </div>

                {/* UTR Input Field */}
                <div>
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-800 font-medium block mb-1">
                    UPI Transaction ID / 12-Digit UTR Number *
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === 'UPI'}
                    value={upiReferenceId}
                    onChange={(e) => setUpiReferenceId(e.target.value)}
                    placeholder="e.g. 423891028392 (from PhonePe/GPay receipt)"
                    className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/60 rounded-lg text-xs text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-900"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-1">
                    Your order will be verified and prepared for priority dispatch upon receipt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sidebar (Columns 8-12) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-5">
            <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-3 border-b border-stone/20">
              Items in Dispatch ({items.length})
            </h3>

            {/* Item Mini Thumbnails */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone/20 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover border border-stone/30 shrink-0"
                    />
                    <div>
                      <h4 className="font-medium text-charcoal-900 line-clamp-1">{product.name}</h4>
                      <span className="text-charcoal-500">Qty: {quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-charcoal-950">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone/30 space-y-2 text-xs text-charcoal-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-charcoal-950">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span className="font-semibold text-sage-800">FREE</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone/30 flex justify-between items-baseline">
              <span className="font-serif text-lg text-charcoal-900">Total Payable</span>
              <span className="font-serif text-3xl font-semibold text-charcoal-950">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 disabled:bg-charcoal-600 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-4 px-4 rounded transition-all duration-300 shadow-md group"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ivory-100 border-t-transparent rounded-full animate-spin" />
                  <span>Securing Order...</span>
                </span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>Direct Dispatch • Safe & Insured Delivery</span>
            </div>
          </div>
        </div>
      </form>

      {/* Enlarge QR Lightbox Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-sm w-full p-6 text-center space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone/30">
                <div className="flex items-center gap-2 text-left">
                  <QrCode className="w-4 h-4 text-sage-800" />
                  <span className="font-serif text-lg font-medium text-charcoal-950">UPI QR Scanner</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1.5 text-charcoal-500 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-charcoal-950 rounded-2xl shadow-xl inline-block border border-stone/30">
                <img
                  src={settings.upi_qr_image || '/upi-qr-code.jpg'}
                  alt="Full resolution UPI QR Code"
                  className="w-64 h-auto max-h-96 object-contain rounded-xl mx-auto"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-xl font-medium text-charcoal-950">
                  {settings.upi_name || 'ASIF MUHAMMED'}
                </h4>
                <p className="font-mono text-sm font-bold text-sage-800">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI app
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-ivory-200 hover:bg-stone/30 text-charcoal-900 text-xs font-semibold uppercase tracking-wider rounded-lg border border-stone/40 transition-colors"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied ID' : 'Copy UPI ID'}</span>
                </button>

                <a
                  href={settings.upi_qr_image || '/upi-qr-code.jpg'}
                  download="nexora-upi-qr.jpg"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
