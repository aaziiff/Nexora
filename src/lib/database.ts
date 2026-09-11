import { Product, CategoryInfo, Order, Review, SiteSettings, OrderStatus } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, DEFAULT_SITE_SETTINGS } from '../data/products';
import { supabase, isSupabaseConfigured } from './supabase';

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

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const validOrders = (data as Order[]).filter(o => 
            !deletedIds.includes(o.id) && !deletedIds.includes(o.order_number)
          );
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(validOrders));
          return validOrders;
        }
      } catch (e) {
        console.warn('Supabase getOrders failed', e);
      }
    }
    initializeLocalDb();
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const localOrders: Order[] = stored ? JSON.parse(stored) : [];
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
      window.dispatchEvent(new Event('nexora_products_updated'));
    } catch (e) {
      console.warn('Failed to update product stock on order creation:', e);
    }

    window.dispatchEvent(new Event('nexora_orders_updated'));
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
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    const newHistoryItem = {
      status,
      timestamp: new Date().toISOString(),
      note: `Status updated to ${status}${courierData?.courier_name ? ` via ${courierData.courier_name}` : ''}`,
    };

    const updatedOrder: Order = {
      ...currentOrder,
      order_status: status,
      payment_status: paymentStatus || currentOrder.payment_status,
      courier_name: courierData?.courier_name !== undefined ? courierData.courier_name : currentOrder.courier_name,
      tracking_number: courierData?.tracking_number !== undefined ? courierData.tracking_number : currentOrder.tracking_number,
      tracking_url: courierData?.tracking_url !== undefined ? courierData.tracking_url : currentOrder.tracking_url,
      estimated_delivery: courierData?.estimated_delivery !== undefined ? courierData.estimated_delivery : currentOrder.estimated_delivery,
      status_history: [...currentOrder.status_history, newHistoryItem],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update(updatedOrder).eq('id', orderId);
      } catch (e) {
        console.warn('Supabase updateOrder failed', e);
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
        if (!error && data) return data as SiteSettings;
      } catch (e) {
        console.warn('Supabase getSettings failed', e);
      }
    }
    initializeLocalDb();
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SITE_SETTINGS;
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
