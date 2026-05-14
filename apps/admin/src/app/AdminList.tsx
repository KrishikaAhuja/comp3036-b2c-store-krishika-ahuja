"use client"; // makes component run on client (needed for state, events like click, input)

import { useMemo, useState } from "react"; // React hooks
import styles from "./admin-list.module.css"; // CSS module for styling

// Admin page component that shows and manages all posts
export default function AdminList({ posts }: { posts: any[] }) {

  // filter states (store user input values)
  const [content, setContent] = useState(""); // search text for content
  const [tag, setTag] = useState(""); // tag filter input
  const [date, setDate] = useState(""); // date filter (YYYYMMDD)
  const [sort, setSort] = useState(""); // sorting option
  const [visibility, setVisibility] = useState(""); // active/inactive filter

  // converts DDMMYYYY → YYYY-MM-DD so it can be compared with DB date
  function formatDate(value: string) {
    if (value.length !== 8) return value; // if not full date, return original
    const day = value.slice(0, 2);
    const month = value.slice(2, 4);
    const year = value.slice(4, 8);
    return `${year}-${month}-${day}`;
  }

  // formats date nicely for display in UI
  function formatPostedDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // formats tags → adds # and removes extra spaces
  function formatTags(tags: string) {
    return tags
      .split(",")
      .map((t) => `#${t.trim()}`)
      .join(", ");
  }

  // filtering + sorting logic
  // useMemo avoids recalculating unless values change (performance)
  const filtered = useMemo(() => {
    let result = [...posts]; // copy original posts

    // filter by content (checks multiple fields)
    if (content) {
      const search = content.toLowerCase();

      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search) ||
          p.urlId.toLowerCase().includes(search),
      );
    }

    // filter by tag (matches starting letters of tags)
    if (tag) {
      const search = tag.toLowerCase();

      result = result.filter((p) =>
        p.tags
          .toLowerCase()
          .split(",")
          .map((t: string) => t.trim())
          .some((t: string) => t.startsWith(search)),
      );
    }

    // partial date filter (user typing)
    if (date.length < 8) {
      result = result.filter((p) =>
        new Date(p.date)
          .toISOString()
          .slice(0, 10)
          .replaceAll("-", "")
          .startsWith(date),
      );
    }

    // full date filter (show posts from selected date onwards)
    if (date.length === 8) {
      const formatted = formatDate(date);
      const targetDate = new Date(formatted);

      result = result.filter((p) => new Date(p.date) >= targetDate);
    }

    // filter based on active/inactive status
    if (visibility === "active") {
      result = result.filter((p) => p.active);
    } else if (visibility === "inactive") {
      result = result.filter((p) => !p.active);
    }

    // sorting logic
    if (sort === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === "date-asc") {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } else if (sort === "date-desc") {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return result; // final filtered + sorted posts
  }, [posts, content, tag, date, visibility, sort]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* page header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Admin of Full Stack Blog</h1>

          <div className={styles.headerActions}>
            {/* logout button → deletes auth cookie and redirects */}
            <button
              type="button"
              className={styles.logoutButton}
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                window.location.href = "/";
              }}
            >
              Logout
            </button>

            {/* navigate to create post page */}
            <a href="/posts/create" className={styles.createButton}>
              Create Post
            </a>
          </div>
        </div>

        {/* filter section */}
        <section className={styles.filtersCard}>
          <div className={styles.filtersGrid}>

            {/* content search */}
            <div className={styles.fieldGroup}>
              <label htmlFor="content" className={styles.label}>
                Filter by Content:
              </label>
              <input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)} // updates state
                className={styles.input}
                placeholder="Search title, description, content..."
              />
            </div>

            {/* tag filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="tag" className={styles.label}>
                Filter by Tag:
              </label>
              <input
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className={styles.input}
                placeholder="Enter a tag"
              />
            </div>

            {/* date filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="date" className={styles.label}>
                Filter by Date Created:
              </label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                placeholder="YYYYMMDD"
              />
            </div>

            {/* visibility filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="visibility" className={styles.label}>
                Visibility:
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={styles.select}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* sorting options */}
            <div className={styles.fieldGroup}>
              <label htmlFor="sort" className={styles.label}>
                Sort By:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={styles.select}
              >
                <option value="">None</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="date-asc">Oldest First</option>
                <option value="date-desc">Newest First</option>
              </select>
            </div>

          </div>
        </section>

        {/* number of results */}
        <p className={styles.resultsText}>
          Showing {filtered.length} post{filtered.length === 1 ? "" : "s"}
        </p>

        {/* if no posts match */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            No posts matched your filters.
          </div>
        ) : (
          <div className={styles.postsGrid}>

            {/* render each post card */}
            {filtered.map((p) => (
              <article key={p.id} className={styles.card}>

                {/* click → go to post detail */}
                <a href={`/post/${p.urlId}`} className={styles.cardLink}>
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className={styles.cardImage}
                  />

                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{p.title}</h2>
                    <p className={styles.meta}>{formatTags(p.tags)}</p>
                    <p className={styles.meta}>
                      Posted on {formatPostedDate(p.date)}
                    </p>
                    <p className={styles.meta}>{p.category}</p>
                  </div>
                </a>

                {/* activate/deactivate post */}
                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/posts/${p.id}`, {
                        method: "PATCH", // toggles active status
                      });
                      window.location.reload(); // reload to update UI
                    }}
                    className={`${styles.statusButton} ${
                      p.active ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}