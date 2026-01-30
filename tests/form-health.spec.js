import { test, expect } from "@playwright/test";
const { LanguagePopupHelper } = require("./helpers/language-popup-helper");

test("Fill Tractor Enquiry Form with cascading dynamic dropdowns", async ({ page }) => {
  const languagePopup = new LanguagePopupHelper(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Start language popup blocker BEFORE navigation
  await languagePopup.start();

  await page.goto("/");

  // Open WhatsApp popup
  await page.locator('button:has(img[alt="WhatsApp"])').click();
  const popup = page.locator('.bg-green-lighter.shadow-main');
  await popup.waitFor({ state: 'visible', timeout: 5000 });

  // Fill name & mobile
  await popup.locator('input#name').fill("auto-test");
  await popup.locator('input#mobile').fill(mobileNumber);

  // ===== STEP 1: SELECT BRAND =====
  await page.waitForFunction(() => {
    const brand = document.querySelector("select#brand");
    return brand && brand.options.length > 5;
  });

  await page.evaluate(() => {
    const select = document.querySelector("select#brand");
    const option = [...select.options].find(o =>
      o.text.toLowerCase().includes("massey ferguson")
    );
    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  // ===== STEP 2: MODEL =====
  await page.waitForFunction(() => {
    const el = document.querySelector("select#model");
    return el && !el.disabled && el.options.length > 2;
  });

  await page.evaluate(() => {
    const select = document.querySelector("select#model");
    const option = [...select.options].find(o =>
      o.text.toLowerCase().includes("235")
    ) || select.options[1];
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // ===== STATE =====
  await page.evaluate(() => {
    const select = document.querySelector("select#state");
    const option = [...select.options].find(o =>
      o.text.toLowerCase().includes("maharashtra")
    );
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // ===== DISTRICT =====
  await page.waitForFunction(() => {
    const el = document.querySelector("select#district");
    return el && !el.disabled && el.options.length > 2;
  });

  await page.evaluate(() => {
    const select = document.querySelector("select#district");
    const option = [...select.options].find(o =>
      o.text.toLowerCase().includes("pune")
    ) || select.options[1];
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // ===== TEHSIL =====
  await page.waitForFunction(() => {
    const el = document.querySelector("select#tehsil");
    return el && !el.disabled && el.options.length > 2;
  });

  await page.evaluate(() => {
    const select = document.querySelector("select#tehsil");
    const option = [...select.options].find(o =>
      o.text.toLowerCase().includes("haveli")
    ) || select.options[1];
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // ===== SUBMIT =====
  await popup.locator("#terms").check();
  await popup.locator('button[type="submit"]').click();

  await expect(page).not.toHaveURL(/error/);

  languagePopup.stop();
});
