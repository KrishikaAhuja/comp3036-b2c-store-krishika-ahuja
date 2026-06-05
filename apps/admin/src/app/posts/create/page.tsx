import { isLoggedIn } from "../../../utils/auth";
import UpdateForm from "../../post/[urlId]/UpdateForm";
import pageStyles from "../../page.module.css";

export const dynamic = "force-dynamic";

export default async function Page() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return (
      <main className={pageStyles.main}>
        <h1 className={pageStyles.title}>Bookstore Admin Sign In</h1>

        <form
          action="/api/login"
          method="post"
          className={pageStyles.form}
        >
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
            minLength={8}
            required
            className={pageStyles.input}
          />

          <button type="submit" className={pageStyles.button}>
            Sign In
          </button>
        </form>
      </main>
    );
  }
//fake blank post object coz UpdateForm expects a full Post
  const emptyPost = {
    id: 0, //This is what UpdateForm uses to detect that it is creating a new post instead of updating an existing one.
    title: "",
    description: "",
    content: "",
    tags: "",
    imageUrl: "",
    date: new Date(),
    category: "",
    priceAud: 0,
    stockQuantity: 0,
    active: true,
    urlId: "",
    views: 0,
    likes: 0,
  };

  return <UpdateForm post={emptyPost} />; //render as new-post mode
}
