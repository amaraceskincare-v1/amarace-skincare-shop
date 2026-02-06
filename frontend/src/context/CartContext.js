import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Load from localStorage for guests
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          if (parsedCart && Array.isArray(parsedCart.items)) {
            // Filter out broken items (missing product details)
            const validItems = parsedCart.items.filter(item =>
              item.product && item.product.name && item.product.price !== undefined
            );
            setCart({ ...parsedCart, items: validItems });
          } else {
            setCart({ items: [] });
          }
        } catch (e) {
          setCart({ items: [] });
        }
      } else {
        setCart({ items: [] });
      }
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // If unauthorized, clear cart
      if (error.response?.status === 401) {
        setCart({ items: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (user) {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data);
    } else {
      // Guest cart stored in localStorage
      const localCart = { ...cart };
      if (!localCart.items) localCart.items = [];

      const existingItem = localCart.items.find(item => item.product?._id === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Store essential product data to avoid "NaN" and broken images
        const newItem = {
          product: productData || { _id: productId },
          quantity
        };
        localCart.items.push(newItem);
      }
      setCart(localCart);
      localStorage.setItem('cart', JSON.stringify(localCart));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    // Optimistic UI Update
    const prevCart = { ...cart };
    const updatedItems = cart.items.map(item =>
      item.product?._id === productId ? { ...item, quantity } : item
    );
    setCart({ ...cart, items: updatedItems });

    if (user) {
      try {
        const { data } = await api.put('/cart/update', { productId, quantity });
        setCart(data);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        setCart(prevCart); // Rollback on error
      }
    } else {
      // Guest logic
      const localCart = { ...cart, items: updatedItems };
      setCart(localCart);
      localStorage.setItem('cart', JSON.stringify(localCart));
    }
  };

  const removeFromCart = async (productId) => {
    // Optimistic UI Update
    const prevCart = { ...cart };
    const updatedItems = cart.items.filter(item => item.product?._id !== productId);
    setCart({ ...cart, items: updatedItems });

    if (user) {
      try {
        const { data } = await api.delete(`/cart/remove/${productId}`);
        setCart(data);
      } catch (error) {
        console.error('Failed to remove item:', error);
        setCart(prevCart); // Rollback on error
      }
    } else {
      // Guest logic
      const localCart = { ...cart, items: updatedItems };
      setCart(localCart);
      localStorage.setItem('cart', JSON.stringify(localCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } else {
      setCart({ items: [] });
      localStorage.removeItem('cart');
    }
  };

  const cartTotal = cart.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};