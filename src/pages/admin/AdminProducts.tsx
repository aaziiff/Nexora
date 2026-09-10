import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadProducts = () => {
    db.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener('nexora_products_updated', loadProducts);
    return () => window.removeEventListener('nexora_products_updated', loadProducts);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the active catalog?`)) {
      await db.deleteProduct(id);
      showToast(`Product "${name}" deleted successfully`, 'info');
      loadProducts();
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated = { ...product, in_stock: !product.in_stock };
    await db.saveProduct(updated);
    showToast(`Stock status updated for ${product.name}`, 'success');
  };

  const handleToggleBestseller = async (product: Product) => {
    const updated = { ...product, is_bestseller: !product.is_bestseller };
    await db.saveProduct(updated);
    showToast(`Bestseller badge updated for ${product.name}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            Products ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-5 py-3 rounded transition-colors shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-600">Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 rounded-xl bg-ivory-100 border border-stone/30 text-center space-y-4">
          <p className="font-serif text-2xl text-charcoal-800">No products in catalog</p>
          <Link
            to="/admin/products/new"
            className="inline-flex text-xs uppercase tracking-luxury font-semibold bg-charcoal-900 text-ivory-100 px-6 py-3 rounded"
          >
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="bg-ivory-100 rounded-xl border border-stone/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-ivory-200/60 text-[10px] uppercase tracking-luxury text-charcoal-600 border-b border-stone/30">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Bestseller</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sand/15 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded object-cover border border-stone/30 shrink-0 bg-ivory-200"
                        />
                        <div>
                          <h4 className="font-medium text-charcoal-950 line-clamp-1">{p.name}</h4>
                          <span className="text-[11px] text-charcoal-400 font-mono">{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 uppercase tracking-wider text-[11px] font-semibold text-sage-800">
                      {p.category}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-semibold px-2.5 py-1 rounded transition-colors ${
                          p.in_stock
                            ? 'bg-sage-100 text-sage-800 hover:bg-sage-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleBestseller(p)}
                        className={`p-1.5 rounded transition-colors ${
                          p.is_bestseller
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                            : 'text-charcoal-300 hover:text-charcoal-600'
                        }`}
                        title={p.is_bestseller ? 'Remove Bestseller badge' : 'Mark as Bestseller'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-charcoal-500 hover:text-charcoal-950 hover:bg-stone/20 rounded transition-colors"
                          title="View on live storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="p-1.5 text-charcoal-600 hover:text-charcoal-950 hover:bg-stone/20 rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
