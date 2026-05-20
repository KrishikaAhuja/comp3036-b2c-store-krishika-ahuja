export type CartProduct = {
  id: number;
  urlId: string;
  title: string;
  price: number;
  imageUrl?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export const CART_STORAGE_KEY = "storefront-cart";
export const CART_UPDATED_EVENT = "storefront-cart-updated";

function canUseStorage() {
  // The cart runs only in the browser, so guard localStorage for server rendering.
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredCart(): CartItem[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate stored data before using it so a broken localStorage value cannot crash the cart page.
    return parsed
      .filter((item): item is CartItem => {
        return (
          typeof item?.id === "number" &&
          typeof item?.urlId === "string" &&
          typeof item?.title === "string" &&
          typeof item?.price === "number" &&
          typeof item?.quantity === "number" &&
          item.quantity > 0
        );
      })
      .map((item) => ({
        ...item,
        quantity: Math.floor(item.quantity),
      }));
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  // Notify cart badges and the cart page that browser storage has changed in this tab.
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItems() {
  return readStoredCart();
}

export function getCartItemCount() {
  return readStoredCart().reduce((total, item) => total + item.quantity, 0);
}

export function addCartItem(product: CartProduct) {
  const items = readStoredCart();
  const existingItem = items.find((item) => item.id === product.id);

  // Adding the same product again increases quantity instead of duplicating rows.
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }

  writeStoredCart(items);
}

export function updateCartItemQuantity(productId: number, quantity: number) {
  const nextQuantity = Math.floor(quantity);
  const items = readStoredCart()
    .map((item) =>
      item.id === productId ? { ...item, quantity: nextQuantity } : item,
    )
    .filter((item) => item.quantity > 0);

  writeStoredCart(items);
}

export function removeCartItem(productId: number) {
  writeStoredCart(readStoredCart().filter((item) => item.id !== productId));
}
