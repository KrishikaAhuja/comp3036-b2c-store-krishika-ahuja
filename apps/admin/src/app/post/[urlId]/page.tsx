import { client } from "@repo/db/client"; // Prisma client used to get post data from the database
import { isLoggedIn } from "../../../utils/auth"; // Checks if the admin is logged in
import UpdateForm from "./UpdateForm";
import pageStyles from "../../page.module.css";

export default async function Page({ // This page receives a dynamic route param
  params,
}: {
  params: Promise<{ urlId: string }>; // params is a Promise, so we await it
}) {
  const { urlId } = await params; // urlId comes from the URL, like /post/my-post
  const loggedIn = await isLoggedIn(); // Checks the JWT cookie

  // If not logged in, show the login form
  if (!loggedIn) {
    return (
      <main className={pageStyles.main}>
        <h1 className={pageStyles.title}>Sign in to Bookstore Admin</h1>

        <form action="/api/auth" method="post" className={pageStyles.form}>
          <label htmlFor="email" className={pageStyles.label}>
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            className={pageStyles.input}
          />

          <label htmlFor="password" className={pageStyles.label}>
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            className={pageStyles.input}
          />

          <button type="submit" className={pageStyles.button}>
            Sign In
          </button>
        </form>
      </main>
    );
  }

  // Find the post from the database using its urlId
  const post = await client.db.post.findUnique({
    where: { urlId },
  });

  // If no matching post exists, show fallback
  if (!post) {
    return <main>Book not found</main>;
  }

  // Send the database post into the update form
  return <UpdateForm post={post} />;
}
