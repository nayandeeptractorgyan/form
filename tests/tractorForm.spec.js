// tests/tractor-inline-form.spec.js

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require('./helpers/test-helpers');

test("Fill Tractor page inline form", async ({ page }) => {
  const helper = new TestHelpers(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  await helper.setupPopupBlocker();

  try {
    await page.goto("/tractor-on-road-price");
    await helper.closePopup();

    const form = page.locator('form').first();

    // Fill Name & Mobile
    await form.locator('input#name').fill("auto-test");
    await page.waitForTimeout(300);
    
    await form.locator('input#userMobile').fill(mobileNumber);
    await page.waitForTimeout(300);

    // Select cascading dropdowns
    await helper.selectByText('select#tyreBrand', 'massey ferguson');
    await helper.selectByText('select#tyreModel', '241 DI');
    await helper.selectByText('select#selectState', 'Maharashtra');
    await helper.selectByText('select#selectDistrict', 'Pune');
    await helper.selectByText('select#selectTehsil', 'Haveli');

    // Check terms
    const termsCheckbox = form.locator('input#terms');
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check();
      await page.waitForTimeout(200);
    }

    // Submit
    await helper.closePopup();
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await expect(page).not.toHaveURL(/error/);
    console.log("✅ Tractor inline form submitted successfully!");

  } finally {
    helper.cleanup();
  }
});