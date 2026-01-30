// tests/tractor-insurance.spec.js

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require('./helpers/test-helpers');

test("Fill Tractor Insurance form", async ({ page }) => {
  const helper = new TestHelpers(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  await helper.setupPopupBlocker();

  try {
    await page.goto("/tractor-insurance");
    await helper.closePopup();

    const form = page.locator('form').first();

    // Fill registration number
    await form.locator('input#tractorRegistration').fill("MH12AB1243");
    await page.waitForTimeout(300);

    // Select dropdowns by value
    await helper.selectByValue('select#yearOfPurchase', '2022');
    await helper.selectByValue('select#registrationMonth', 'March');
    await helper.selectByValue('select#tractorBrand', 'Mahindra');

    // Select model (cascading dropdown)
    await helper.selectByText('select#tractorModel', '475 DI');

    // Fill name & mobile
    await form.locator('input#name').fill("auto-test");
    await page.waitForTimeout(300);
    
    await form.locator('input#userMobile').fill(mobileNumber);
    await page.waitForTimeout(300);

    // Select location dropdowns
    await helper.selectByValue('select#selectState', 'Maharashtra');
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
    console.log("✅ Tractor Insurance form submitted successfully!");

  } finally {
    helper.cleanup();
  }
});