import { test, expect, chromium } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://nitroqa.powerhrg.com/");
});

test.describe("PowerLife Home Page", () => {
  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle(/Nitro/);
  });
});
