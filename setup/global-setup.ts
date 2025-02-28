import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { NITRO_ID_LOGIN, NITRO_QA_URL } from "../CONSTANTS";

dotenv.config();

const baseURL = process.env.BASE_URL || NITRO_QA_URL;
const SESSION_FILE = path.resolve(__dirname, "session.json");
console.log(SESSION_FILE);

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
      await page.goto(baseURL);

      // Verify if session is still valid
      if (await isSessionValid(page)) {
        await browser.close();
        return;
      }
    }
  }

  // Perform login if session is not valid or missing
  console.log("Logging in...");
  await page.goto(baseURL);
  console.log("Waiting for redirect...");
  // Wait for the page to redirect back to the original domain
  await page.waitForURL((url) => url.toString().includes(NITRO_ID_LOGIN), {
    timeout: 10000,
  });
  await page.fill('input[name="email"]', process.env.EMAIL || "");
  await page.fill('input[name="password"]', process.env.PASSWORD || "");
  await page.click("#sign-in-button");

  const authenticatorCode = await promptAuthenticatorCode();
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

function formatSession(session) {
  console.log("Checking session type...");
  if (!Array.isArray(session)) {
    console.log("session is object");
    session = handleSessionIsObject(session);
    return session
  }
  return session;
}

function handleSessionIsObject(session) {
  return session.cookies;
}

async function hasValidCookies(session) {
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

async function isSessionValid(page) {
  try {
    await page.goto(baseURL);
    return page.url().includes(baseURL);
  } catch {
    return false;
  }
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
