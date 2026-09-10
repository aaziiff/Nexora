import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { db } from '../lib/database';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../data/products';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });

    const handleUpdate = () => {
      db.getProducts().then(setProducts);
    };
    window.addEventListener('nexora_products_updated', handleUpdate);
    return () => window.removeEventListener('nexora_products_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    if (catSlug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catSlug });
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  const activeCategoryInfo = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Category Intro */}
      <div className="mb-12 text-center sm:text-left">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block mb-2">
          The Complete Roster
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-charcoal-900 capitalize">
          {selectedCategory === 'all' ? 'Everyday Essentials' : `${selectedCategory} Collection`}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl font-sans mt-3 leading-relaxed">
          {activeCategoryInfo
            ? activeCategoryInfo.description
            : 'Useful, aesthetically considered items discovered for your home, self-care, kitchen, bath, and daily carry.'}
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-stone/30">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`text-xs uppercase tracking-luxury px-4 py-2 rounded transition-all font-semibold shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-charcoal-900 text-ivory-100'
                : 'bg-stone/20 text-charcoal-700 hover:bg-stone/30'
            }`}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`text-xs uppercase tracking-luxury px-4 py-2 rounded transition-all font-semibold shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-charcoal-900 text-ivory-100'
                    : 'bg-stone/20 text-charcoal-700 hover:bg-stone/30'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-charcoal-700">
          <span className="flex items-center gap-1.5 text-charcoal-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort products"
            className="bg-ivory-100 border border-stone/60 rounded px-3 py-1.5 text-xs font-medium text-charcoal-900 focus:outline-none focus:border-charcoal-900 font-sans"
          >
            <option value="featured">Curator's Pick</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Customer Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-lg text-charcoal-600">Gathering curated essentials...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto space-y-4">
          <p className="font-serif text-2xl text-charcoal-800">No essentials in this category yet</p>
          <p className="text-xs text-charcoal-500">
            We are actively sourcing and testing new objects. Check back soon or browse all products.
          </p>
          <button
            onClick={() => handleCategoryChange('all')}
            className="inline-flex text-xs uppercase tracking-luxury font-semibold bg-charcoal-900 text-ivory-100 px-6 py-3 rounded"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
};
