// IMPORTANT! Make sure you're importing from fixtures not Playwright or it will skip the sessions logic
import { test, expect } from "./fixtures";

test.describe("example test", () => {
  test("has title", async ({ page }) => {
    await page.goto("/");
    

    // Expect a title "to contain" a substring.
    expect(page).toBeTruthy();
  });
});
