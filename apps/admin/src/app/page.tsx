import { client } from "@repo/db/client"; // imports the Prisma database client so we can read posts from the database
import { isLoggedIn } from "../utils/auth"; // imports the login check function
import {
  getBestSellingBooks,
  getRecentOrders,
  visibleCustomerWhere,
} from "./adminData";
import styles from "./page.module.css"; // imports CSS styles for this page
import AdminList from "./AdminList"; // imports the admin list component that displays all posts

export const dynamic = "force-dynamic";

// This type describes the props received by the Home page.
// searchParams contains values from the URL query string.
// Example: /admin?error=invalid means searchParams.error will be "invalid".
// This is used to show an error message when the password is wrong.
type HomeProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

// This is the main admin page component.
// It is async because it needs to wait for the login check,
// the URL search parameters, and the database posts.
export default async function Home({ searchParams }: HomeProps) {
  // Checks if the user is already logged in.
  // This usually checks whether the auth cookie exists and is valid.
  const loggedIn = await isLoggedIn();

  // Gets the URL query parameters.
  // For example, it can read ?error=invalid after a failed login.
  const params = await searchParams;

  // This becomes true only when the URL has ?error=invalid.
  // It is used to decide whether to show the incorrect password message.
  const showError = params?.error === "invalid";

  // If the user is not logged in, show the login form instead of the admin page.
  if (!loggedIn) {
    return (
      <main className={styles.main}>
        {/* This form sends the password to the /api/auth route using POST. */}
        <form action="/api/auth" method="post">
          <h1>Bookstore Admin Sign In</h1>

          {/* Show this message only when the login failed. */}
          {showError && (
            <p className={styles.errorMessage}>
              Incorrect email or password. Please try again.
            </p>
          )}

          <label htmlFor="email">Email</label>

          <input id="email" name="email" type="email" />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />

          {/* This button submits the login form. */}
          <button type="submit">Sign In</button>
        </form>
      </main>
    );
  }

  // If the user is logged in, load all posts from the database.
  // Likes are included so the admin list has access to each post's likes data if needed.
  // Posts are ordered by newest first.
  const dbPosts = await client.db.post.findMany({
    include: {
      Likes: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const [customerCount, recentOrders, bestSellingBooks] = await Promise.all([
    client.db.user.count({
      where: visibleCustomerWhere,
    }),
    getRecentOrders(5),
    getBestSellingBooks(5),
  ]);

  // Pass the database posts into AdminList so it can display, filter, and manage them.
  return (
    <AdminList
      posts={dbPosts}
      stats={{
        customerCount,
      }}
      recentOrders={recentOrders}
      bestSellingBooks={bestSellingBooks}
    />
  );
}
