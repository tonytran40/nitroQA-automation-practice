import { test, expect } from "./fixtures";

test.describe("BT Support Tickets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should be able to view Support Ticket queue", async ({ page }) => {
    await page.goto("/support/bt_support?mt=BT+Support+Tickets");
    await expect(page).toHaveTitle("BT Support Tickets");
  });

  test("can make support ticket", async ({ page }) => {
    await page.locator('[data-react-class="NotificationCenterApp"]').click();
    await page.waitForSelector('a[href="/support/support_centers"]');

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Support Center" }).click();
    const supportTicketPage = await popupPromise;

    const btCard = supportTicketPage.locator("h4", {
      hasText: "Business Technology",
    });
    
    await btCard.waitFor();
    await expect(supportTicketPage).toHaveURL("/support/support_centers");
    await btCard.click();
  });
});
