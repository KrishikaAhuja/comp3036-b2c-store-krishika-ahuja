import { client } from "@repo/db/client";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatPaymentStatus(status: string) {
  return status === "PAID" ? "Paid" : "Not paid";
}

export default async function PurchaseHistoryPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/auth?next=/purchase-history");
  }

  const orders = await client.db.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      items: {
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Purchase History
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Review your completed bookstore orders and payment status.
          </p>
        </div>

        {orders.length === 0 ? (
          <section className="rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-6 shadow-sm dark:border-gray-700">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              No purchases yet
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Orders will appear here after checkout.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm dark:border-gray-700"
              >
                <div className="flex flex-col gap-3 border-b border-[var(--surface-muted)] pb-4 md:flex-row md:items-start md:justify-between dark:border-gray-700">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text)]">
                      Order #{order.id}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-semibold">
                    <span className="rounded-full bg-[#f1f1ed] px-3 py-1 text-[var(--accent)]">
                      {formatPaymentStatus(order.status)}
                    </span>
                    <span className="rounded-full bg-[#f1f1ed] px-3 py-1 text-[var(--text)]">
                      {formatPrice(order.totalAud)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[var(--text-secondary)]">
                          Qty {item.quantity} x {formatPrice(item.unitPriceAud)}
                        </p>
                      </div>
                      <p className="font-semibold text-[var(--text)]">
                        {formatPrice(item.lineTotalAud)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
