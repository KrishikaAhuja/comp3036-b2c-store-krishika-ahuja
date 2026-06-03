"use client";

import { useMemo, useState } from "react";
import styles from "../admin-list.module.css";

type AdminPost = {
  id: number;
  urlId: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  priceAud: number | null;
  stockQuantity: number | null;
  date: Date | string;
};

export function InventoryTable({ posts }: { posts: AdminPost[] }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [stockStatus, setStockStatus] = useState("");

  function formatPostedDate(dateValue: Date | string) {
    return new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatPrice(value: number | null | undefined) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  function getStockLabel(quantity: number) {
    if (quantity <= 0) return "Out";
    if (quantity <= 3) return "Low";
    return "Ready";
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

  const filtered = useMemo(() => {
    let result = [...posts];

    if (content) {
      const search = content.toLowerCase();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(search),
      );
    }

    if (date) {
      result = result.filter(
        (post) => new Date(post.date).toISOString().slice(0, 10) === date,
      );
    }

    if (stockStatus === "in-stock") {
      result = result.filter((post) => (post.stockQuantity ?? 0) > 0);
    } else if (stockStatus === "out-of-stock") {
      result = result.filter((post) => (post.stockQuantity ?? 0) <= 0);
    }

    if (category) {
      result = result.filter((post) => post.category === category);
    }

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
    } else if (sort === "stock-asc") {
      result = [...result].sort(
        (a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0),
      );
    }

    return result;
  }, [posts, content, category, date, stockStatus, sort]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Products</p>
          <h2>Book Inventory</h2>
        </div>
        <p className={styles.resultsText}>
          Showing {filtered.length} of {posts.length}
        </p>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.fieldGroup}>
          <label htmlFor="content" className={styles.label}>
            Search
          </label>
          <input
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={styles.input}
            placeholder="Title"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="category" className={styles.label}>
            Genre
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={styles.select}
          >
            <option value="">All genres</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="stockStatus" className={styles.label}>
            Stock
          </label>
          <select
            id="stockStatus"
            value={stockStatus}
            onChange={(event) => setStockStatus(event.target.value)}
            className={styles.select}
          >
            <option value="">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="date" className={styles.label}>
            Date Released
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="sort" className={styles.label}>
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className={styles.select}
          >
            <option value="date-desc">Newest release</option>
            <option value="date-asc">Oldest release</option>
            <option value="price-asc">Price low</option>
            <option value="price-desc">Price high</option>
            <option value="stock-asc">Lowest stock</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>No books matched your filters.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.inventoryTable}>
            <thead>
              <tr>
                <th>Book</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Released</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => {
                const stock = post.stockQuantity ?? 0;
                const stockLabel = getStockLabel(stock);

                return (
                  <tr key={post.id}>
                    <td>
                      <div className={styles.bookCell}>
                        <img src={post.imageUrl} alt={post.title} />
                        <div>
                          <strong>{post.title}</strong>
                          <small>{post.urlId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{post.category}</td>
                    <td>{formatPrice(post.priceAud)}</td>
                    <td>{stock}</td>
                    <td>
                      <span
                        className={
                          stockLabel === "Ready"
                            ? styles.readyBadge
                            : stockLabel === "Low"
                              ? styles.lowBadge
                              : styles.outBadge
                        }
                      >
                        {stockLabel}
                      </span>
                    </td>
                    <td>{formatPostedDate(post.date)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <a
                          href={`/post/${post.urlId}`}
                          className={styles.editButton}
                        >
                          Edit
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/posts/${post.id}`, {
                              method: "DELETE",
                            });
                            window.location.reload();
                          }}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
