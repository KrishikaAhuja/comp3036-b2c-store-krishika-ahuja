import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await seed();
});

test.describe("ADMIN UPDATE SCREEN", () => {
  test(
    "Authorisation",
    {
      tag: "@a2",
    },
    async ({ page }) => {
      await page.goto("/post/no-front-end-framework-is-the-best");

      // UPDATE SCREEN > Shows login screen if not logged
      await expect(
        page.getByText("Sign in to your account", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "Update product form",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      const saveButton = await userPage.getByText("Save");

      // UPDATE SCREEN > There must be the following fields which must be validated for errors:

      // UPDATE SCREEN > Product Name

      await userPage.getByLabel("Product Name").clear();
      await saveButton.click();

      await expect(userPage.getByText("Product name is required")).toBeVisible();
      await userPage.getByLabel("Product Name").fill("New product");
      await saveButton.click();
      await expect(userPage.getByText("Product name is required")).not.toBeVisible();

      // UPDATE SCREEN > Description

      await userPage.getByLabel("Description").clear();
      await saveButton.click();

      await expect(userPage.getByText("Description is required")).toBeVisible();
      await userPage.getByLabel("Description").fill("New Description");
      await saveButton.click();
      await expect(
        userPage.getByText("Description is required"),
      ).not.toBeVisible();

      // cannot be longer than 200
      await userPage.getByLabel("Description").fill("a".repeat(201));
      await saveButton.click();
      await expect(
        userPage.getByText(
          "Description is too long. Maximum is 200 characters",
        ),
      ).toBeVisible();

      await userPage.getByLabel("Description").fill("a".repeat(200));
      await saveButton.click();
      await expect(
        userPage.getByText(
          "Description is too long. Maximum is 200 characters",
        ),
      ).not.toBeVisible();

      // UPDATE SCREEN > Product Details

      await userPage.getByLabel("Product Details").clear();
      await saveButton.click();

      await expect(userPage.getByText("Product details are required")).toBeVisible();
      await userPage.getByLabel("Product Details").fill("New product details");
      await saveButton.click();
      await expect(userPage.getByText("Product details are required")).not.toBeVisible();

      // UPDATE SCREEN > Image

      await userPage.getByLabel("Image URL").clear();
      await saveButton.click();

      // required
      await expect(userPage.getByText("Image URL is required")).toBeVisible();

      // invalid
      await userPage.getByLabel("Image URL").fill("some url");
      await saveButton.click();
      await expect(userPage.getByText("This is not a valid URL")).toBeVisible();

      await userPage
        .getByLabel("Image URL")
        .fill("http://example.com/image.jpg");
      await saveButton.click();
      await expect(
        userPage.getByText("Image URL is required"),
      ).not.toBeVisible();

      // UPDATE SCREEN > Collections

      await userPage.getByLabel("Collections").clear();
      await saveButton.click();

      await expect(
        userPage.getByText("At least one collection is required"),
      ).toBeVisible();
      await userPage.getByLabel("Collections").fill("Collection");
      await saveButton.click();
      await expect(
        userPage.getByText("At least one collection is required"),
      ).not.toBeVisible();
    },
  );

  test(
    "Save product form",
    {
      tag: "@a3",
    },
    async ({ userPage }) => {
      await seed();
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      // BACKEND / ADMIN / UPDATE SCREEN > Logged in user can save product changes to database, if the form is validated

      await userPage.getByLabel("Product Name").fill("New product");
      await userPage.getByLabel("Description").fill("New Description");
      await userPage.getByLabel("Product Details").fill("New Content");
      await userPage
        .getByLabel("Image URL")
        .fill("http://example.com/image.jpg");
      await userPage.getByLabel("Collections").fill("Collection");
      await userPage.getByLabel("Price").fill("499");
      await userPage.getByLabel("Stock Quantity").fill("14");
      await userPage.getByText("Save").click();

      await expect(
        userPage.getByText("Product saved successfully"),
      ).toBeVisible();

      // check if the changes are there
      await userPage.goto("/");

      const article = await userPage.locator("article").first();
      await expect(article.getByText("New product")).toBeVisible();
      await expect(article.getByText("Collection")).toBeVisible();
      await expect(article.getByText("$499")).toBeVisible();
      await expect(article.getByText("Stock: 14")).toBeVisible();
      await expect(article.locator("img")).toHaveAttribute(
        "src",
        "http://example.com/image.jpg",
      );
    },
  );

  test(
    "Create product form",
    {
      tag: "@a3",
    },
    async ({ userPage }) => {
      await seed();
      await userPage.goto("/posts/create");

      // BACKEND / ADMIN / UPDATE SCREEN > Logged in user can create a new product to the database, if the form is validated

      await userPage.getByLabel("Product Name").fill("New product");
      await userPage.getByLabel("Category").fill("Accessories");
      await userPage.getByLabel("Description").fill("New Description");
      await userPage.getByLabel("Product Details").fill("New Content");
      await userPage
        .getByLabel("Image URL")
        .fill("http://example.com/image.jpg");
      await userPage.getByLabel("Collections").fill("Collection");
      await userPage.getByLabel("Price").fill("129");
      await userPage.getByLabel("Stock Quantity").fill("8");
      await userPage.getByText("Save").click();

      await expect(
        userPage.getByText("Product saved successfully"),
      ).toBeVisible();

      // check if the changes are there
      await userPage.goto("/");

      const article = await userPage.locator("article").first();
      await expect(article.getByText("New product")).toBeVisible();
      await expect(article.locator('a:has-text("New product")')).toHaveAttribute(
        "href",
        "/post/new-product",
      );
      await expect(article.getByText("Collection")).toBeVisible();
      await expect(article.getByText("$129")).toBeVisible();
      await expect(article.getByText("Stock: 8")).toBeVisible();
      await expect(article.locator("img")).toHaveAttribute(
        "src",
        "http://example.com/image.jpg",
      );
    },
  );

  test(
    "Show preview",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      // UPDATE SCREEN > Under the Description is a "Preview" button that replaces the text area with a rendered markdown string and changes the title to "Close Preview".
      await userPage.getByText("Preview").focus();
      await userPage.getByText("Preview").click();
      await expect(userPage.getByTestId("content-preview")).toBeVisible();
      await expect(
        await userPage.getByTestId("content-preview").innerHTML(),
      ).toContain("<h2>Key features</h2>");
      await expect(userPage.getByText("Close Preview")).toBeVisible();
    },
  );

  test(
    "Restore preview",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      // UPDATE SCREEN > When the preview is closed, the cursor must be in the same position as before opening the preview.

      let textBox = await userPage.getByLabel("Product Details");
      await textBox.evaluate((element: HTMLTextAreaElement) => {
        element.focus();
        element.setSelectionRange(20, 20);
        element.focus();
      });

      await userPage.getByText("Preview").click();
      await userPage.getByText("Close Preview").click();

      textBox = await userPage.getByLabel("Product Details");
      const { selectionStart, selectionEnd } = await textBox.evaluate(
        (textarea: HTMLTextAreaElement) => {
          return {
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd,
          };
        },
      );

      expect(selectionStart).toBe(20);
      expect(selectionEnd).toBe(20);
    },
  );

  test(
    "Image Preview",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      // UPDATE SCREEN > Under the image input is an image preview;

      await expect(userPage.getByTestId("image-preview")).toBeVisible();
      await expect(
        await userPage.getByTestId("image-preview").getAttribute("src"),
      ).toBe(
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
      );
    },
  );

  test(
    "Save Button",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      // UPDATE SCREEN > User can click on the "Save" button that displays an error ui if one of the fields is not specified or valid.

      await expect(
        userPage.getByText("Please fix the errors before saving"),
      ).not.toBeVisible();

      await userPage.getByLabel("Product Name").clear();
      await userPage.getByText("Save").click();
      await expect(
        userPage.getByText("Please fix the errors before saving"),
      ).toBeVisible();
    },
  );
});
