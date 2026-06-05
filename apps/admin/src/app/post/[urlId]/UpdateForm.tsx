"use client"; // Client component, so hooks and button clicks work

import Link from "next/link"; // Link back to admin home
import { marked } from "marked"; // Converts markdown to HTML for preview
import { useRef, useState } from "react"; // React hooks
import styles from "./update-form.module.css"; // CSS module styles

export default function UpdateForm({ post }: { post: any }) { // Receives one post object
  const [title, setTitle] = useState(post.title); // Current title value
  const [description, setDescription] = useState(post.description); // Current description value
  const [content, setContent] = useState(post.content); // Current markdown content
  const [imageUrl, setImageUrl] = useState(post.imageUrl); // Current image URL
  const [category, setCategory] = useState(post.category); // Current category
  const [priceAud, setPriceAud] = useState(String(post.priceAud ?? 0));
  const [stockQuantity, setStockQuantity] = useState(
    String(post.stockQuantity ?? 0),
  );
  const [active] = useState(Boolean(post.active));
  const [success, setSuccess] = useState(""); // Success message after saving

  const [errors, setErrors] = useState<Record<string, string>>({}); // Field validation errors
  const [saveError, setSaveError] = useState(""); // General save error
  const [showPreview, setShowPreview] = useState(false); // Shows preview or textarea
  const [cursorPos, setCursorPos] = useState(0); // Saves cursor position when preview opens

  const contentRef = useRef<HTMLTextAreaElement | null>(null); // Reference to content textarea
  const isNewPost = post.id === 0; // id 0 means create mode

  function validate() { // Checks form before saving
    const newErrors: Record<string, string> = {}; // Stores errors

    if (!title.trim()) newErrors.title = "Book title is required";
    if (!category.trim()) newErrors.category = "Category is required"; // Category required

    if (!description.trim()) { // Description required
      newErrors.description = "Description is required";
    } else if (description.length > 200) { // Description max length
      newErrors.description =
        "Description is too long. Maximum is 200 characters";
    }

    if (!content.trim()) newErrors.content = "Book details are required";
    const parsedPrice = Number(priceAud);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      newErrors.priceAud = "Price must be 0 or more";
    }

    const parsedStock = Number(stockQuantity);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      newErrors.stockQuantity = "Stock must be a whole number 0 or more";
    }

    if (!imageUrl.trim()) { // Image URL required
      newErrors.imageUrl = "Image URL is required";
    } else if (!/^https?:\/\/.+/.test(imageUrl)) { // Must start with http/https
      newErrors.imageUrl = "This is not a valid URL";
    }

    setErrors(newErrors); // Show errors on screen

    if (Object.keys(newErrors).length > 0) { // Stop saving if errors exist
      setSaveError("Please fix the errors before saving");
      return false;
    }

    setSaveError(""); // Clear old save error
    return true; // Form is valid
  }

  async function handleSave() { // Runs when Save button is clicked
    if (!validate()) return; // Stop if form is invalid

    const response = await fetch("/api/posts", {
      method: isNewPost ? "POST" : "PUT", // POST creates, PUT updates
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: post.id,
        title,
        description,
        content,
        tags: "",
        imageUrl,
        category,
        priceAud: Number(priceAud),
        stockQuantity: Number(stockQuantity),
        active,
      }),
    });

    if (!response.ok) { // If API fails
      setSaveError("Something went wrong while saving");
      return;
    }

    setSuccess("Book saved successfully"); // Show success message
    setSaveError(""); // Clear error message

    const previousUrl = document.referrer ? new URL(document.referrer) : null;
    const previousPath =
      previousUrl && previousUrl.origin === window.location.origin
        ? `${previousUrl.pathname}${previousUrl.search}`
        : "/inventory";

    window.location.assign(previousPath);
  }

  function handleTogglePreview() { // Switches between edit and preview
    if (!showPreview) {
      const pos = contentRef.current?.selectionStart ?? 0; // Save cursor position
      setCursorPos(pos);
      setShowPreview(true);
      return;
    }

    setShowPreview(false);

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.focus(); // Focus textarea again
        contentRef.current.setSelectionRange(cursorPos, cursorPos); // Restore cursor
      }
    });
  }

  const previewHtml = String(marked.parse(content || "")); // Markdown preview HTML

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Inventory editor</p>
            <h1 className={styles.title}>
              {isNewPost ? "Create Book" : "Update Book"}
            </h1>
            <p className={styles.subtitle}>
              {isNewPost
                ? "Add a new title to the bookstore catalog."
                : "Update catalog details, cover art, pricing, and stock."}
            </p>
          </div>
          <Link href="/inventory" className={styles.exitButton}>
            Back to Inventory
          </Link>
        </div>

        <div className={styles.editorGrid}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Book record</p>
                <h2>Catalog Details</h2>
              </div>
              <span className={active ? styles.activeBadge : styles.inactiveBadge}>
                {active ? "Active in store" : "Draft"}
              </span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="title" className={styles.label}>
                  Book Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. The Midnight Library"
                />
                {errors.title && <p className={styles.error}>{errors.title}</p>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="category" className={styles.label}>
                  Genre
                </label>
                <input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.input}
                  placeholder="Mystery, Romance, Fantasy..."
                />
                {errors.category && <p className={styles.error}>{errors.category}</p>}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="description" className={styles.label}>
                  Short Description
                </label>
                <span className={styles.charCount}>{description.length}/200</span>
              </div>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="A short customer-facing summary."
              />
              {errors.description && (
                <p className={styles.error}>{errors.description}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="content" className={styles.label}>
                Book Details
              </label>

              {!showPreview ? (
                <textarea
                  id="content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textareaLarge}
                  placeholder="Add author, edition notes, and book details."
                />
              ) : (
                <div
                  data-test-id="content-preview"
                  className={styles.previewBox}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}

              {errors.content && (
                <p className={styles.error}>{errors.content}</p>
              )}

              <button
                type="button"
                onClick={handleTogglePreview}
                className={styles.secondaryButton}
              >
                {showPreview ? "Close Preview" : "Preview"}
              </button>
            </div>
          </section>

          <aside className={styles.sidePanel}>
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Cover</p>
                  <h2>Book Cover</h2>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="imageUrl" className={styles.label}>
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://..."
                />
                {errors.imageUrl && (
                  <p className={styles.error}>{errors.imageUrl}</p>
                )}

                {imageUrl.trim() ? (
                  <div className={styles.coverFrame}>
                    <img
                      data-test-id="image-preview"
                      src={imageUrl}
                      alt="preview"
                      className={styles.imagePreview}
                    />
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>No cover preview</div>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Selling</p>
                  <h2>Pricing & Stock</h2>
                </div>
              </div>
              <div className={styles.formGridCompact}>
            <div className={styles.fieldGroup}>
              <label htmlFor="priceAud" className={styles.label}>
                Price AUD
              </label>
              <input
                id="priceAud"
                type="number"
                min="0"
                step="1"
                value={priceAud}
                onChange={(e) => setPriceAud(e.target.value)}
                className={styles.input}
              />
              {errors.priceAud && (
                <p className={styles.error}>{errors.priceAud}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="stockQuantity" className={styles.label}>
                Stock Quantity
              </label>
              <input
                id="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={styles.input}
              />
              {errors.stockQuantity && (
                <p className={styles.error}>{errors.stockQuantity}</p>
              )}
            </div>
              </div>

            {success && <p className={styles.success}>{success}</p>}
            {saveError && <p className={styles.error}>{saveError}</p>}

            <div className={styles.buttonRow}>
              <button
                type="button"
                onClick={handleSave}
                className={styles.primaryButton}
              >
                {isNewPost ? "Create Book" : "Save Changes"}
              </button>

              <Link href="/inventory" className={styles.exitButton}>
                Cancel
              </Link>
            </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
