"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import CartOverlay from "@/components/CartOverlay";
import type { ShopProduct, ShopVariant } from "@/lib/shopify";

export type CartLine = { variant: ShopVariant; title: string; image: ShopProduct["featuredImage"]; quantity: number };
const CartContext = createContext<{
  cart: CartLine[];
  setCart: Dispatch<SetStateAction<CartLine[]>>;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  return <CartContext.Provider value={{ cart, setCart, itemCount, isOpen, setIsOpen }}>{children}<CartOverlay /></CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
