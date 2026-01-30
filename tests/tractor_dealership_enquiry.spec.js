// tests/dealership-enquiry.spec.js

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require('./helpers/test-helpers');

test("Fill Dealership Enquiry form", async ({ page }) => {
  const helper = new TestHelpers(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  await helper.setupPopupBlocker();

  try {
    await page.goto("/tractor-dealership-enquiry");
    await helper.closePopup();

    const form = page.locator('form').first();

    // Fill inputs
    await form.locator('input#name').fill("autotest");
    await page.waitForTimeout(300);
    
    await form.locator('input#userMobile').fill(mobileNumber);
    await page.waitForTimeout(300);
    
    await form.locator('input#currentBusiness').fill("Agricultural Equipment Sales");
    await page.waitForTimeout(300);
    
    await form.locator('input#investmentAmount').fill("5000000");
    await page.waitForTimeout(300);

    // Select dropdowns
    await helper.selectByValue('select#tyreBrand', '1');
    await helper.selectByValue('select#selectState', 'Maharashtra');
    await helper.selectByText('select#selectDistrict', 'Pune');
    await helper.selectByText('select#selectTehsil', 'Haveli');

    // Fill remaining fields
    await form.locator('input#pincode').fill("411001");
    await page.waitForTimeout(300);
    
    await form.locator('textarea#userMessage').fill("Interested in opening a dealership in Pune area");
    await page.waitForTimeout(300);

    // Check terms
    const termsCheckbox = form.locator('input#terms');
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check();
      await page.waitForTimeout(200);
    }

    // Submit
    await helper.closePopup();
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await expect(page).not.toHaveURL(/error/);
    console.log("✅ Form submitted successfully!");

  } finally {
    helper.cleanup();
  }
});