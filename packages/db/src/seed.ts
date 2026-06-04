import bcrypt from "bcryptjs";
import { client } from "./client.js"; // imports Prisma client to interact with DB
import { posts } from "./data.js"; // imports sample posts data

const adminUser = {
  name: process.env.ADMIN_NAME || "Admin User",
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || process.env.PASSWORD || "123",
};

const generatedTestCustomerWhere = {
  role: "CUSTOMER" as const,
  OR: [
    {
      AND: [
        { email: { startsWith: "cart-" } },
        { email: { endsWith: "@example.com" } },
      ],
    },
    {
      AND: [
        { email: { startsWith: "api-customer-" } },
        { email: { endsWith: "@example.com" } },
      ],
    },
    {
      AND: [
        { email: { startsWith: "customer-" } },
        { email: { endsWith: "@example.com" } },
      ],
    },
  ],
};

// function to seed (insert) data into the database
export async function seed() {
  console.log("Seeding data"); // log message to show seeding started

  const adminPasswordHash = await bcrypt.hash(adminUser.password, 10);

  await client.db.$transaction(async (tx) => {
    await tx.user.upsert({
      where: {
        email: adminUser.email,
      },
      update: {
        name: adminUser.name,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
      create: {
        name: adminUser.name,
        email: adminUser.email,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });

    // delete all existing likes first (to avoid foreign key issues)
    await tx.like.deleteMany();

    await tx.$executeRawUnsafe('DELETE FROM "OrderItem"');
    await tx.$executeRawUnsafe('DELETE FROM "Order"');
    await tx.user.deleteMany({
      where: generatedTestCustomerWhere,
    });

    // delete all existing posts (clean database)
    await tx.post.deleteMany();

    // loop through each post from data.js
    for (const post of posts) {
      // create a new post in the database
      await tx.post.create({
        data: {
          id: post.id, // manually setting id (from seed data)
          title: post.title, // post title
          content: post.content, // full content
          category: post.category, // category name
          description: post.description, // short description
          imageUrl: post.imageUrl, // image URL
          priceAud: post.priceAud ?? 0, // product price in AUD
          stockQuantity: post.stockQuantity ?? 0, // available stock
          tags: post.tags
            .split(",") // split tags by comma
            .map((p) => p.trim()) // remove spaces
            .join(","), // join back as clean string
          urlId: post.urlId, // unique URL id
          active: post.active, // whether post is visible
          date: post.date, // post date
          views: post.views, // initial views count
        },
      });

      // create likes for this post
      // runs loop based on number of likes in seed data
      for (let i = 0; i < post.likes; i++) {
        await tx.like.create({
          data: {
            postId: post.id,
            userIP: `192.168.100.${i}`,
          },
        });
      }
    }
  });
}
