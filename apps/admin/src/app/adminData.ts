import { client } from "@repo/db/client";

export const visibleCustomerWhere = {
  role: "CUSTOMER" as const,
  NOT: [
    {
      email: {
        endsWith: "@example.com",
      },
    },
  ],
};

export async function getAdminShellStats() {
  const posts = await client.db.post.findMany({
    select: {
      active: true,
      stockQuantity: true,
    },
  });

  return {
    activeBooks: posts.filter((post) => post.active).length,
    outOfStockCount: posts.filter((post) => (post.stockQuantity ?? 0) <= 0)
      .length,
  };
}

export type AdminOrderSummary = {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentReference: string | null;
  totalAud: number;
  itemCount: number;
  createdAt: Date;
};

export async function getRecentOrders(limit = 5): Promise<AdminOrderSummary[]> {
  const orders = await client.db.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return orders.map((order) => ({
    id: order.id,
    customerName: order.user.name,
    customerEmail: order.user.email,
    status: order.status,
    paymentReference: order.paymentReference,
    totalAud: order.totalAud,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    createdAt: order.createdAt,
  }));
}
