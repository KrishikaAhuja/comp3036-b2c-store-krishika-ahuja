"use client";

import { useState } from "react";
import { addCartItem, type CartProduct } from "../../functions/cart";
import { getCustomerLoginUrl } from "../../utils/customerAuthRedirect";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
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
        // Short feedback confirms the click without navigating away from the catalogue.
        window.setTimeout(() => setAdded(false), 1200);
      })
      .catch(() => {
        window.location.assign(getCustomerLoginUrl(nextPath));
      });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--surface)] dark:border-[var(--accent)]"
    >
      {added ? "Added to Book Bag" : "Add to Book Bag"}
    </button>
  );
}
