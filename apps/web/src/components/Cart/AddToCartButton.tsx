"use client";

import { useEffect, useState } from "react";
import {
  addCartItem,
  CART_UPDATED_EVENT,
  getCartItems,
  type CartProduct,
} from "../../functions/cart";
import { getCustomerLoginUrl } from "../../utils/customerAuthRedirect";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);
  const outOfStock = (product.stockQuantity ?? 1) <= 0;

  useEffect(() => {
    function syncAddedState() {
      setAdded(getCartItems().some((item) => item.id === product.id));
    }

    syncAddedState();
    window.addEventListener(CART_UPDATED_EVENT, syncAddedState);
    window.addEventListener("storage", syncAddedState);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncAddedState);
      window.removeEventListener("storage", syncAddedState);
    };
  }, [product.id]);

  function handleAddToCart() {
    if (outOfStock) {
      return;
    }

    const nextPath = `${window.location.pathname}${window.location.search}`;

    fetch("/api/auth/me")
      .then((response) => {
        if (!response.ok) {
          window.location.assign(getCustomerLoginUrl(nextPath));
          return;
        }

        // Store only the product fields needed to rebuild the cart in the browser.
        addCartItem(product);
        setAdded(true);
      })
      .catch(() => {
        window.location.assign(getCustomerLoginUrl(nextPath));
      });
  }

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={handleAddToCart}
      className={
        outOfStock
          ? "inline-flex h-10 cursor-not-allowed items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-4 text-sm font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          : "inline-flex h-10 items-center justify-center rounded-md border border-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--surface)] dark:border-[var(--accent)]"
      }
    >
      {outOfStock ? "Out of Stock" : added ? "Added to Book Bag" : "Add to Book Bag"}
    </button>
  );
}
