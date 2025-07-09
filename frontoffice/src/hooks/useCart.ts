import { useState, useEffect } from 'react';
import { OrderedProduct } from '../models';
import { CartService } from '../app/services/cart.service';

export const useCart = () => {
  const [cart, setCart] = useState<OrderedProduct[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCart = () => {
      const storedCart = CartService.getCart();
      setCart(storedCart);
      setCartCount(CartService.getCartCount());
    };

    loadCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return { cart, cartCount };
};
