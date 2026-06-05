import { client } from "@repo/db/client";

export const visibleCustomerWhere = {
  role: "CUSTOMER" as const,
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

export type BestSellingBookSummary = {
  postId: number | null;
  title: string;
  urlId: string;
  quantitySold: number;
  revenueAud: number;
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

export async function getBestSellingBooks(
  limit = 5,
): Promise<BestSellingBookSummary[]> {
  const items = await client.db.orderItem.groupBy({
    by: ["postId", "title", "urlId"],
    _sum: {
      quantity: true,
      lineTotalAud: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  return items.map((item) => ({
    postId: item.postId,
    title: item.title,
    urlId: item.urlId,
    quantitySold: item._sum.quantity ?? 0,
    revenueAud: item._sum.lineTotalAud ?? 0,
  }));
}
