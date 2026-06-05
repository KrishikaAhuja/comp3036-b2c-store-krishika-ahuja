"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CART_UPDATED_EVENT,
  clearCart,
  getCartItems,
  type CartItem,
} from "../../functions/cart";

type PaymentMethod = "mock_credit_card" | "pay_on_delivery";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  buildingNumber: string;
  streetName: string;
  suburb: string;
  state: string;
  postcode: string;
  paymentMethod: PaymentMethod;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

const initialForm: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  buildingNumber: "",
  streetName: "",
  suburb: "",
  state: "",
  postcode: "",
  paymentMethod: "mock_credit_card",
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function textFromForm(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  return /^0\d{9}$/.test(digits);
}

function validateForm(form: CheckoutForm, items: CartItem[]) {
  if (items.length === 0) {
    return "Your book bag is empty.";
  }

  if (!form.fullName.trim()) {
    return "Full name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }

  if (!form.phone.trim()) {
    return "Phone number is required.";
  }

  if (!isValidPhoneNumber(form.phone)) {
    return "Enter a valid 10-digit Australian phone number.";
  }

  if (!form.buildingNumber.trim()) {
    return "House or building number is required.";
  }

  if (!/^\d+$/.test(form.buildingNumber.trim())) {
    return "House or building number can only contain numbers.";
  }

  if (!form.streetName.trim()) {
    return "Street name is required.";
  }

  if (!/^[A-Za-z ]+$/.test(form.streetName.trim())) {
    return "Street name can only contain letters and spaces.";
  }

  if (!form.suburb.trim()) {
    return "Suburb or area is required.";
  }

  if (!/^[A-Za-z ]+$/.test(form.suburb.trim())) {
    return "Suburb or area can only contain letters and spaces.";
  }

  if (!form.state.trim()) {
    return "State is required.";
  }

  if (!/^[A-Za-z]{2,3}$/.test(form.state.trim())) {
    return "State must be 2 or 3 letters.";
  }

  if (!form.postcode.trim()) {
    return "Postcode is required.";
  }

  if (!/^\d{4}$/.test(form.postcode.trim())) {
    return "Postcode must contain exactly 4 numbers.";
  }

  if (
    form.paymentMethod !== "mock_credit_card" &&
    form.paymentMethod !== "pay_on_delivery"
  ) {
    return "Select a valid payment method.";
  }

  if (form.paymentMethod === "mock_credit_card") {
    const cardNumber = form.cardNumber.trim();
    const cardDigits = cardNumber.replace(/ /g, "");

    if (!form.cardholderName.trim()) {
      return "Cardholder name is required.";
    }

    if (!cardNumber) {
      return "Card number is required.";
    }

    if (!/^[\d ]+$/.test(cardNumber)) {
      return "Card number can only contain numbers and spaces.";
    }

    if (!/^\d{16}$/.test(cardDigits)) {
      return "Card number must contain exactly 16 digits.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiryDate.trim())) {
      return "Expiry date must use MM/YY format.";
    }

    if (!/^\d{3}$/.test(form.cvv.trim())) {
      return "CVV must contain exactly 3 digits.";
    }
  }

  return "";
}

function buildDeliveryAddress(form: CheckoutForm) {
  return [
    `${form.buildingNumber.trim()} ${form.streetName.trim()}`,
    form.suburb.trim(),
    form.state.trim().toUpperCase(),
    form.postcode.trim(),
  ].join(", ");
}

export function CheckoutPageContent({
  customerName,
  customerEmail,
}: {
  customerName: string;
  customerEmail: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    ...initialForm,
    fullName: customerName,
    email: customerEmail,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refreshCart() {
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

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const submittedForm: CheckoutForm = {
      fullName: textFromForm(formData, "fullName"),
      email: textFromForm(formData, "email"),
      phone: textFromForm(formData, "phone"),
      buildingNumber: textFromForm(formData, "buildingNumber"),
      streetName: textFromForm(formData, "streetName"),
      suburb: textFromForm(formData, "suburb"),
      state: textFromForm(formData, "state"),
      postcode: textFromForm(formData, "postcode"),
      paymentMethod: textFromForm(formData, "paymentMethod") as PaymentMethod,
      cardholderName: textFromForm(formData, "cardholderName"),
      cardNumber: textFromForm(formData, "cardNumber"),
      expiryDate: textFromForm(formData, "expiryDate"),
      cvv: textFromForm(formData, "cvv"),
    };

    const validationError = validateForm(submittedForm, items);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          customer: {
            fullName: submittedForm.fullName,
            email: submittedForm.email,
            phone: submittedForm.phone,
            deliveryAddress: buildDeliveryAddress(submittedForm),
          },
          payment: {
            method: submittedForm.paymentMethod,
            cardholderName: submittedForm.cardholderName,
            cardNumber: submittedForm.cardNumber,
            expiryDate: submittedForm.expiryDate,
            cvv: submittedForm.cvv,
          },
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Checkout could not be completed.");
      }

      clearCart();
      window.sessionStorage.setItem(
        "order-confirmation",
        JSON.stringify({
          orderId: result.orderId,
          paymentReference: result.paymentReference,
          status: result.status,
          customerName: submittedForm.fullName.trim(),
          totalAud: result.totalAud,
        }),
      );
      router.push(`/order-confirmation?orderId=${result.orderId}`);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Checkout</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Complete your delivery details and payment.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          data-test-id="checkout-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm dark:border-gray-700"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <span>Full Name</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <span>Email Address</span>
              <input
                name="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <span>Phone Number</span>
              <input
                name="phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <span>Payment Method</span>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value as PaymentMethod)
                }
                className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
              >
                <option value="mock_credit_card">Credit Card</option>
                <option value="pay_on_delivery">Pay on Delivery</option>
              </select>
            </label>
          </div>

          <fieldset className="space-y-4 border-t border-[var(--surface-muted)] pt-5 dark:border-gray-700">
            <legend className="text-sm font-semibold text-[var(--text)]">
              Delivery Address
            </legend>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>House or Building Number</span>
                <input
                  name="buildingNumber"
                  value={form.buildingNumber}
                  onChange={(event) =>
                    updateField("buildingNumber", event.target.value)
                  }
                  inputMode="numeric"
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>Street Name</span>
                <input
                  name="streetName"
                  value={form.streetName}
                  onChange={(event) => updateField("streetName", event.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>Suburb or Area</span>
                <input
                  name="suburb"
                  value={form.suburb}
                  onChange={(event) => updateField("suburb", event.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>State</span>
                <input
                  name="state"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  maxLength={3}
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm uppercase outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)] md:col-span-2">
                <span>Postcode</span>
                <input
                  name="postcode"
                  value={form.postcode}
                  onChange={(event) => updateField("postcode", event.target.value)}
                  inputMode="numeric"
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
            </div>
          </fieldset>

          {form.paymentMethod === "mock_credit_card" ? (
            <div className="grid gap-4 border-t border-[var(--surface-muted)] pt-5 md:grid-cols-2 dark:border-gray-700">
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>Cardholder Name</span>
                <input
                  name="cardholderName"
                  value={form.cardholderName}
                  onChange={(event) =>
                    updateField("cardholderName", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>Card Number</span>
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={(event) => updateField("cardNumber", event.target.value)}
                  inputMode="numeric"
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>Expiry Date (MM/YY)</span>
                <input
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={(event) => updateField("expiryDate", event.target.value)}
                  placeholder="mm/yy"
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <span>CVV</span>
                <input
                  name="cvv"
                  value={form.cvv}
                  onChange={(event) => updateField("cvv", event.target.value)}
                  inputMode="numeric"
                  className="h-11 w-full rounded-md border border-[var(--surface-muted)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] dark:border-gray-700"
                />
              </label>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
          >
            {submitting ? "Processing" : "Place Order"}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[var(--text)]">Order Summary</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Your book bag is empty.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[var(--text)]">{item.title}</p>
                    <p className="text-[var(--text-secondary)]">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--text)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between border-t border-[var(--surface-muted)] pt-4 text-lg font-semibold dark:border-gray-700">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
