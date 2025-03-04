import { chromium, Page } from "playwright";
import fs from "fs";
import dotenv from "dotenv";
import { NITRO_ID_LOGIN, SESSION_FILE, BASE_URL } from "../CONSTANTS";

dotenv.config();

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Check if session cookie already exists
  if (fs.existsSync(SESSION_FILE)) {
    let session = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
    session = formatSession(session);
    if (await hasValidCookies(session)) {
      console.log("Valid session cookies found, reusing session...");
      await page.context().addCookies(session);
      await page.goto(BASE_URL);

      // Verify if session is still valid
      if (await isSessionValid(page)) {
        await browser.close();
        return;
      }
    }
  }

  const isUsingAuthenticator = await promptAuthenticatorApp();
  // if we aren't using an authenticator, just let the user sign in manually and capture the cookies.
  if (!isUsingAuthenticator) {
    console.log(
      "Skipping authenticator code. Close the browser once you've logged in."
    );

    // Open browser to allow user to sign in
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', process.env.EMAIL || "");
    await page.fill('input[name="password"]', process.env.PASSWORD || "");
    if (process.env.EMAIL && process.env.PASSWORD) {
      await page.click("#sign-in-button");
    }

    // Wait for user to enter 2FA code and close the window
    console.log("Waiting for user to enter 2FA and close browser");
    await new Promise((resolve) => {
      const checkPages = setInterval(async () => {
        if ((context.pages()).length === 0) {
          clearInterval(checkPages);
          resolve(null);
        }
      }, 500);
    });

    // Save session data to 'session.json'
    console.log("Window closed. Saving session data...");
    await context.storageState({ path: SESSION_FILE });
    console.log("Session saved.");

    return;
  }

  // Perform login if session is not valid or missing
  console.log("Logging in...");
  await page.goto(BASE_URL);
  console.log("Waiting for redirect...");
  // Wait for the page to redirect back to the original domain
  await page.waitForURL((url) => url.toString().includes(NITRO_ID_LOGIN), {
    timeout: 10000,
  });
  await page.fill('input[name="email"]', process.env.EMAIL || "");
  await page.fill('input[name="password"]', process.env.PASSWORD || "");
  await page.click("#sign-in-button");
  let authenticatorCode = "";
  authenticatorCode = await promptAuthenticatorCode();
  await page.fill('input[name="otp_attempt"]', authenticatorCode);
  await page.click("#submit-otp-button");

  console.log("Waiting for redirect...");
  // Wait for the page to redirect back to the original domain
  await page.waitForURL((url) => url.toString().includes(BASE_URL), {
    timeout: 10000,
  });

  // Save session cookie
  const cookies = await page.context().cookies();
  let session = cookies.filter((cookie) => cookie.name.includes("nitro"));
  if (session) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session));
    console.log("Session saved.");
  } else {
    throw new Error("Failed to log in: No session cookie found.");
  }

  await browser.close();
}

export function formatSession(session) {
  return !Array.isArray(session) ? session.cookies : session;
}

async function hasValidCookies(session: Array<any>): Promise<boolean> {
  if (!session || session.length <= 1) {
    console.log("No cookies found");
    return false;
  }
  const cookieDomains = session.map((cookie) => cookie.domain);
  if (cookieDomains.includes(new URL(NITRO_ID_LOGIN).hostname)) {
    // Check for expiration (ensure cookies are not expired)
    const now = Math.floor(Date.now() / 1000);
    const validCookies = session.filter((cookie) => {
      return cookie.expires && cookie.expires > now;
    });

    if (
      validCookies.length > 0 &&
      validCookies.some((cookie) =>
        cookie.domain.includes(new URL(NITRO_ID_LOGIN).hostname)
      )
    ) {
      return true;
    } else {
      console.log("Session cookies have expired.");
    }
  } else {
    console.log(
      "Session cookie is missing either Nitro ID or base URL domain."
    );
  }
  console.log("Getting new cookies...");
  return false;
}

async function isSessionValid(page: Page): Promise<boolean> {
  try {
    await page.goto(BASE_URL);
    return page.url().includes(BASE_URL);
  } catch {
    return false;
  }
}

async function promptAuthenticatorApp(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "Are you using an authenticator app for 2FA? (y/n): ",
      (answer: string) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "y");
      }
    );
  });
}

async function promptAuthenticatorCode(): Promise<string> {
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the authenticator code: ", (code: string) => {
      rl.close();
      resolve(code.trim());
    });
  });
}

export default globalSetup;
