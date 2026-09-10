import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalCount,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-ivory-100 shadow-2xl flex flex-col justify-between border-l border-stone/30"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone/30 bg-ivory-200/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-charcoal-800" />
                    <h3 className="font-serif text-2xl font-normal text-charcoal-900">Your Bag</h3>
                    <span className="text-xs bg-charcoal-900 text-ivory-100 rounded-full px-2 py-0.5 font-medium">
                      {totalCount}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 text-charcoal-500 hover:text-charcoal-950 hover:bg-stone/20 rounded-full transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Free Shipping Badge */}
                <div className="bg-sage-100/70 p-3 rounded-lg border border-sage-200 mt-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-sage-900 font-medium">
                    <Truck className="w-4 h-4 text-sage-700" />
                    <span>Free Express Delivery on every order!</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sage-800 bg-ivory-100 px-2 py-0.5 rounded">
                    FREE
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone/20 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-stone/20 flex items-center justify-center text-charcoal-400 mb-4">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif text-xl text-charcoal-800 mb-1">Your bag is currently empty</h4>
                    <p className="text-xs text-charcoal-500 max-w-xs mb-6">
                      Explore our curated collection of thoughtful everyday essentials.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/products');
                      }}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury font-semibold bg-charcoal-900 text-ivory-100 px-6 py-3 rounded hover:bg-charcoal-800 transition-colors"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  items.map(({ product, quantity }) => (
                    <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-24 object-cover rounded bg-ivory-200 border border-stone/30 shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-charcoal-900 font-sans line-clamp-1">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-charcoal-400 hover:text-rose-600 p-1 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-charcoal-500 line-clamp-1 mt-0.5">{product.tagline}</p>
                          <div className="mt-1 text-xs font-semibold text-charcoal-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Quantity Modifier */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-stone/60 rounded bg-ivory-50">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="p-1.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-medium font-sans text-charcoal-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-1.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-charcoal-800">
                            ₹{(product.price * quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-stone/30 bg-ivory-200/40 space-y-4">
                  <div className="space-y-1.5 text-xs text-charcoal-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-charcoal-900 text-sm">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-charcoal-500">
                      <span>Estimated Shipping</span>
                      <span className="font-semibold text-sage-800">FREE</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-3.5 px-4 rounded transition-all duration-300 shadow-md group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={handleViewCart}
                      className="w-full text-center text-xs text-charcoal-700 hover:text-charcoal-950 underline underline-offset-4 py-1.5 transition-colors font-medium"
                    >
                      View Detailed Bag
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest pt-1 border-t border-stone/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                    <span>Secure Checkout • UPI & COD Available</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
