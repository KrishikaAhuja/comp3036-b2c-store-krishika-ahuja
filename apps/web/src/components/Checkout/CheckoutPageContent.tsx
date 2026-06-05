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

type CheckoutFieldErrors = Partial<Record<keyof CheckoutForm, string>>;

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

  return /^\d{10}$/.test(digits);
}

function validateForm(form: CheckoutForm, items: CartItem[]) {
  const fieldErrors: CheckoutFieldErrors = {};

  if (items.length === 0) {
    return { formError: "Your book bag is empty.", fieldErrors };
  }

  if (!form.fullName.trim()) {
    fieldErrors.fullName = "Required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = "Enter a valid email address";
  }

  if (!form.phone.trim()) {
    fieldErrors.phone = "Required";
  } else if (!isValidPhoneNumber(form.phone)) {
    fieldErrors.phone = "Enter any 10 digits";
  }

  if (!form.buildingNumber.trim()) {
    fieldErrors.buildingNumber = "Required";
  }

  if (!form.streetName.trim()) {
    fieldErrors.streetName = "Required";
  }

  if (!form.suburb.trim()) {
    fieldErrors.suburb = "Required";
  }

  if (!form.state.trim()) {
    fieldErrors.state = "Required";
  }

  if (!form.postcode.trim()) {
    fieldErrors.postcode = "Required";
  }

  if (
    form.paymentMethod !== "mock_credit_card" &&
    form.paymentMethod !== "pay_on_delivery"
  ) {
    fieldErrors.paymentMethod = "Select a valid payment method";
  }

  if (form.paymentMethod === "mock_credit_card") {
    const cardNumber = form.cardNumber.trim();
    const cardDigits = cardNumber.replace(/ /g, "");

    if (!form.cardholderName.trim()) {
      fieldErrors.cardholderName = "Required";
    }

    if (!cardNumber) {
      fieldErrors.cardNumber = "Required";
    } else if (!/^[\d ]+$/.test(cardNumber)) {
      fieldErrors.cardNumber = "Numbers and spaces only";
    } else if (!/^\d{16}$/.test(cardDigits)) {
      fieldErrors.cardNumber = "Must be exactly 16 digits";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiryDate.trim())) {
      fieldErrors.expiryDate = "Use MM/YY";
    }

    if (!/^\d{3}$/.test(form.cvv.trim())) {
      fieldErrors.cvv = "Must be exactly 3 digits";
    }
  }

  return { formError: "", fieldErrors };
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
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
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
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fieldClass(field: keyof CheckoutForm) {
    const borderClass = fieldErrors[field]
      ? "border-gray-500 focus:border-gray-600"
      : "border-[var(--surface-muted)] focus:border-[var(--accent)] dark:border-gray-700";

    return `h-11 w-full rounded-md border ${borderClass} bg-[var(--background)] px-3 text-sm outline-none`;
  }

  function FieldHeader({
    label,
    field,
  }: {
    label: string;
    field: keyof CheckoutForm;
  }) {
    return (
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {fieldErrors[field] ? (
          <span className="text-xs font-medium text-gray-500">
            {fieldErrors[field]}
          </span>
        ) : null}
      </span>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
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

    const validation = validateForm(submittedForm, items);

    if (validation.formError || Object.keys(validation.fieldErrors).length > 0) {
      setError(validation.formError);
      setFieldErrors(validation.fieldErrors);
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
        setError(result.error || "Checkout could not be completed.");
        return;
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

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          data-test-id="checkout-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm dark:border-gray-700"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <FieldHeader label="Full Name" field="fullName" />
              <input
                name="fullName"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className={fieldClass("fullName")}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <FieldHeader label="Email Address" field="email" />
              <input
                name="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={fieldClass("email")}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <FieldHeader label="Phone Number" field="phone" />
              <input
                name="phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={fieldClass("phone")}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
              <FieldHeader label="Payment Method" field="paymentMethod" />
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value as PaymentMethod)
                }
                className={fieldClass("paymentMethod")}
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
                <FieldHeader
                  label="House or Building Number"
                  field="buildingNumber"
                />
                <input
                  name="buildingNumber"
                  value={form.buildingNumber}
                  onChange={(event) =>
                    updateField("buildingNumber", event.target.value)
                  }
                  className={fieldClass("buildingNumber")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="Street Name" field="streetName" />
                <input
                  name="streetName"
                  value={form.streetName}
                  onChange={(event) => updateField("streetName", event.target.value)}
                  className={fieldClass("streetName")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="Suburb or Area" field="suburb" />
                <input
                  name="suburb"
                  value={form.suburb}
                  onChange={(event) => updateField("suburb", event.target.value)}
                  className={fieldClass("suburb")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="State" field="state" />
                <input
                  name="state"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  className={fieldClass("state")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)] md:col-span-2">
                <FieldHeader label="Postcode" field="postcode" />
                <input
                  name="postcode"
                  value={form.postcode}
                  onChange={(event) => updateField("postcode", event.target.value)}
                  className={fieldClass("postcode")}
                />
              </label>
            </div>
          </fieldset>

          {form.paymentMethod === "mock_credit_card" ? (
            <div className="grid gap-4 border-t border-[var(--surface-muted)] pt-5 md:grid-cols-2 dark:border-gray-700">
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="Cardholder Name" field="cardholderName" />
                <input
                  name="cardholderName"
                  value={form.cardholderName}
                  onChange={(event) =>
                    updateField("cardholderName", event.target.value)
                  }
                  className={fieldClass("cardholderName")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="Card Number" field="cardNumber" />
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={(event) => updateField("cardNumber", event.target.value)}
                  inputMode="numeric"
                  className={fieldClass("cardNumber")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="Expiry Date (MM/YY)" field="expiryDate" />
                <input
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={(event) => updateField("expiryDate", event.target.value)}
                  placeholder="mm/yy"
                  className={fieldClass("expiryDate")}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[var(--text)]">
                <FieldHeader label="CVV" field="cvv" />
                <input
                  name="cvv"
                  value={form.cvv}
                  onChange={(event) => updateField("cvv", event.target.value)}
                  inputMode="numeric"
                  className={fieldClass("cvv")}
                />
              </label>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm font-medium text-gray-600">{error}</p>
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
