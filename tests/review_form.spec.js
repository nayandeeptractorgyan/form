// tests/tractor-review.spec.js

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require('./helpers/test-helpers');

test("Fill Review form with star rating", async ({ page }) => {
  const helper = new TestHelpers(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  await helper.setupPopupBlocker();

  try {
    await page.goto("/tractor-review");
    
    // Close all initial popups
    await helper.closeInitialPopups();

    // Click star rating (4 stars - index 3)
    const stars = page.locator('div.h-\\[40px\\].w-\\[40px\\].cursor-pointer');
    await stars.nth(3).click();
    await page.waitForTimeout(300);
    console.log("⭐ Selected 4-star rating");

    // Select brand (first select dropdown)
    await helper.selectByValueUsingIndex(0, 'Mahindra');

    // Select model (second select dropdown - cascading)
    await helper.selectFirstAvailableOption(1);

    const form = page.locator('form');

    // Fill name
    await form.locator('input#name').fill("auto-test");
    await page.waitForTimeout(300);

    // Fill mobile number
    await form.locator('input#mobileNumber').fill(mobileNumber);
    await page.waitForTimeout(300);

    // Fill review
    await form.locator('textarea#review')
      .fill("Excellent tractor with great performance and fuel efficiency. Highly recommended for farming operations.");
    await page.waitForTimeout(300);

    // Submit
    await helper.closePopup();
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Handle any confirmation popups
    await helper.closePopup();

    await expect(page).not.toHaveURL(/error/);
    console.log("✅ Review form submitted successfully!");

  } finally {
    helper.cleanup();
  }
});