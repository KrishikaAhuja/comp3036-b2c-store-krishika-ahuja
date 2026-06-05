"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Confirmation = {
  orderId: number;
  paymentReference: string;
  status?: string;
  customerName: string;
  totalAud: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPaymentStatus(status?: string) {
  return status === "NOT_PAID" ? "Not paid" : "Paid";
}

function getConfirmationMessage(status?: string) {
  return status === "NOT_PAID"
    ? "Order received. Payment is due on delivery."
    : "Payment successful. Thank you for your purchase.";
}

export function OrderConfirmationContent() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("order-confirmation");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Confirmation;
      setConfirmation(parsed);
    } catch {
      setConfirmation(null);
    }
  }, []);

  return (
    <div className="rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-6 shadow-sm dark:border-gray-700">
      <h1 className="text-2xl font-semibold text-[var(--text)]">
        Order Confirmation
      </h1>
      <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
        {getConfirmationMessage(confirmation?.status)}
      </p>

      {confirmation ? (
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--text-secondary)]">
              Order Number
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--text)]">
              #{confirmation.orderId}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text-secondary)]">
              Transaction ID
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--text)]">
              {confirmation.paymentReference}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text-secondary)]">
              Payment Status
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatPaymentStatus(confirmation.status)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text-secondary)]">
              Customer Name
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--text)]">
              {confirmation.customerName}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text-secondary)]">
              Total Amount
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatPrice(confirmation.totalAud)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 text-sm text-[var(--text-secondary)]">
          Your order has been received.
        </p>
      )}

      <Link
        href="/purchase-history"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--accent-hover)]"
      >
        View Purchase History
      </Link>
    </div>
  );
}
