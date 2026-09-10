import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Clock, CheckCircle2, Truck, Filter, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderStatus } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  
  // Deletion modal states
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadOrders = () => {
    db.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('nexora_orders_updated', loadOrders);
    return () => window.removeEventListener('nexora_orders_updated', loadOrders);
  }, []);

  const handleDeleteSingle = async () => {
    if (!orderToDelete) return;
    const targetId = orderToDelete.id;
    const targetNum = orderToDelete.order_number;
    setIsDeleting(true);

    // Optimistically update React state immediately
    setOrders(prev => prev.filter(o => o.id !== targetId && o.order_number !== targetNum));

    try {
      await db.deleteOrder(targetId);
      showToast(`Order ${targetNum} and customer delivery information deleted.`, 'success');
      setOrderToDelete(null);
      const fresh = await db.getOrders();
      setOrders(fresh);
    } catch (err) {
      showToast('Failed to delete order record.', 'error');
      loadOrders();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCompletedBulk = async () => {
    setIsDeleting(true);

    // Optimistically remove delivered orders immediately
    setOrders(prev => prev.filter(o => o.order_status !== 'DELIVERED'));

    try {
      const count = await db.deleteCompletedOrders();
      showToast(`Successfully deleted ${count} completed delivery order(s).`, 'success');
      setShowBulkDeleteModal(false);
      const fresh = await db.getOrders();
      setOrders(fresh);
    } catch (err) {
      showToast('Failed to purge completed delivery records.', 'error');
      loadOrders();
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING_UPI') {
      return o.payment_method === 'UPI' && o.payment_status === 'pending';
    }
    return o.order_status === selectedFilter;
  });

  const deliveredCount = orders.filter((o) => o.order_status === 'DELIVERED').length;

  const filterTabs = [
    { label: 'All Orders', value: 'ALL', count: orders.length },
    {
      label: 'Pending UPI Checks',
      value: 'PENDING_UPI',
      count: orders.filter((o) => o.payment_method === 'UPI' && o.payment_status === 'pending').length,
    },
    {
      label: 'To Process',
      value: 'PROCESSING',
      count: orders.filter((o) => o.order_status === 'PROCESSING').length,
    },
    {
      label: 'Shipped',
      value: 'SHIPPED',
      count: orders.filter((o) => o.order_status === 'SHIPPED').length,
    },
    {
      label: 'Delivered',
      value: 'DELIVERED',
      count: deliveredCount,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            Orders & Dispatches ({orders.length})
          </h1>
        </div>

        {deliveredCount > 0 && (
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold uppercase tracking-luxury transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Completed Deliveries ({deliveredCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedFilter(tab.value)}
            className={`text-xs uppercase tracking-luxury px-4 py-2 rounded transition-all font-semibold shrink-0 ${
              selectedFilter === tab.value
                ? 'bg-charcoal-900 text-ivory-100 shadow'
                : 'bg-stone/20 text-charcoal-700 hover:bg-stone/30'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-600">Loading dispatches...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-xl bg-ivory-100 border border-stone/30 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-charcoal-400 mx-auto" />
          <p className="font-serif text-2xl text-charcoal-800">No matching orders found</p>
          <p className="text-xs text-charcoal-500">
            Orders placed on the storefront will appear here immediately for fulfillment.
          </p>
        </div>
      ) : (
        <div className="bg-ivory-100 rounded-xl border border-stone/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-ivory-200/60 text-[10px] uppercase tracking-luxury text-charcoal-600 border-b border-stone/30">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer & Address</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Method & UTR</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-sand/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-charcoal-900">
                      {ord.order_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-charcoal-950 block">{ord.customer.name}</span>
                      <span className="text-[11px] text-charcoal-500 font-sans">{ord.customer.city}, {ord.customer.state} ({ord.customer.pincode})</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-charcoal-900">
                        {ord.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-charcoal-950 font-mono">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{ord.payment_method}</div>
                      {ord.upi_reference_id && (
                        <span className="text-[10px] text-charcoal-500 block truncate max-w-[120px]">
                          UTR: {ord.upi_reference_id}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded ${
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
                      <span
                        className={`inline-block text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded ${
                          ord.order_status === 'DELIVERED'
                            ? 'bg-sage-800 text-ivory-100'
                            : ord.order_status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone/30 text-charcoal-800'
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs uppercase tracking-luxury font-semibold bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 px-3 py-1.5 rounded transition-colors"
                          title="Inspect and edit fulfillment"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete delivery and customer info"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Single Order Confirmation Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Delete Delivery Information?
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Are you sure you want to permanently delete order <strong className="font-mono text-charcoal-900">{orderToDelete.order_number}</strong> and erase all associated customer delivery data (<span className="font-semibold text-charcoal-800">{orderToDelete.customer.name}</span>, {orderToDelete.customer.city})?
                </p>
                <div className="p-3 bg-ivory-200/60 rounded-lg text-[11px] text-charcoal-600 space-y-1">
                  <div>Status: <span className="font-semibold uppercase text-charcoal-900">{orderToDelete.order_status}</span></div>
                  <div>Amount: <span className="font-mono font-semibold">₹{orderToDelete.total_amount.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSingle}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Completed Orders Bulk Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-ivory-50 rounded-2xl border border-stone/30 shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="text-charcoal-400 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-light text-charcoal-950">
                  Purge Completed Deliveries?
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  This will permanently delete all <strong className="text-charcoal-900">{deliveredCount} delivered orders</strong> and erase customer delivery details from the database.
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  ⚠️ This action cannot be undone. Active dispatches will remain untouched.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone/40 text-charcoal-700 hover:bg-stone/20 text-xs font-medium uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCompletedBulk}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-luxury transition-colors shadow"
                >
                  {isDeleting ? 'Purging...' : `Delete ${deliveredCount} Orders`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
