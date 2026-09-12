import { Product, CategoryInfo, Order, Review, SiteSettings, OrderStatus, ReturnRequest, ReturnType } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, DEFAULT_SITE_SETTINGS } from '../data/products';
import { supabase, isSupabaseConfigured } from './supabase';

export interface ReturnEligibility {
  isEligible: boolean;
  eligible?: boolean;
  deliveryDate: Date | null;
  deliveredDate?: Date | null;
  expiryDate: Date | null;
  daysLeft: number;
  message: string;
  hasExistingReturn: boolean;
  statusText?: string;
  isDelivered?: boolean;
}

export function getReturnEligibility(order: Order): ReturnEligibility {
  // Check if return has already been initiated
  const returnStatuses: OrderStatus[] = [
    'RETURN_REQUESTED',
    'RETURN_APPROVED',
    'RETURN_REJECTED',
    'RETURN_PICKED_UP',
    'REFUNDED',
    'REPLACED',
  ];

  if (returnStatuses.includes(order.order_status) || order.return_request) {
    let statusText = 'Return in progress';
    if (order.order_status === 'RETURN_REQUESTED') statusText = 'Return Requested — Under Review';
    if (order.order_status === 'RETURN_APPROVED') statusText = 'Return Approved — Pickup Scheduled';
    if (order.order_status === 'RETURN_REJECTED') statusText = 'Return Request Declined';
    if (order.order_status === 'RETURN_PICKED_UP') statusText = 'Item Picked Up — In Inspection';
    if (order.order_status === 'REFUNDED') statusText = 'Refund Completed';
    if (order.order_status === 'REPLACED') statusText = 'Replacement Dispatched';

    const dDate = order.delivered_at ? new Date(order.delivered_at) : null;
    return {
      isEligible: false,
      eligible: false,
      deliveryDate: dDate,
      deliveredDate: dDate,
      expiryDate: null,
      daysLeft: 0,
      message: statusText,
      hasExistingReturn: true,
      statusText,
      isDelivered: true,
    };
  }

  // If not yet delivered, returns are not applicable
  const wasDelivered =
    order.order_status === 'DELIVERED' ||
    Boolean(order.delivered_at) ||
    order.status_history.some((h) => h.status === 'DELIVERED');

  if (!wasDelivered) {
    return {
      isEligible: false,
      eligible: false,
      deliveryDate: null,
      deliveredDate: null,
      expiryDate: null,
      daysLeft: 0,
      message: 'Returns are available once the order is delivered.',
      hasExistingReturn: false,
      isDelivered: false,
    };
  }

  // Determine delivery date
  let deliveryTimestamp: Date;
  if (order.delivered_at) {
    deliveryTimestamp = new Date(order.delivered_at);
  } else {
    const deliveredHistory = order.status_history.find((h) => h.status === 'DELIVERED');
    if (deliveredHistory?.timestamp) {
      deliveryTimestamp = new Date(deliveredHistory.timestamp);
    } else {
      deliveryTimestamp = new Date(order.created_at);
    }
  }

  // Calculate 7 days cutoff (Day 1 through Day 7 / 7 * 24 hours)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(deliveryTimestamp.getTime() + SEVEN_DAYS_MS);
  const now = new Date();
  const msRemaining = expiryDate.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return {
      isEligible: false,
      eligible: false,
      deliveryDate: deliveryTimestamp,
      deliveredDate: deliveryTimestamp,
      expiryDate,
      daysLeft: 0,
      message: `Return window closed on ${expiryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} (7-day policy ended)`,
      hasExistingReturn: false,
      isDelivered: true,
    };
  }

  // Calculate days left (rounded up, 1 to 7)
  const daysLeft = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

  return {
    isEligible: true,
    eligible: true,
    deliveryDate: deliveryTimestamp,
    deliveredDate: deliveryTimestamp,
    expiryDate,
    daysLeft,
    message: `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining to return (valid until ${expiryDate.toLocaleDateString(
      'en-IN',
      { day: 'numeric', month: 'short' }
    )})`,
    hasExistingReturn: false,
    isDelivered: true,
  };
}

