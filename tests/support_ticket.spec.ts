
// import { test, expect } from "./fixtures";

// test.describe("BT Support Tickets", () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto("/");
//   });

//   test("should be able to view Support Ticket queue", async ({ page }) => {
//     await page.goto("/support/bt_support?mt=BT+Support+Tickets");
//     await expect(page).toHaveTitle("BT Support Tickets");
//   });

//   test("can make support ticket", async ({ page }) => {
//     await page.locator('[data-react-class="NotificationCenterApp"]').click();
//     await page.waitForSelector('a[href="/support/support_centers"]');

//     const popupPromise = page.waitForEvent("popup");
//     await page.getByRole("link", { name: "Support Center" }).click();
//     const supportTicketPage = await popupPromise;

//     const btCard = supportTicketPage.locator("h4", {
//       hasText: "Business Technology",
//     });
    
//     await btCard.waitFor();
//     await expect(supportTicketPage).toHaveURL("/support/support_centers");
//     await btCard.click();

//     //await supportTicketPage.locator("pb_card_kit_enabled"), (hasText: "Issues")

//   });
// });

import { test, expect } from "./fixtures";

test.describe("BT support ticket", async () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("should go to support ticket page", async ({ page }) => {
        await page.goto("/support/bt_support?mt=BT+Support+Tickets");
        await expect(page).toHaveTitle("BT Support Tickets");

    });

    test("should open dropdown and click Support Center", async ({ page }) => {
        const dropdownContainer = page.locator('div[data-react-class="NotificationCenterApp"]');
        // Wait for the dropdown container to be attached
        await dropdownContainer.waitFor({ state: 'attached' });
        // Select the specific dropdown toggle inside that container
        const dropdownToggle = dropdownContainer.locator('a.dropdown-toggle').first();
        // wait until visible
        await dropdownToggle.waitFor({ state: "visible" });
        await dropdownToggle.click();
        const supportCenterLink = dropdownContainer.locator('a:has-text("Support Center")');
        await supportCenterLink.waitFor({ state: "visible" });
        
        // Wait for the new tab to open and then click the link
        const [newTab] = await Promise.all([
            page.context().waitForEvent('page'), // Wait for the new tab to open
            supportCenterLink.click(), // Click the link that opens the new tab
        ]);
    
        await newTab.waitForLoadState('load'); // Wait for the new page to load
        await expect(newTab).toHaveURL(/\/support\/support_centers/);

        await newTab.waitForLoadState('load');
    
        // You can add more interactions here, e.g., clicking elements in the new tab
        //await newTab.locator('label[for="support-center-0"]').click();
        //await newTab.locator('.modal').waitFor({ state: 'visible' });
    });
    
    
    
});
