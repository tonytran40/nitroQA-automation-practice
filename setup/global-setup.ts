import { chromium, Page } from "playwright";
import fs from "fs";
import dotenv from "dotenv";
import { NITRO_ID_LOGIN, NITRO_QA_URL, SESSION_FILE } from "../CONSTANTS";
import { execSync } from "child_process";

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
      await page.goto('/');

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
      "Skipping authenticator code. Using 'npx playwright open' to save session. Close the browser once you've logged in."
    );
    execSync(`npx playwright open --save-storage=session.json ${process.env.BASE_URL}`, {
      stdio: "inherit",
    });
    await browser.close();
    console.log("Session saved.");
    // now that we have the cookies, try again.
    await globalSetup();
    return;
  }

  // Perform login if session is not valid or missing
  console.log("Logging in...");
  await page.goto('/');
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
  await page.waitForURL(
    (url) => url.toString().includes(process.env.BASE_URL || NITRO_QA_URL),
    {
      timeout: 10000,
    }
  );

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
    await page.goto('/');
    return page.url().includes('/');
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
