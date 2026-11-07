import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Percent, CheckCircle, AlertCircle } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<ProductCategory>('home');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | '' | undefined>('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [benefits, setBenefits] = useState<string[]>([
    'Minimal tactile design',
    'Durable heirloom materials',
  ]);
  const [newBenefit, setNewBenefit] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Precision crafted finish',
    'Includes eco packaging',
  ]);
  const [newFeature, setNewFeature] = useState('');
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([
    { label: 'Material', value: 'Solid Metal & Natural Composite' },
    { label: 'Care', value: 'Wipe with damp cloth' },
  ]);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stockCount, setStockCount] = useState(25);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);

  useEffect(() => {
    if (id) {
      db.getProductById(id).then((found) => {
        if (found) {
          setName(found.name);
          setSlug(found.slug);
          setTagline(found.tagline);
          setCategory(found.category);
          setPrice(found.price);
          setOriginalPrice(found.original_price ?? '');
          setDiscount(found.discount || '');
          setDescription(found.description);
          setStory(found.story || '');
          setImages(found.images && found.images.length > 0 ? found.images : ['']);
          setBenefits(found.benefits || []);
          setFeatures(found.features || []);
          setSpecs(found.specifications || []);
          setInStock(found.in_stock);
          setStockCount(found.stock_count);
          setIsFeatured(found.is_featured);
          setIsBestseller(found.is_bestseller);
        }
        setLoading(false);
      });
    }
  }, [id]);

  // Helper to calculate discount percentage
  const calculateDiscountBadge = (
    orig: number | '' | undefined,
    sell: number | '' | undefined
  ): string => {
    const origNum = Number(orig);
    const sellNum = Number(sell);
    if (origNum > 0 && sellNum > 0 && origNum > sellNum) {
      const pct = Math.round(((origNum - sellNum) / origNum) * 100);
      return pct > 0 ? `${pct}% OFF` : '';
    }
    return '';
  };

  const handleOriginalPriceChange = (val: string) => {
    const newOrig = val === '' ? '' : Number(val);
    setOriginalPrice(newOrig);

    // Auto-calculate percentage offer when original price is added/changed
    if (newOrig !== '' && price !== '') {
      const calculated = calculateDiscountBadge(newOrig, price);
      setDiscount(calculated);
    } else if (newOrig === '') {
      setDiscount('');
    }
  };

  const handlePriceChange = (val: string) => {
    const newPrice = val === '' ? '' : Number(val);
    setPrice(newPrice);

    // Auto-calculate percentage offer when discount price is added/changed
    if (originalPrice !== '' && originalPrice !== undefined && newPrice !== '') {
      const calculated = calculateDiscountBadge(originalPrice, newPrice);
      setDiscount(calculated);
    } else if (newPrice === '') {
      setDiscount('');
    }
  };

  // Real-time calculation helpers for UI display
  const origNum = Number(originalPrice);
  const priceNum = Number(price);
  const hasValidDiscount = origNum > 0 && priceNum > 0 && origNum > priceNum;
  const calculatedPercentage = hasValidDiscount
    ? Math.round(((origNum - priceNum) / origNum) * 100)
    : 0;
  const savingsAmount = hasValidDiscount ? origNum - priceNum : 0;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleAddSpec = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      setSpecs([...specs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]);
      setNewSpecLabel('');
      setNewSpecValue('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || price === '' || Number(price) <= 0 || !description) {
      showToast('Please fill in all required fields (Name, Slug, Price, Description)', 'error');
      return;
    }

    const cleanImages = images.filter((img) => Boolean(img.trim()));
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000');
    }

    const productPayload: Product = {
      id: id || `nx-${Date.now().toString(36)}`,
      name: name.trim(),
      slug: slug.trim(),
      tagline: tagline.trim() || 'Everyday lifestyle essential',
      category,
      category_name: category.toUpperCase(),
      price: Number(price),
      original_price:
        originalPrice !== '' && originalPrice !== undefined
          ? Number(originalPrice)
          : undefined,
      discount: discount.trim() || undefined,
      description: description.trim(),
      story: story.trim() || undefined,
      images: cleanImages,
      benefits,
      features,
      specifications: specs,
      in_stock: inStock,
      stock_count: Number(stockCount),
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      created_at: new Date().toISOString(),
    };

    await db.saveProduct(productPayload);
    showToast(`Product "${name}" saved to catalog and live on store`, 'success');
    navigate('/admin/products');
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal-600">Loading product editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-6 border-b border-stone/30">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxury text-charcoal-500 hover:text-charcoal-900 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            {isEditing ? `Edit: ${name}` : 'Add New Lifestyle Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Product Info */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-5">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            1. Core Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Diatomite Fast-Dry Stone Caddy"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:border-charcoal-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. diatomite-quick-dry-stone-tray"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono focus:border-charcoal-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Tagline / Short Descriptor
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Instant-absorbing natural stone counter dock"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:border-charcoal-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 capitalize focus:border-charcoal-900 focus:outline-none"
              >
                <option value="home">Home</option>
                <option value="care">Care</option>
                <option value="kitchen">Kitchen</option>
                <option value="bath">Bath</option>
                <option value="everyday">Everyday</option>
              </select>
            </div>
          </div>

          {/* Pricing & Percentage Offer Auto-Calculation */}
          <div className="pt-5 border-t border-stone/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-luxury text-charcoal-900 font-semibold block">
                  Pricing & Offers
                </span>
                <p className="text-[11px] text-charcoal-500 font-sans">
                  Enter original price and discount price — percentage offer will automatically calculate.
                </p>
              </div>
              {hasValidDiscount && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 border border-sage-200 text-sage-800 text-[11px] font-medium w-fit">
                  <Percent className="w-3 h-3 text-sage-700" />
                  <span>Saves ₹{savingsAmount.toLocaleString('en-IN')} ({calculatedPercentage}% OFF)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Original Price */}
              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Original Price (₹) <span className="text-charcoal-400 font-normal lowercase">(mrp / regular)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-charcoal-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={originalPrice ?? ''}
                    onChange={(e) => handleOriginalPriceChange(e.target.value)}
                    placeholder="e.g. 1299"
                    className="w-full pl-7 pr-3 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:border-charcoal-900 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-charcoal-400 mt-1 block">
                  Original strikethrough price
                </span>
              </div>

              {/* Discount / Selling Price */}
              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Discount Price (₹) * <span className="text-charcoal-400 font-normal lowercase">(final selling)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-charcoal-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={price ?? ''}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="e.g. 999"
                    className="w-full pl-7 pr-3 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:border-charcoal-900 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-charcoal-400 mt-1 block">
                  Final discounted amount charged
                </span>
              </div>

              {/* Percentage Offer Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium">
                    Percentage Offer
                  </label>
                  {hasValidDiscount && (
                    <span className="text-[10px] text-sage-800 font-semibold bg-sage-100 px-1.5 py-0.5 rounded">
                      {calculatedPercentage}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 23% OFF"
                    className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:border-charcoal-900 focus:outline-none"
                  />
                </div>
                <div className="mt-1">
                  {hasValidDiscount ? (
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-sage-800 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-sage-700 shrink-0" />
                        Auto-calculated
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDiscount(`${calculatedPercentage}% OFF`)}
                          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                            discount === `${calculatedPercentage}% OFF`
                              ? 'bg-sage-800 text-ivory-100 font-semibold'
                              : 'bg-stone/20 text-charcoal-600 hover:bg-stone/30'
                          }`}
                          title="Format as % OFF"
                        >
                          {calculatedPercentage}% OFF
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscount(`${calculatedPercentage}%`)}
                          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                            discount === `${calculatedPercentage}%`
                              ? 'bg-sage-800 text-ivory-100 font-semibold'
                              : 'bg-stone/20 text-charcoal-600 hover:bg-stone/30'
                          }`}
                          title="Format as percentage only"
                        >
                          {calculatedPercentage}%
                        </button>
                      </div>
                    </div>
                  ) : origNum > 0 && priceNum > 0 && priceNum >= origNum ? (
                    <span className="text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Original price should be higher than discount price
                    </span>
                  ) : (
                    <span className="text-[10px] text-charcoal-400">
                      Calculates automatically when prices are set
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Imagery */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            2. Photography & Media
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste high-res image URL (Unsplash or Supabase Storage URL)"
                className="flex-1 px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 bg-charcoal-900 text-ivory-100 rounded text-xs font-semibold uppercase tracking-luxury"
              >
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-stone/30 aspect-square group">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-charcoal-950/80 text-ivory-100 rounded-full hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative & Description */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            3. Narrative & Descriptions
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Main Product Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product utility..."
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                The Design Story / Routine Context
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Why we curated this item and how it fits everyday rituals..."
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Stock & Merchandising Badges */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            4. Stock & Badges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 rounded bg-ivory-50 border border-stone/40 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-charcoal-900"
              />
              <span className="text-xs font-semibold text-charcoal-900">In Stock for Dispatch</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded bg-ivory-50 border border-stone/40 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded text-charcoal-900"
              />
              <span className="text-xs font-semibold text-charcoal-900">Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded bg-ivory-50 border border-stone/40 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-charcoal-900"
              />
              <span className="text-xs font-semibold text-charcoal-900">Featured on Homepage</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded text-xs uppercase tracking-luxury text-charcoal-600 hover:text-charcoal-950 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-3.5 rounded transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Publish to Storefront</span>
          </button>
        </div>
      </form>
    </div>
  );
};
