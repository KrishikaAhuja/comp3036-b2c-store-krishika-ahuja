"use client"; // makes component run on client (needed for state, events like click, input)

import { useMemo, useState } from "react"; // React hooks
import styles from "./admin-list.module.css"; // CSS module for styling

// Admin page component that shows and manages all posts
export default function AdminList({ posts }: { posts: any[] }) {

  // filter states (store user input values)
  const [content, setContent] = useState(""); // search text for content
  const [tag, setTag] = useState(""); // tag filter input
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(""); // date filter (YYYYMMDD)
  const [sort, setSort] = useState(""); // sorting option
  const [stockStatus, setStockStatus] = useState(""); // stock status filter
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  function formatPrice(value: number | null | undefined) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        posts
          .map((post) => String(post.category ?? "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [posts]);

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

    // filter based on stock status
    if (stockStatus === "in-stock") {
      result = result.filter((p) => (p.stockQuantity ?? 0) > 0);
    } else if (stockStatus === "out-of-stock") {
      result = result.filter((p) => (p.stockQuantity ?? 0) <= 0);
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    // sorting logic
    if (sort === "date-asc") {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } else if (sort === "date-desc") {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } else if (sort === "price-asc") {
      result = [...result].sort(
        (a, b) => (a.priceAud ?? 0) - (b.priceAud ?? 0),
      );
    } else if (sort === "price-desc") {
      result = [...result].sort(
        (a, b) => (b.priceAud ?? 0) - (a.priceAud ?? 0),
      );
    }

    return result; // final filtered + sorted posts
  }, [posts, content, tag, category, date, stockStatus, sort]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* page header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Product Management</h1>

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
              Create Product
            </a>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setFiltersOpen(true)}
          >
            <span aria-hidden="true">Menu</span>
            All Filters
          </button>
        </div>

        {filtersOpen && (
          <button
            type="button"
            className={styles.drawerBackdrop}
            aria-label="Close filter drawer backdrop"
            onClick={() => setFiltersOpen(false)}
          />
        )}

        {filtersOpen && (
          <aside className={`${styles.filtersDrawer} ${styles.filtersDrawerOpen}`}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.filtersTitle}>Filters</h2>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                X
              </button>
            </div>
            <div className={styles.filtersGrid}>

            {/* content search */}
            <div className={styles.fieldGroup}>
              <label htmlFor="content" className={styles.label}>
                Search product
              </label>
              <input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)} // updates state
                className={styles.input}
                placeholder="Search name, description, details..."
              />
            </div>

            {/* tag filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="tag" className={styles.label}>
                Collection
              </label>
              <input
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className={styles.input}
                placeholder="Enter a collection"
              />
            </div>

            {/* date filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="date" className={styles.label}>
                Date added
              </label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                placeholder="YYYYMMDD"
              />
            </div>

            {/* stock status filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="stockStatus" className={styles.label}>
                Stock status
              </label>
              <select
                id="stockStatus"
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className={styles.select}
              >
                <option value="">All</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>

            {/* category filter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="category" className={styles.label}>
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* sorting options */}
            <div className={styles.fieldGroup}>
              <label htmlFor="sort" className={styles.label}>
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={styles.select}
              >
                <option value="">None</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            </div>
          </aside>
        )}

        <section className={styles.productsPanel}>
        {/* number of results */}
        <p className={styles.resultsText}>
          Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>

        {/* if no posts match */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            No products matched your filters.
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
                    <p className={styles.price}>{formatPrice(p.priceAud)}</p>
                    <p className={styles.meta}>{formatTags(p.tags)}</p>
                    <p className={styles.meta}>
                      Added on {formatPostedDate(p.date)}
                    </p>
                    <p className={styles.meta}>Category: {p.category}</p>
                    <p className={styles.meta}>Stock: {p.stockQuantity ?? 0}</p>
                  </div>
                </a>

                <div className={styles.cardFooter}>
                  <div className={styles.statusRow}>
                    <span className={styles.stockBadge}>
                      {(p.stockQuantity ?? 0) > 0 ? "In stock" : "Out of stock"}
                    </span>
                  </div>

                  <div className={styles.actionRow}>
                    <a href={`/post/${p.urlId}`} className={styles.editButton}>
                      Edit
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/posts/${p.id}`, {
                          method: "DELETE",
                        });
                        window.location.reload();
                      }}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </article>
            ))}
          </div>
        )}
        </section>
      </div>
    </main>
  );
}
