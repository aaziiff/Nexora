import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { db } from '../lib/database';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nexora_cart_items_v1';
const FREE_SHIPPING_THRESHOLD = 0;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Synchronize cart across multiple open browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const updatedItems = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(updatedItems);
        } catch {
          setItems([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Validate cart items against active catalog products:
  // If a product was deleted by the admin, remove it from the cart automatically.
  useEffect(() => {
    let isMounted = true;
    const validateCartProducts = async () => {
      try {
        const activeProducts = await db.getProducts();
        if (!isMounted || !activeProducts) return;
        const activeIds = new Set(activeProducts.map((p) => p.id));
        setItems((prevItems) => {
          const validItems = prevItems
            .filter((item) => activeIds.has(item.product.id))
            .map((item) => {
              const latestProduct = activeProducts.find((p) => p.id === item.product.id);
              return latestProduct ? { ...item, product: latestProduct } : item;
            });

          if (validItems.length !== prevItems.length) {
            try {
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));
            } catch (e) {
              console.error('Failed to sync cart localStorage', e);
            }
            return validItems;
          }
          return prevItems;
        });
      } catch (err) {
        console.warn('Cart product validation skipped:', err);
      }
    };

    validateCartProducts();
    window.addEventListener('nexora_products_updated', validateCartProducts);
    return () => {
      isMounted = false;
      window.removeEventListener('nexora_products_updated', validateCartProducts);
    };
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prevItems, { product, quantity }];
    });

    setLastAddedItem({ product, quantity });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear cart from localStorage', e);
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingRemaining = 0;
  const freeShippingProgress = 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        freeShippingProgress,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