const PRODUCTS_STORAGE_KEY = 'nexora_db_products_v1';
const ORDERS_STORAGE_KEY = 'nexora_db_orders_v1';
const REVIEWS_STORAGE_KEY = 'nexora_db_reviews_v1';
const SETTINGS_STORAGE_KEY = 'nexora_db_settings_v1';
const DELETED_ORDERS_KEY = 'nexora_deleted_order_ids_v1';
const DB_INITIALIZED_KEY = 'nexora_db_seeded_v1';

// Initialize local database storage if empty
function initializeLocalDb() {
  if (typeof window === 'undefined') return;

  const alreadySeeded = localStorage.getItem(DB_INITIALIZED_KEY);

  if (!localStorage.getItem(PRODUCTS_STORAGE_KEY)) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }

  if (!localStorage.getItem(REVIEWS_STORAGE_KEY)) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
  }

  if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
  }

  if (!isSupabaseConfigured && !alreadySeeded && !localStorage.getItem(ORDERS_STORAGE_KEY)) {
    // Seed an initial demo order ONLY on first brand-new launch when offline/no Supabase
    const sampleOrder: Order = {
      id: 'ord-9021',
      order_number: 'NX-89210',
      customer: {
        name: 'Arjun Sen',
        email: 'arjun@example.com',
        phone: '+91 9876543210',
        address: '14 Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
      items: [
        {
          product_id: 'nx-01',
          product_name: 'Diatomite Fast-Dry Stone Caddy',
          price: 1199,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop',
        },
      ],
      subtotal: 1199,
      shipping_fee: 0,
      discount_amount: 0,
      total_amount: 1199,
      payment_method: 'UPI',
      payment_status: 'verified',
      upi_reference_id: 'UPI-9830219482',
      order_status: 'PROCESSING',
      courier_name: 'BlueDart Express',
      tracking_number: 'BD89201948IN',
      tracking_url: 'https://www.bluedart.com',
      estimated_delivery: '3-4 business days',
      status_history: [
        {
          status: 'ORDER PLACED',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          note: 'Order placed by customer via UPI',
        },
        {
          status: 'CONFIRMED',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
          note: 'UPI Payment verified by concierge',
        },
        {
          status: 'PROCESSING',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          note: 'Order packed in eco-friendly protective packaging',
        },
      ],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    };
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([sampleOrder]));
    localStorage.setItem(DB_INITIALIZED_KEY, 'true');
  }
}

// Call on module load
initializeLocalDb();

// Cross-tab and realtime database listeners
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === ORDERS_STORAGE_KEY) {
      window.dispatchEvent(new Event('nexora_orders_updated'));
    }
    if (e.key === PRODUCTS_STORAGE_KEY) {
      window.dispatchEvent(new Event('nexora_products_updated'));
    }
    if (e.key === REVIEWS_STORAGE_KEY) {
      window.dispatchEvent(new Event('nexora_reviews_updated'));
    }
    if (e.key === SETTINGS_STORAGE_KEY) {
      window.dispatchEvent(new Event('nexora_settings_updated'));
    }
  });

  if (isSupabaseConfigured && supabase) {
    try {
      supabase
        .channel('public_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          window.dispatchEvent(new Event('nexora_orders_updated'));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          window.dispatchEvent(new Event('nexora_products_updated'));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          window.dispatchEvent(new Event('nexora_reviews_updated'));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
          window.dispatchEvent(new Event('nexora_settings_updated'));
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscription skipped:', e);
    }
  }
}

