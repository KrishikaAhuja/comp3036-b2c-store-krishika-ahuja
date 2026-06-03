"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, getCartItemCount } from "../../functions/cart";

export function CartNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      // Recalculate from storage so the badge stays correct after add/remove/quantity changes.
      setCount(getCartItemCount());
    }

    updateCount();
    // Custom event covers same-tab changes; storage covers changes from another browser tab.
    window.addEventListener(CART_UPDATED_EVENT, updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-gray-700"
    >
      Book Bag ({count})
    </Link>
  );
}
