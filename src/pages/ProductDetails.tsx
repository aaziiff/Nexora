import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronDown,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../types';
import { db } from '../lib/database';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import { copyToClipboard } from '../lib/clipboard';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('specs');
  const [loading, setLoading] = useState(true);

  // New Review Form Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLocation, setReviewLocation] = useState('');

  const loadProductData = () => {
    if (slug) {
      db.getProductBySlug(slug).then(async (found) => {
        if (found) {
          setProduct(found);
          const allProds = await db.getProducts();
          const related = allProds
            .filter((p) => p.id !== found.id && p.category === found.category)
            .slice(0, 3);
          setRelatedProducts(related.length > 0 ? related : allProds.filter((p) => p.id !== found.id).slice(0, 3));

          const productReviews = await db.getReviews(found.id);
          setReviews(productReviews);
        }
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setSelectedImageIndex(0);
    setQuantity(1);

    loadProductData();

    window.addEventListener('nexora_products_updated', loadProductData);
    return () => window.removeEventListener('nexora_products_updated', loadProductData);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-charcoal-700">Presenting essential...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 px-4 text-center max-w-md mx-auto space-y-4">
        <h2 className="font-serif text-3xl text-charcoal-900">Product Not Found</h2>
        <p className="text-xs text-charcoal-600">The essential you are looking for might have been archived.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-charcoal-900 text-ivory-100 text-xs uppercase tracking-luxury font-semibold px-6 py-3 rounded"
        >
          <span>Return to Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    showToast(`Added ${quantity} × "${product.name}" to your bag`, 'success');
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      await copyToClipboard(window.location.href);
      showToast('Product link copied to clipboard', 'info');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewComment) {
      showToast('Please complete all review fields.', 'error');
      return;
    }

    const newRev = await db.addReview({
      product_id: product.id,
      customer_name: reviewName,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      verified_purchase: true,
      location: reviewLocation || 'India',
    });

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setReviewName('');
    setReviewTitle('');
    setReviewComment('');
    setReviewLocation('');
    showToast('Thank you for sharing your experience.', 'success');
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-luxury text-charcoal-500 mb-8 font-medium">
        <Link to="/" className="hover:text-charcoal-950 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-charcoal-950 transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-charcoal-950 transition-colors capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Gallery & Zoom (Columns 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Visual Frame */}
          <div className="relative aspect-[4/4.5] rounded-2xl overflow-hidden bg-ivory-200 border border-stone/40 shadow-sm group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_bestseller && (
                <span className="text-[9px] uppercase tracking-widest font-semibold bg-charcoal-900 text-ivory-100 px-3 py-1 rounded-full shadow">
                  Bestseller
                </span>
              )}
              {product.discount && (
                <span className="text-[9px] uppercase tracking-widest font-semibold bg-sage-800 text-ivory-100 px-3 py-1 rounded-full shadow">
                  {product.discount}
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ivory-100/90 text-charcoal-800 flex items-center justify-center shadow hover:bg-charcoal-900 hover:text-ivory-100 transition-colors"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-charcoal-900 shadow-md opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Panel (Columns 8-12) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-2 border-b border-stone/30 pb-6">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
              {product.category_name || product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-light leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 font-sans font-light">
              {product.tagline}
            </p>

            {/* Price & Rating */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl text-charcoal-950 font-normal">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && (
                  <span className="text-sm text-charcoal-400 line-through font-sans">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount && (
                  <span className="text-xs font-semibold text-sage-800 bg-sage-100 px-2 py-0.5 rounded">
                    Save {product.discount}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-1.5 text-xs text-charcoal-700 bg-sand/40 px-2.5 py-1 rounded">
                  <Star className="w-3.5 h-3.5 fill-sage-700 text-sage-700" />
                  <span className="font-semibold">{product.rating}</span>
                  {reviews.length > 0 && (
                    <span className="text-charcoal-500">({reviews.length})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="inline-flex items-center border border-stone/60 rounded bg-ivory-50 h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 text-charcoal-600 hover:text-charcoal-900 transition-colors h-full flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-semibold text-charcoal-900 font-sans">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 text-charcoal-600 hover:text-charcoal-900 transition-colors h-full flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs uppercase tracking-luxury font-semibold rounded transition-all duration-300 shadow-md group"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-sage-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <span>Add to Bag</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Direct Buy Now CTA */}
            <button
              onClick={handleBuyNow}
              className="w-full h-12 flex items-center justify-center gap-2 border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-ivory-100 text-xs uppercase tracking-luxury font-semibold rounded transition-all duration-300"
            >
              <span>Instant Buy with UPI / COD</span>
            </button>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone/30 text-center">
            <div className="p-2.5 rounded bg-ivory-200/50 border border-stone/20">
              <Truck className="w-4 h-4 text-sage-700 mx-auto mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-800 block">Express</span>
              <span className="text-[9px] text-charcoal-500">2-4 Days</span>
            </div>
            <div className="p-2.5 rounded bg-ivory-200/50 border border-stone/20">
              <ShieldCheck className="w-4 h-4 text-sage-700 mx-auto mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-800 block">Tested</span>
              <span className="text-[9px] text-charcoal-500">Solid Build</span>
            </div>
            <div className="p-2.5 rounded bg-ivory-200/50 border border-stone/20">
              <RotateCcw className="w-4 h-4 text-sage-700 mx-auto mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-800 block">7-Day</span>
              <span className="text-[9px] text-charcoal-500">Replacements</span>
            </div>
          </div>

          {/* Accordion Modules (Specs, Features, Routine Benefits, Shipping) */}
          <div className="pt-4 divide-y divide-stone/30 border-t border-stone/30">
            {/* Features Accordion */}
            {product.features && product.features.length > 0 && (
              <div>
                <button
                  onClick={() => toggleAccordion('features')}
                  className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-luxury text-charcoal-900"
                >
                  <span>Key Features</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'features' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'features' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-4 text-xs text-charcoal-600 font-sans space-y-2"
                    >
                      <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                        {product.features.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Specifications Accordion */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-luxury text-charcoal-900"
                >
                  <span>Specifications & Dimensions</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'specs' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'specs' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-4 text-xs text-charcoal-600 font-sans"
                    >
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-stone/20">
                          {product.specifications.map((spec, idx) => (
                            <tr key={idx} className="py-1.5">
                              <td className="py-1.5 font-medium text-charcoal-800 pr-4">{spec.label}</td>
                              <td className="py-1.5 text-charcoal-600">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Shipping & Returns Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-luxury text-charcoal-900"
              >
                <span>Shipping & Delivery Details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeAccordion === 'shipping' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pb-4 text-xs text-charcoal-600 font-sans space-y-2 leading-relaxed"
                  >
                    <p>• Free Express Delivery across India on every order with zero handling fees.</p>
                    <p>• Dispatched in unbleached, eco-friendly protective packaging within 24 hours.</p>
                    <p>• Estimated arrival: 2-4 business days for metros; 3-6 days for rest of India.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Product Story Narrative Section */}
      {product.story && (
        <div className="my-20 p-8 sm:p-12 rounded-2xl bg-ivory-200/60 border border-stone/40">
          <div className="max-w-3xl mx-auto space-y-4 text-center">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
              The Design Story
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-light">
              Why We Curated This
            </h3>
            <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed font-light">
              {product.story}
            </p>
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="my-20 border-t border-stone/30 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-1">
              Customer Feedback
            </span>
            <h3 className="font-serif text-3xl font-light text-charcoal-900">
              Verified Reflections ({reviews.length})
            </h3>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury font-semibold bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 px-5 py-3 rounded transition-colors self-start sm:self-auto"
          >
            <span>Write a Review</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 rounded-xl bg-ivory-200/30 text-center border border-stone/30 max-w-lg mx-auto">
            <p className="font-serif text-lg text-charcoal-800">Be the first to reflect on this piece</p>
            <p className="text-xs text-charcoal-500 mt-1">
              Share how this essential fits into your daily routine.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 rounded-xl bg-ivory-100 border border-stone/30 space-y-3">
                <div className="flex items-center gap-1 text-sage-700">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-sage-600 text-sage-600' : 'text-stone'}`}
                    />
                  ))}
                </div>
                <h4 className="font-serif text-lg font-normal text-charcoal-950">“{rev.title}”</h4>
                <p className="text-xs text-charcoal-600 font-sans leading-relaxed">{rev.comment}</p>
                <div className="pt-3 border-t border-stone/20 flex items-center justify-between text-[11px] text-charcoal-500">
                  <span className="font-medium text-charcoal-800">{rev.customer_name}</span>
                  <span>{rev.location || 'Verified Buyer'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <div className="my-20 border-t border-stone/30 pt-16">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-1">
              Harmonious Complements
            </span>
            <h3 className="font-serif text-3xl font-light text-charcoal-900">
              Pair with Your Routine
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} variant="standard" />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-ivory-100 rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone/40"
            >
              <h3 className="font-serif text-2xl text-charcoal-950 font-light mb-1">
                Share Your Experience
              </h3>
              <p className="text-xs text-charcoal-500 mb-6">
                Reflect on the craftsmanship and everyday utility of {product.name}.
              </p>

              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className="p-1 text-charcoal-800 hover:text-sage-700"
                        aria-label={`Rate ${num} stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= reviewRating ? 'fill-sage-600 text-sage-600' : 'text-stone'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Meera S."
                      className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                    Headline / Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Flawless build, solved my sink water marks"
                    className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the materials, how you use it in your daily routine..."
                    className="w-full px-3.5 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone/30">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 text-xs text-charcoal-600 hover:text-charcoal-950 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-charcoal-900 text-ivory-100 rounded text-xs uppercase tracking-luxury font-semibold hover:bg-charcoal-950"
                  >
                    Submit Review
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
