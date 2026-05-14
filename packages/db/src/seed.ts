import { client } from "./client.js"; // imports Prisma client to interact with DB
import { posts } from "./data.js"; // imports sample posts data

// function to seed (insert) data into the database
export async function seed() {
  console.log("🌱 Seeding data"); // log message to show seeding started

  // delete all existing likes first (to avoid foreign key issues)
  await client.db.like.deleteMany();

  // delete all existing posts (clean database)
  await client.db.post.deleteMany();

  // loop through each post from data.js
  for (const post of posts) {

    // create a new post in the database
    await client.db.post.create({
      data: {
        id: post.id, // manually setting id (from seed data)
        title: post.title, // post title
        content: post.content // full content
,
        category: post.category, // category name
        description: post.description, // short description
        imageUrl: post.imageUrl, // image URL
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

      await client.db.like.create({
        data: {
          postId: post.id, // connects like to the post
          userIP: `192.168.100.${i}`, // fake unique user IP for each like
        },
      });
    }
  }
}