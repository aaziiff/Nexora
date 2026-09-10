import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-24 sm:py-32 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sand/30 flex items-center justify-center text-charcoal-500 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-light">
          Your Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
          Looks like you haven’t added any curated essentials to your bag yet.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-charcoal-900 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-4 rounded hover:bg-charcoal-950 transition-colors shadow-md"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const shippingFee = 0;
  const grandTotal = subtotal;

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-1">
          Review Selection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          YOUR BAG
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Items List (Columns 1-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Notification Bar */}
          <div className="p-4 rounded-xl bg-sage-100/70 border border-sage-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-sage-900 font-medium">
              <Truck className="w-4 h-4 text-sage-700" />
              <span>Free Express Delivery on every order! Zero shipping fee applied.</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-sage-800 bg-ivory-100 px-2.5 py-1 rounded">
              FREE
            </span>
          </div>

          {/* Cart Items Table */}
          <div className="bg-ivory-100 rounded-xl border border-stone/30 divide-y divide-stone/20 overflow-hidden shadow-sm">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-stone/30 shrink-0 bg-ivory-200"
                    />
                  </Link>
                  <div>
                    <span className="text-[9px] uppercase tracking-luxury text-sage-800 font-semibold block">
                      {product.category}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-lg sm:text-xl font-normal text-charcoal-950 hover:text-sage-800 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-charcoal-500 line-clamp-1">{product.tagline}</p>
                    <div className="mt-1 text-xs font-semibold text-charcoal-900">
                      ₹{product.price.toLocaleString('en-IN')} each
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone/20">
                  {/* Quantity Modifier */}
                  <div className="inline-flex items-center border border-stone/60 rounded bg-ivory-50 h-9">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-semibold text-charcoal-900 font-sans">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total line price */}
                  <div className="text-sm font-semibold text-charcoal-900 w-20 text-right">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 text-charcoal-400 hover:text-rose-600 rounded transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/products"
              className="text-xs uppercase tracking-luxury font-semibold text-charcoal-700 hover:text-charcoal-950 underline underline-offset-4"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Card (Columns 9-12) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-6">
          <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-4 border-b border-stone/20">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-charcoal-700">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-medium text-charcoal-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Express Delivery</span>
              <span className="font-semibold text-sage-800">FREE</span>
            </div>
            <div className="flex justify-between text-charcoal-500 pt-1">
              <span>Estimated GST</span>
              <span>Included</span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone/30 flex justify-between items-baseline">
            <span className="font-serif text-lg text-charcoal-900">Estimated Total</span>
            <span className="font-serif text-3xl font-semibold text-charcoal-950">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-4 px-4 rounded transition-all duration-300 shadow-md group"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-3 border-t border-stone/20 flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Encrypted 256-bit checkout with COD & UPI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
