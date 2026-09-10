import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Product, Order } from '../../types';
import { db } from '../../lib/database';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([db.getProducts(), db.getOrders()]).then(([pList, oList]) => {
      setProducts(pList);
      setOrders(oList);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'verified' || o.payment_method === 'COD')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingUpiOrders = orders.filter(
    (o) => o.payment_method === 'UPI' && o.payment_status === 'pending'
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            NEXORA Core System
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            Concierge Overview
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-5 py-3 rounded transition-colors shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="p-6 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-luxury font-medium">Total Bookings</span>
            <TrendingUp className="w-4 h-4 text-sage-600" />
          </div>
          <div className="font-serif text-3xl font-normal text-charcoal-950">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-charcoal-500 font-sans">Across verified UPI & COD orders</p>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-6 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-luxury font-medium">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-sage-600" />
          </div>
          <div className="font-serif text-3xl font-normal text-charcoal-950">
            {orders.length}
          </div>
          <p className="text-[11px] text-charcoal-500 font-sans">Active customer dispatches</p>
        </div>

        {/* Card 3: Pending UPI Verifications */}
        <div className="p-6 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-luxury font-medium">Pending UPI Checks</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-3xl font-normal text-charcoal-950">
            {pendingUpiOrders.length}
          </div>
          <p className="text-[11px] text-charcoal-500 font-sans">Awaiting UTR confirmation</p>
        </div>

        {/* Card 4: Active Catalog */}
        <div className="p-6 rounded-xl bg-ivory-100 border border-stone/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs uppercase tracking-luxury font-medium">Active Catalog</span>
            <Package className="w-4 h-4 text-sage-600" />
          </div>
          <div className="font-serif text-3xl font-normal text-charcoal-950">
            {products.length}
          </div>
          <p className="text-[11px] text-charcoal-500 font-sans">Curated lifestyle products</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-ivory-100 rounded-xl border border-stone/30 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone/20">
          <div>
            <h3 className="font-serif text-2xl font-light text-charcoal-950">
              Recent Dispatches & Orders
            </h3>
            <p className="text-xs text-charcoal-500 font-sans mt-0.5">
              Review incoming orders, verify UPI UTR references, and assign courier AWB tracking.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 transition-colors inline-flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-500">No customer orders placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-ivory-200/50 text-[10px] uppercase tracking-luxury text-charcoal-600 border-y border-stone/30">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-sand/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-charcoal-900">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-charcoal-900 block">{ord.customer.name}</span>
                      <span className="text-[11px] text-charcoal-400 font-sans">{ord.customer.city}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{ord.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          ord.payment_status === 'verified'
                            ? 'bg-sage-100 text-sage-800'
                            : ord.payment_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] uppercase font-semibold tracking-wider text-charcoal-800 bg-stone/30 px-2 py-0.5 rounded">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="text-xs uppercase tracking-luxury font-semibold text-charcoal-900 hover:text-sage-800 transition-colors underline underline-offset-2"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
