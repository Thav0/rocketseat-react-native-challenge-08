import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storedItems = await AsyncStorage.getItem('GoMarket:cart');

      if (storedItems) {
        setProducts(JSON.parse(storedItems));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const prodIndex = products.findIndex(el => el.id === product.id);

      if (prodIndex !== -1) {
        products[prodIndex].quantity += 1;
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updatedProductCart = products.find(product => product.id === id);
      const restProducts = products.filter(product => product.id !== id);

      if (updatedProductCart) {
        setProducts([
          ...restProducts,
          {
            ...updatedProductCart,
            quantity: updatedProductCart.quantity + 1,
          },
        ]);
      } else {
        setProducts(restProducts);
      }

      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProductCart = products.find(product => product.id === id);
      const restProducts = products.filter(product => product.id !== id);

      if (updatedProductCart && updatedProductCart.quantity - 1 > 0) {
        setProducts([
          ...restProducts,
          {
            ...updatedProductCart,
            quantity: updatedProductCart.quantity - 1,
          },
        ]);
      } else {
        setProducts(restProducts);
      }

      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
