"use client"; // Client component, so hooks and button clicks work

import Link from "next/link"; // Link back to admin home
import { marked } from "marked"; // Converts markdown to HTML for preview
import { useRef, useState } from "react"; // React hooks
import styles from "./update-form.module.css"; // CSS module styles

export default function UpdateForm({ post }: { post: any }) { // Receives one post object
  const [title, setTitle] = useState(post.title); // Current title value
  const [description, setDescription] = useState(post.description); // Current description value
  const [content, setContent] = useState(post.content); // Current markdown content
  const [tags, setTags] = useState(post.tags); // Current tags
  const [imageUrl, setImageUrl] = useState(post.imageUrl); // Current image URL
  const [category, setCategory] = useState(post.category); // Current category
  const [success, setSuccess] = useState(""); // Success message after saving

  const [errors, setErrors] = useState<Record<string, string>>({}); // Field validation errors
  const [saveError, setSaveError] = useState(""); // General save error
  const [showPreview, setShowPreview] = useState(false); // Shows preview or textarea
  const [cursorPos, setCursorPos] = useState(0); // Saves cursor position when preview opens

  const contentRef = useRef<HTMLTextAreaElement | null>(null); // Reference to content textarea
  const isNewPost = post.id === 0; // id 0 means create mode

  function validate() { // Checks form before saving
    const newErrors: Record<string, string> = {}; // Stores errors

    if (!title.trim()) newErrors.title = "Title is required"; // Title required
    if (!category.trim()) newErrors.category = "Category is required"; // Category required

    if (!description.trim()) { // Description required
      newErrors.description = "Description is required";
    } else if (description.length > 200) { // Description max length
      newErrors.description =
        "Description is too long. Maximum is 200 characters";
    }

    if (!content.trim()) newErrors.content = "Content is required"; // Content required
    if (!tags.trim()) newErrors.tags = "At least one tag is required"; // Tags required

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
        tags,
        imageUrl,
        category,
      }),
    });

    if (!response.ok) { // If API fails
      setSaveError("Something went wrong while saving");
      return;
    }

    setSuccess("Post updated successfully"); // Show success message
    setSaveError(""); // Clear error message
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
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              {isNewPost ? "Create Post" : "Update Post"}
            </h1>
          </div>

          <div className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="title" className={styles.label}>
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
              />
              {errors.title && <p className={styles.error}>{errors.title}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="category" className={styles.label}>
                Category
              </label>
              <input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.input}
              />
              {errors.category && <p className={styles.error}>{errors.category}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="description" className={styles.label}>
                  Description
                </label>
                <span className={styles.charCount}>{description.length}/200</span>
              </div>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
              />
              {errors.description && (
                <p className={styles.error}>{errors.description}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="content" className={styles.label}>
                Content
              </label>

              {!showPreview ? (
                <textarea
                  id="content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textareaLarge}
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

            <div className={styles.fieldGroup}>
              <label htmlFor="tags" className={styles.label}>
                Tags
              </label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={styles.input}
              />
              {errors.tags && <p className={styles.error}>{errors.tags}</p>}
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
              />
              {errors.imageUrl && (
                <p className={styles.error}>{errors.imageUrl}</p>
              )}

              {imageUrl.trim() ? (
                <img
                  data-test-id="image-preview"
                  src={imageUrl}
                  alt="preview"
                  className={styles.imagePreview}
                />
              ) : (
                <div className={styles.imagePlaceholder}>No image preview</div>
              )}
            </div>

            {success && <p>{success}</p>}
            {saveError && <p className={styles.error}>{saveError}</p>}

            <div className={styles.buttonRow}>
              <button
                type="button"
                onClick={handleSave}
                className={styles.primaryButton}
              >
                Save
              </button>

              <Link href="/" className={styles.exitButton}>
                Exit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}