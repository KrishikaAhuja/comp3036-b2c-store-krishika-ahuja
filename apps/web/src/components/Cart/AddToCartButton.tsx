"use client";

import { useState } from "react";
import { addCartItem, type CartProduct } from "../../functions/cart";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addCartItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700"
    >
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
