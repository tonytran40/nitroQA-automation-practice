# Playwright Cheat Sheet
This document is for having a quick reference of some commonly used code. For more information about this repo, see [the README](/README.md)
## Commands
### Install/Update
- Install Playwright:
    - ```bash
        npm init playwright@latest
        ```

- Update Playwright:
    - ```bash
        npm install -D @playwright/test@latest 
        # Also download new browser binaries and their dependencies: 
        npx playwright install --with-deps
        ```
- View Current Version of Playwright:
    - ```bash
        npx playwright --version
        ```

### Running Tests
- Run Playwright Tests:
    - ```bash
        npx playwright test
        npx playwright test --headed # Run in headed mode
        npx playwright test --project=chromium # Run for a specific browser
        npx playwright test --debug # Run in debug mode
        npx playwright test --ui # Run in UI mode
        npx playwright test path/to/file.spec.ts # Run specific test
        ```
- View Test Report:
    - ```bash
        npx playwright show-report
        ```
        - This allows you to see a full report of the test that ran.

## Common Javascript
### **Setup and Basics**
- **Install Playwright with Browsers**:
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
- **Run Tests**:
  ```bash
  npx playwright test
  npx playwright test --headed # Run in headed mode
  npx playwright test --project=chromium # Run for a specific browser
  npx playwright test --debug # Run in debug mode
  ```

---

### **Browser Context and Page**
- **Launch Browser**:
  ```javascript
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: false }); // Headed mode
  const context = await browser.newContext();
  const page = await context.newPage();
  ```
- **Navigate to a Page**:
  ```javascript
  await page.goto('https://example.com');
  ```
- **Take a Screenshot**:
  ```javascript
  await page.screenshot({ path: 'screenshot.png' });
  ```
- **Close Browser**:
  ```javascript
  await browser.close();
  ```

---

### **Locators**
- **Select Elements**:
  ```javascript
  const button = page.locator('text="Submit"');
  await button.click();
  ```
- **Interact with Input Fields**:
  ```javascript
  await page.fill('input[name="username"]', 'myUsername');
  await page.fill('input[name="password"]', 'myPassword');
  await page.press('input[name="password"]', 'Enter'); // Press a key
  ```
- **Wait for an Element**:
  ```javascript
  await page.locator('text="Welcome"').waitFor();
  ```

---

### **Assertions**
- **Check for Text**:
  ```javascript
  await expect(page.locator('h1')).toHaveText('Welcome');
  ```
- **Check for Visibility**:
  ```javascript
  await expect(page.locator('button')).toBeVisible();
  ```
- **Check URL**:
  ```javascript
  await expect(page).toHaveURL('https://example.com/dashboard');
  ```

---

### **Keyboard and Mouse Actions**
- **Keyboard Typing**:
  ```javascript
  await page.keyboard.type('Hello, Playwright!');
  ```
- **Mouse Actions**:
  ```javascript
  await page.mouse.click(100, 200); // Click at coordinates
  await page.mouse.move(50, 100); // Move mouse to coordinates
  ```

---

### **Network**
- **Mock API Requests**:
  ```javascript
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    });
  });
  ```
- **Wait for a Network Response**:
  ```javascript
  const response = await page.waitForResponse('**/api/data');
  console.log(await response.json());
  ```

---

### **Testing Utilities**
- **Run a Specific Test File**:
  ```bash
  npx playwright test path/to/test.spec.ts
  ```
- **Run with Tags**:
  ```bash
  npx playwright test --grep @smoke # Run tests with the @smoke tag
  ```
- **Record a New Test**:
  ```bash
  npx playwright codegen https://example.com
  ```
- **Generate Trace Viewer**:
  ```javascript
  test.use({ trace: 'on' }); // In Playwright config or test file
  ```
  View the trace:
  ```bash
  npx playwright show-trace trace.zip
  ```

---

### **Screenshots and Videos**
- **Record Video**:
  ```javascript
  const context = await browser.newContext({
    recordVideo: { dir: 'videos/' },
  });
  ```
- **Take a Full-Page Screenshot**:
  ```javascript
  await page.screenshot({ path: 'fullpage.png', fullPage: true });
  ```

---

### **Debugging**
- **Pause and Inspect**:
  ```bash
  npx playwright test --debug
  ```
- **Set a Debugger in Code**:
  ```javascript
  await page.pause(); // Opens the inspector
  ```

---

### **Miscellaneous**
- **Emulate Mobile Devices**:
  ```javascript
  const iPhone = playwright.devices['iPhone 13'];
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();
  ```
- **Set Browser Context**:
  ```javascript
  const context = await browser.newContext({
    geolocation: { latitude: 37.7749, longitude: -122.4194 },
    permissions: ['geolocation'],
  });
  ```

---

### **Helpful CLI Commands**
- **Show Installed Browsers**:
  ```bash
  npx playwright install --list
  ```
- **Install a Specific Browser**:
  ```bash
  npx playwright install firefox
  ```

---