export const db = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data));
          return data as Product[];
        }
        if (error) {
          console.warn('Supabase getProducts returned an error, using local database:', error);
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local database', e);
      }
    }
    initializeLocalDb();
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    let savedProduct = product;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').upsert(product).select().single();
        if (!error && data) {
          savedProduct = data as Product;
        } else if (error) {
          console.error('Supabase saveProduct error:', error);
        }
      } catch (e) {
        console.warn('Supabase saveProduct failed', e);
      }
    }
    const products = await this.getProducts();
    const existingIndex = products.findIndex(p => p.id === savedProduct.id);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...savedProduct, updated_at: new Date().toISOString() };
    } else {
      products.unshift({ ...savedProduct, created_at: new Date().toISOString() });
    }
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('nexora_products_updated'));
    return savedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Supabase deleteProduct error:', error);
        }
      } catch (e) {
        console.warn('Supabase deleteProduct failed', e);
      }
    }
    // Update local storage directly
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const products: Product[] = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('nexora_products_updated'));
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<CategoryInfo[]> {
    return CATEGORIES;
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const deletedRaw = localStorage.getItem(DELETED_ORDERS_KEY);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    initializeLocalDb();
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const localOrders: Order[] = stored ? JSON.parse(stored) : [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const remoteOrders = (data as Order[]).filter(o => 
            !deletedIds.includes(o.id) && !deletedIds.includes(o.order_number)
          );

          // Intelligent merge: If local order has more status history entries or newer timestamp, preserve local status
          const merged: Order[] = remoteOrders.map(remote => {
            const local = localOrders.find(l => l.id === remote.id || l.order_number === remote.order_number);
            if (!local) return remote;

            const localHistLen = local.status_history?.length || 0;
            const remoteHistLen = remote.status_history?.length || 0;

            const lastLocalTime = local.status_history?.[localHistLen - 1]?.timestamp 
              ? new Date(local.status_history[localHistLen - 1].timestamp).getTime() 
              : 0;
            const lastRemoteTime = remote.status_history?.[remoteHistLen - 1]?.timestamp 
              ? new Date(remote.status_history[remoteHistLen - 1].timestamp).getTime() 
              : 0;

            // If local status change was made more recently, keep local status & details
            if (localHistLen > remoteHistLen || lastLocalTime > lastRemoteTime) {
              return {
                ...remote,
                ...local,
                order_status: local.order_status,
                delivered_at: local.delivered_at || remote.delivered_at,
                return_request: local.return_request || remote.return_request,
                status_history: local.status_history || remote.status_history,
              };
            }

            return {
              ...local,
              ...remote,
              delivered_at: remote.delivered_at || local.delivered_at,
              return_request: remote.return_request || local.return_request,
            };
          });

          // Include any local orders that haven't synced to Supabase yet
          for (const l of localOrders) {
            if (!merged.some(m => m.id === l.id || m.order_number === l.order_number)) {
              if (!deletedIds.includes(l.id) && !deletedIds.includes(l.order_number)) {
                merged.unshift(l);
              }
            }
          }

          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.warn('Supabase getOrders failed', e);
      }
    }

    return localOrders.filter(o => 
      !deletedIds.includes(o.id) && !deletedIds.includes(o.order_number)
    );
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id || o.order_number.toLowerCase() === id.toLowerCase()) || null;
  },

  async getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    return orders.find(o => {
      const matchNum = o.order_number.toUpperCase() === cleanNum || o.id.toUpperCase() === cleanNum;
      const orderPhoneClean = o.customer.phone.replace(/\D/g, '').slice(-10);
      return matchNum && orderPhoneClean === cleanPhone;
    }) || null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status_history'>): Promise<Order> {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NX-${randomSuffix}`;
    const id = `ord-${Date.now().toString(36)}`;
    
    const newOrder: Order = {
      ...orderData,
      id,
      order_number: orderNumber,
      order_status: 'ORDER PLACED',
      status_history: [
        {
          status: 'ORDER PLACED',
          timestamp: new Date().toISOString(),
          note: orderData.payment_method === 'UPI' 
            ? 'Order placed with UPI reference. Awaiting manual verification.' 
            : 'Order placed with Cash on Delivery.',
        },
      ],
      created_at: new Date().toISOString(),
    };

    const myOrdersRaw = localStorage.getItem('nexora_my_orders');
    const myOrders: string[] = myOrdersRaw ? JSON.parse(myOrdersRaw) : [];
    if (!myOrders.includes(orderNumber)) {
      myOrders.unshift(orderNumber);
      localStorage.setItem('nexora_my_orders', JSON.stringify(myOrders));
    }
    if (orderData.customer?.phone) {
      localStorage.setItem('nexora_customer_phone', orderData.customer.phone);
    }
    if (orderData.customer?.email) {
      localStorage.setItem('nexora_customer_email', orderData.customer.email);
    }

    let savedOrder: Order = newOrder;
    if (isSupabaseConfigured && supabase) {
      try {
        const cleanPayload = Object.fromEntries(
          Object.entries(newOrder).filter(([_, v]) => v !== undefined)
        );
        const { data, error } = await supabase.from('orders').insert(cleanPayload).select().single();
        if (!error && data) {
          savedOrder = data as Order;
        } else if (error) {
          console.error('Supabase createOrder error:', error);
        }
      } catch (e) {
        console.warn('Supabase createOrder failed, saving locally', e);
      }
    }

    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = stored ? JSON.parse(stored) : [];
    orders.unshift(savedOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    // Deduct stock count for ordered products and broadcast update
    try {
      const allProducts = await this.getProducts();
      for (const item of savedOrder.items) {
        const productIndex = allProducts.findIndex(p => p.id === item.product_id);
        if (productIndex >= 0) {
          const currentProd = allProducts[productIndex];
          const updatedStock = Math.max(0, currentProd.stock_count - item.quantity);
          const updatedProd = {
            ...currentProd,
            stock_count: updatedStock,
            in_stock: updatedStock > 0,
          };
          allProducts[productIndex] = updatedProd;
          if (isSupabaseConfigured && supabase) {
            await supabase.from('products').update({
              stock_count: updatedStock,
              in_stock: updatedStock > 0,
            }).eq('id', currentProd.id);
          }
        }
      }
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(allProducts));
    } catch (e) {
      console.warn('Stock update failed:', e);
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
    window.dispatchEvent(new Event('nexora_products_updated'));
    return savedOrder;
  },

  async getCustomerOrders(query?: { phone?: string; email?: string }): Promise<Order[]> {
    const allOrders = await this.getOrders();
    const myOrdersRaw = localStorage.getItem('nexora_my_orders');
    const localOrderNumbers: string[] = myOrdersRaw ? JSON.parse(myOrdersRaw) : [];

    const phoneFilter = query?.phone?.trim().replace(/\D/g, '').slice(-10);
    const emailFilter = query?.email?.trim().toLowerCase();

    // If query provided, search by phone or email
    if (phoneFilter || emailFilter) {
      return allOrders.filter(o => {
        const matchPhone = phoneFilter && o.customer?.phone?.replace(/\D/g, '').slice(-10) === phoneFilter;
        const matchEmail = emailFilter && o.customer?.email?.trim().toLowerCase() === emailFilter;
        return matchPhone || matchEmail;
      });
    }

    // Otherwise, return orders matching locally saved order numbers on this device
    if (localOrderNumbers.length > 0) {
      const matched = allOrders.filter(o => 
        localOrderNumbers.includes(o.order_number) || localOrderNumbers.includes(o.id)
      );
      return matched;
    }

    // Default: empty list when no local orders or lookup filter
    return [];
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    courierData?: { courier_name?: string; tracking_number?: string; tracking_url?: string; estimated_delivery?: string },
    paymentStatus?: 'pending' | 'verified' | 'failed'
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    const newHistoryItem = {
      status,
      timestamp: new Date().toISOString(),
      note: `Status updated to ${status}${courierData?.courier_name ? ` via ${courierData.courier_name}` : ''}`,
    };

    const isNowDelivered = status === 'DELIVERED';
    const deliveredAtTimestamp = isNowDelivered 
      ? (currentOrder.delivered_at || new Date().toISOString()) 
      : currentOrder.delivered_at;

    const updatedOrder: Order = {
      ...currentOrder,
      order_status: status,
      payment_status: paymentStatus || currentOrder.payment_status,
      courier_name: courierData?.courier_name !== undefined ? courierData.courier_name : currentOrder.courier_name,
      tracking_number: courierData?.tracking_number !== undefined ? courierData.tracking_number : currentOrder.tracking_number,
      tracking_url: courierData?.tracking_url !== undefined ? courierData.tracking_url : currentOrder.tracking_url,
      estimated_delivery: courierData?.estimated_delivery !== undefined ? courierData.estimated_delivery : currentOrder.estimated_delivery,
      delivered_at: deliveredAtTimestamp,
      status_history: [...currentOrder.status_history, newHistoryItem],
    };

    // Save locally immediately to prevent race conditions
    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        const cleanPayload = Object.fromEntries(
          Object.entries(updatedOrder).filter(([_, v]) => v !== undefined)
        );
        const res = await supabase
          .from('orders')
          .update(cleanPayload)
          .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);

        if (res.error) {
          console.warn('Supabase update full payload error, retrying fallback:', res.error);
          const fallbackPayload: Record<string, any> = {
            order_status: status,
            payment_status: paymentStatus || currentOrder.payment_status,
            status_history: updatedOrder.status_history,
          };
          if (courierData?.courier_name !== undefined) fallbackPayload.courier_name = courierData.courier_name;
          if (courierData?.tracking_number !== undefined) fallbackPayload.tracking_number = courierData.tracking_number;
          if (courierData?.tracking_url !== undefined) fallbackPayload.tracking_url = courierData.tracking_url;
          if (courierData?.estimated_delivery !== undefined) fallbackPayload.estimated_delivery = courierData.estimated_delivery;

          await supabase
            .from('orders')
            .update(fallbackPayload)
            .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);
        }
      } catch (e) {
        console.warn('Supabase updateOrder network error:', e);
      }
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
    return updatedOrder;
  },

  async submitReturnRequest(
    orderId: string,
    returnData: Omit<ReturnRequest, 'request_id' | 'requested_at'>
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    const eligibility = getReturnEligibility(currentOrder);
    if (!eligibility.isEligible && !eligibility.hasExistingReturn) {
      throw new Error(eligibility.message || 'This order is not eligible for return under the 7-day policy.');
    }

    const fullReturnRequest: ReturnRequest = {
      ...returnData,
      id: `ret-${Date.now().toString(36)}`,
      request_id: `ret-${Date.now().toString(36)}`,
      status: 'REQUESTED',
      requested_at: new Date().toISOString(),
    };

    const status: OrderStatus = 'RETURN_REQUESTED';
    const newHistoryItem = {
      status,
      timestamp: new Date().toISOString(),
      note: `Return/Replacement requested by customer (${returnData.return_type.toLowerCase() === 'replacement' ? 'Free Replacement' : 'Refund'}). Reason: ${returnData.reason}`,
    };

    const updatedOrder: Order = {
      ...currentOrder,
      order_status: status,
      return_request: fullReturnRequest,
      status_history: [...currentOrder.status_history, newHistoryItem],
    };

    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        const cleanPayload = Object.fromEntries(
          Object.entries(updatedOrder).filter(([_, v]) => v !== undefined)
        );
        const res = await supabase
          .from('orders')
          .update(cleanPayload)
          .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);

        if (res.error) {
          console.warn('Supabase submitReturnRequest error, attempting fallback update:', res.error);
          await supabase
            .from('orders')
            .update({
              order_status: status,
              status_history: updatedOrder.status_history,
            })
            .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);
        }
      } catch (e) {
        console.warn('Supabase submitReturnRequest failed', e);
      }
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
    return updatedOrder;
  },

  async processAdminReturnAction(
    orderId: string,
    action: 'approve' | 'reject' | 'pickup' | 'refund' | 'replace',
    data?: {
      admin_notes?: string;
      rejection_reason?: string;
      pickup_date?: string;
      pickup_scheduled_date?: string;
      pickup_courier?: string;
      pickup_tracking_number?: string;
      refund_transaction_id?: string;
      replacement_courier?: string;
      replacement_tracking?: string;
    }
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    let newStatus: OrderStatus = currentOrder.order_status;
    let requestStatus: ReturnRequest['status'] = 'REQUESTED';
    let note = '';

    const scheduledDate = data?.pickup_scheduled_date || data?.pickup_date;

    if (action === 'approve') {
      newStatus = 'RETURN_APPROVED';
      requestStatus = 'APPROVED';
      note = `Return request approved by concierge.${scheduledDate ? ` Doorstep pickup scheduled on ${scheduledDate}.` : ''}`;
    } else if (action === 'reject') {
      newStatus = 'RETURN_REJECTED';
      requestStatus = 'REJECTED';
      note = `Return request declined by concierge. ${data?.rejection_reason || data?.admin_notes ? `Reason: ${data?.rejection_reason || data?.admin_notes}` : ''}`;
    } else if (action === 'pickup') {
      newStatus = 'RETURN_PICKED_UP';
      requestStatus = 'PICKED_UP';
      note = `Product picked up from customer doorstep via ${data?.pickup_courier || 'courier logistics'}. In inspection.`;
    } else if (action === 'refund') {
      newStatus = 'REFUNDED';
      requestStatus = 'REFUNDED';
      note = `Direct refund settled to customer account. ${data?.refund_transaction_id ? `Txn ID: ${data.refund_transaction_id}` : ''}`;
    } else if (action === 'replace') {
      newStatus = 'REPLACED';
      requestStatus = 'REPLACED';
      note = `Fresh replacement dispatched. ${data?.replacement_courier ? `Courier: ${data.replacement_courier}` : ''} ${data?.replacement_tracking ? `AWB: ${data.replacement_tracking}` : ''}`;
    }

    const updatedReturnRequest: ReturnRequest = currentOrder.return_request
      ? {
          ...currentOrder.return_request,
          id: currentOrder.return_request.id || currentOrder.return_request.request_id || `ret-${Date.now().toString(36)}`,
          status: requestStatus,
          admin_decision_at: new Date().toISOString(),
          admin_notes: data?.admin_notes !== undefined ? data.admin_notes : currentOrder.return_request.admin_notes,
          rejection_reason: data?.rejection_reason !== undefined ? data.rejection_reason : currentOrder.return_request.rejection_reason,
          pickup_date: scheduledDate !== undefined ? scheduledDate : currentOrder.return_request.pickup_date,
          pickup_scheduled_date: scheduledDate !== undefined ? scheduledDate : currentOrder.return_request.pickup_scheduled_date,
          pickup_courier: data?.pickup_courier !== undefined ? data.pickup_courier : currentOrder.return_request.pickup_courier,
          pickup_tracking_number: data?.pickup_tracking_number !== undefined ? data.pickup_tracking_number : currentOrder.return_request.pickup_tracking_number,
          refund_transaction_id: data?.refund_transaction_id !== undefined ? data.refund_transaction_id : currentOrder.return_request.refund_transaction_id,
          replacement_courier: data?.replacement_courier !== undefined ? data.replacement_courier : currentOrder.return_request.replacement_courier,
          replacement_tracking: data?.replacement_tracking !== undefined ? data.replacement_tracking : currentOrder.return_request.replacement_tracking,
        }
      : {
          id: `ret-${Date.now().toString(36)}`,
          request_id: `ret-${Date.now().toString(36)}`,
          status: requestStatus,
          return_type: 'replacement',
          reason: 'Manual admin return action',
          items: currentOrder.items.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, price: i.price })),
          requested_at: new Date().toISOString(),
          admin_decision_at: new Date().toISOString(),
          admin_notes: data?.admin_notes,
          rejection_reason: data?.rejection_reason,
          pickup_date: scheduledDate,
          pickup_scheduled_date: scheduledDate,
          pickup_courier: data?.pickup_courier,
          refund_transaction_id: data?.refund_transaction_id,
          replacement_courier: data?.replacement_courier,
          replacement_tracking: data?.replacement_tracking,
        };

    const newHistoryItem = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note,
    };

    const updatedOrder: Order = {
      ...currentOrder,
      order_status: newStatus,
      return_request: updatedReturnRequest,
      status_history: [...currentOrder.status_history, newHistoryItem],
    };

    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        const cleanPayload = Object.fromEntries(
          Object.entries(updatedOrder).filter(([_, v]) => v !== undefined)
        );
        const res = await supabase
          .from('orders')
          .update(cleanPayload)
          .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);

        if (res.error) {
          console.warn('Supabase processAdminReturnAction error, fallback update:', res.error);
          await supabase
            .from('orders')
            .update({
              order_status: newStatus,
              status_history: updatedOrder.status_history,
            })
            .or(`id.eq.${currentOrder.id},order_number.eq.${currentOrder.order_number}`);
        }
      } catch (e) {
        console.warn('Supabase processAdminReturnAction failed', e);
      }
    }

    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('nexora_orders_updated'));
    return updatedOrder;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const deletedRaw = localStorage.getItem(DELETED_ORDERS_KEY);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = stored ? JSON.parse(stored) : [];
    const targetOrder = orders.find(o => o.id === orderId || o.order_number === orderId);

    if (!deletedIds.includes(orderId)) deletedIds.push(orderId);
    if (targetOrder) {
      if (!deletedIds.includes(targetOrder.id)) deletedIds.push(targetOrder.id);
      if (!deletedIds.includes(targetOrder.order_number)) deletedIds.push(targetOrder.order_number);
    }
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(deletedIds));

    const filtered = orders.filter(o => o.id !== orderId && o.order_number !== orderId);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));

    // Also remove from customer's local list if present
    const myOrdersRaw = localStorage.getItem('nexora_my_orders');
    if (myOrdersRaw) {
      const myOrders: string[] = JSON.parse(myOrdersRaw);
      const updatedMyOrders = myOrders.filter(num => num !== orderId && (!targetOrder || num !== targetOrder.order_number));
      localStorage.setItem('nexora_my_orders', JSON.stringify(updatedMyOrders));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
        await supabase.from('orders').delete().eq('order_number', orderId);
      } catch (e) {
        console.warn('Supabase deleteOrder failed', e);
      }
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
    return true;
  },

  async deleteCompletedOrders(): Promise<number> {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = stored ? JSON.parse(stored) : [];
    const completed = orders.filter(o => o.order_status === 'DELIVERED');
    if (completed.length === 0) return 0;

    const deletedRaw = localStorage.getItem(DELETED_ORDERS_KEY);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    completed.forEach(c => {
      if (!deletedIds.includes(c.id)) deletedIds.push(c.id);
      if (!deletedIds.includes(c.order_number)) deletedIds.push(c.order_number);
    });
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(deletedIds));

    const remaining = orders.filter(o => o.order_status !== 'DELIVERED');
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(remaining));

    // Also clean up local customer orders list
    const completedNumbers = completed.map(c => c.order_number);
    const myOrdersRaw = localStorage.getItem('nexora_my_orders');
    if (myOrdersRaw) {
      const myOrders: string[] = JSON.parse(myOrdersRaw);
      const updatedMyOrders = myOrders.filter(num => !completedNumbers.includes(num));
      localStorage.setItem('nexora_my_orders', JSON.stringify(updatedMyOrders));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').delete().eq('order_status', 'DELIVERED');
      } catch (e) {
        console.warn('Supabase deleteCompletedOrders failed', e);
      }
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
    return completed.length;
  },

  // REVIEWS
  async getReviews(productId?: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (productId) query = query.eq('product_id', productId);
        const { data, error } = await query;
        if (!error && data) return data as Review[];
      } catch (e) {
        console.warn('Supabase getReviews failed', e);
      }
    }
    initializeLocalDb();
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const reviews: Review[] = stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    if (productId) {
      return reviews.filter(r => r.product_id === productId);
    }
    return reviews;
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
        if (!error && data) return data as Review;
      } catch (e) {
        console.warn('Supabase addReview failed', e);
      }
    }

    const reviews = await this.getReviews();
    reviews.unshift(newReview);
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event('nexora_reviews_updated'));
    return newReview;
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
        if (!error && data) return { ...DEFAULT_SITE_SETTINGS, ...data } as SiteSettings;
      } catch (e) {
        console.warn('Supabase getSettings failed', e);
      }
    }
    initializeLocalDb();
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SITE_SETTINGS;
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_settings').upsert({ id: 1, ...settings });
      } catch (e) {
        console.warn('Supabase saveSettings failed', e);
      }
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('nexora_settings_updated'));
    return settings;
  },
};
