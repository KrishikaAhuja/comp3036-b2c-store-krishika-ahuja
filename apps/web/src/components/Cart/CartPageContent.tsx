"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CART_UPDATED_EVENT,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "../../functions/cart";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CartPageContent() {
  const [items, setItems] = useState<CartItem[]>([]);

  function refreshCart() {
    // localStorage is the source of truth for the current customer's cart.
    setItems(getCartItems());
  }

  useEffect(() => {
    refreshCart();
    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener("storage", refreshCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

  // Memoize the total so it is recalculated only when cart items change.
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  function changeQuantity(productId: number, quantity: number) {
    // Quantity 0 is allowed here because the cart helper removes non-positive rows.
    updateCartItemQuantity(productId, quantity);
    refreshCart();
  }

  function removeItem(productId: number) {
    removeCartItem(productId);
    refreshCart();
  }

  if (items.length === 0) {
    // Empty state keeps the cart route useful even before the customer adds products.
    return (
      <div className="rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-sm dark:border-gray-700">
        <h1 className="text-2xl font-semibold">Book Bag</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Your book bag is empty.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--accent-hover)]"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          Book Bag
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Review your reads before checkout.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] shadow-sm dark:border-gray-700">
        <div className="hidden grid-cols-[1fr_7rem_10rem_7rem_7rem] gap-4 border-b border-gray-200 px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] md:grid dark:border-gray-700">
          <span>Book</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_7rem_10rem_7rem_7rem] md:items-center"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : null}
                <Link
                  href={`/post/${item.urlId}`}
                  className="font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
                >
                  {item.title}
                </Link>
              </div>

              <p className="text-sm text-[var(--text)]">
                <span className="font-semibold md:hidden">Price: </span>
                {formatPrice(item.price)}
              </p>

              <div className="flex h-10 w-fit items-center overflow-hidden rounded-md border border-gray-300 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => changeQuantity(item.id, item.quantity - 1)}
                  className="h-10 w-10 text-lg font-semibold transition hover:bg-[var(--surface-muted)] dark:hover:bg-gray-800"
                  aria-label={`Decrease ${item.title} quantity`}
                >
                  -
                </button>
                <span className="min-w-10 px-3 text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item.id, item.quantity + 1)}
                  className="h-10 w-10 text-lg font-semibold transition hover:bg-[var(--surface-muted)] dark:hover:bg-gray-800"
                  aria-label={`Increase ${item.title} quantity`}
                >
                  +
                </button>
              </div>

              <p className="text-sm font-semibold text-[var(--text)]">
                <span className="font-semibold md:hidden">Subtotal: </span>
                {formatPrice(item.price * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="h-10 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm md:w-80 dark:border-gray-700">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Continue to checkout to enter delivery and payment details.
          </p>
          <Link
            href="/checkout"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
