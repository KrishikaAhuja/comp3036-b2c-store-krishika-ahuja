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
