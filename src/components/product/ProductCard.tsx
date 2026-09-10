import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
  variant?: 'featured-large' | 'standard' | 'horizontal';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'standard',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    showToast(`Added "${product.name}" to your bag`, 'success');
    setTimeout(() => setIsAdded(false), 1500);
  };

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000';
  const secondaryImage = product.images[1] || primaryImage;

  if (variant === 'featured-large') {
    return (
      <div
        className={`group relative bg-ivory-100 rounded-xl overflow-hidden border border-stone/30 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.slug}`} className="block relative aspect-[4/4.5] overflow-hidden bg-ivory-200">
          <img
            src={isHovered && product.images.length > 1 ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-all duration-700 ease-out"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {product.is_bestseller && (
              <span className="text-[9px] uppercase tracking-widest font-semibold bg-charcoal-900 text-ivory-100 px-2.5 py-1 rounded-full shadow-sm">
                Bestseller
              </span>
            )}
            {product.discount && (
              <span className="text-[9px] uppercase tracking-widest font-semibold bg-sage-800 text-ivory-100 px-2.5 py-1 rounded-full shadow-sm">
                {product.discount}
              </span>
            )}
          </div>

          {/* Quick Add Button on Image Hover */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={handleQuickAdd}
              className="w-10 h-10 rounded-full bg-ivory-100/95 backdrop-blur-md text-charcoal-900 flex items-center justify-center shadow-lg hover:bg-charcoal-900 hover:text-ivory-100 transition-all duration-300 transform group-hover:scale-100 scale-90"
              aria-label="Quick add to bag"
            >
              {isAdded ? <Check className="w-4 h-4 text-sage-600" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-6 flex flex-col justify-between flex-1 bg-ivory-100">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
              {product.category_name || product.category}
            </span>
            <Link to={`/product/${product.slug}`}>
              <h3 className="font-serif text-2xl font-light text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-charcoal-500 font-sans line-clamp-2 leading-relaxed">
              {product.tagline}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-stone/20 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-charcoal-900 font-sans">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span className="text-xs text-charcoal-400 line-through font-sans">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxury font-semibold text-charcoal-800 group-hover:text-sage-800 transition-colors"
            >
              <span>View Product</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Editorial Product Card
  return (
    <div
      className={`group relative bg-ivory-100 rounded-xl overflow-hidden border border-stone/30 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-ivory-200">
        <img
          src={isHovered && product.images.length > 1 ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-all duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.is_bestseller && (
            <span className="text-[9px] uppercase tracking-widest font-semibold bg-charcoal-900 text-ivory-100 px-2 py-0.5 rounded-full shadow-sm">
              Bestseller
            </span>
          )}
          {product.discount && (
            <span className="text-[9px] uppercase tracking-widest font-semibold bg-sage-800 text-ivory-100 px-2 py-0.5 rounded-full shadow-sm">
              {product.discount}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={handleQuickAdd}
            className="w-8 h-8 rounded-full bg-ivory-100/90 backdrop-blur-md text-charcoal-900 flex items-center justify-center shadow hover:bg-charcoal-900 hover:text-ivory-100 transition-all duration-300"
            aria-label="Quick add to bag"
          >
            {isAdded ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-ivory-100">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-luxury text-sage-800 font-semibold block">
            {product.category_name || product.category}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-charcoal-900 group-hover:text-charcoal-950 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-charcoal-500 font-sans line-clamp-1">
            {product.tagline}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-stone/20 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-charcoal-900 font-sans">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.original_price && (
              <span className="text-[10px] text-charcoal-400 line-through font-sans">
                ₹{product.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] uppercase tracking-luxury font-medium text-charcoal-800 group-hover:text-sage-800 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
