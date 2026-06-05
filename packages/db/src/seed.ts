import bcrypt from "bcryptjs";
import { client } from "./client.js"; // imports Prisma client to interact with DB
import { posts } from "./data.js"; // imports sample posts data

const DEFAULT_ADMIN_EMAIL = "admin@book.test";
const DEFAULT_ADMIN_PASSWORD = "AdminPass123!";

const adminUser = {
  name: process.env.ADMIN_NAME || "Admin User",
  email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  password:
    process.env.ADMIN_PASSWORD || process.env.PASSWORD || DEFAULT_ADMIN_PASSWORD,
};

function validateAdminUser() {
  const email = adminUser.email.trim().toLowerCase();
  const password = adminUser.password;

  if (email.endsWith("@example.com")) {
    throw new Error(
      "ADMIN_EMAIL must not use example.com. Set ADMIN_EMAIL to a real admin address before seeding.",
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error(
      "ADMIN_PASSWORD must include uppercase, lowercase, and number characters.",
    );
  }
}

const generatedTestCustomerWhere = {
  role: "CUSTOMER" as const,
  OR: [
    {
      email: {
        endsWith: "@example.com",
      },
    },
    {
      email: {
        endsWith: "@book.test",
      },
    },
    {
      email: {
        startsWith: "real-customer-",
      },
    },
  ],
};

// function to seed (insert) data into the database
export async function seed() {
  console.log("Seeding data"); // log message to show seeding started
  validateAdminUser();

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

      if (post.likes > 0) {
        await tx.like.createMany({
          data: Array.from({ length: post.likes }, (_, i) => ({
            postId: post.id,
            userIP: `192.168.100.${i}`,
          })),
        });
      }
    }
  }, { timeout: 20000 });
}
