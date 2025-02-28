// IMPORTANT! Make sure you're importing from fixtures not Playwright or it will skip the sessions logic
import { test, expect } from "./fixtures";

test.describe("example test", () => {
  test("has title", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });
});
