import { test, expect } from "./fixtures";

test.describe("PowerLife Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle("PowerLife Home");
  });

  test("click on articles", async ({ page }) => {
    await page.getByRole("link", { name: "Articles" }).click();
    await expect(page).toHaveTitle("Articles");
  });

  test("filter dizzle sizzle", async ({ page }) => {
    await page.getByRole("link", { name: "Dizzle's Sizzle" }).click();
    await page.locator("button").first().click();
    await page.locator("#q_appears_at_range").click();
    await page
      .locator("div[class='nav-item-link']", { hasText: "Last Year" })
      .click();
    await page.locator("button", { hasText: "Filter" }).click();

    const lastDanceCard = page.locator(".pb_card_kit_deselected_border_radius_xl").first()
    const lastDanceCardTitle = await lastDanceCard.locator("h3").textContent();
    expect(lastDanceCardTitle).toEqual("The Last Dance (12/31/24)");
  });
});
