// tests/dealership-registration.spec.js

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require('./helpers/test-helpers');

test("Fill Dealership Registration form with file upload", async ({ page }) => {
  const helper = new TestHelpers(page);
  const mobileNumber = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

  await helper.setupPopupBlocker();

  try {
    await page.goto("/tractor-dealers-in-india");
    
    // Close all initial popups
    await helper.closeInitialPopups();

    const form = page.locator('div.bg-green-lighter').locator('form').first();

    // Fill dealership details
    await form.locator('#dealershipName').fill("auto-test-pvt");

    await helper.selectByValue('#tyreBrand', 'Mahindra');

    await form.locator('#contactPersonName').fill("auto-test");
    await form.locator('#mobileNumber').fill(mobileNumber);
    await form.locator('#email').fill("johndoe@testmotors.com");

    // Select location dropdowns
    await helper.selectByValue('#selectState', 'Maharashtra');
    await helper.selectByText('#selectDistrict', 'Pune');
    await helper.selectByText('#selectTehsil', 'Haveli');

    // Fill address details
    await form.locator('#pincode').fill("411001");
    await form.locator('#dealershipAddress')
      .fill("Plot No 123, Industrial Area, Pune, Maharashtra");
    await form.locator('#serviceCenterAddress')
      .fill("Shop No 45, Service Road, Pune, Maharashtra");

    // Check same address checkbox
    const sameAddressCheckbox = form.locator('#sameAsDealerAddress');
    if (!(await sameAddressCheckbox.isChecked())) {
      await sameAddressCheckbox.check();
    }

    // File upload from URL
    await helper.uploadFileFromUrl(
      '#file-upload',
      'https://images.tractorgyan.com/uploads/dealer_documents/1769687721file-sample_150kb.pdf',
      'file-sample_150kb.pdf'
    );

    // Check terms
    const termsCheckbox = form.locator('#terms');
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check();
    }

    // Submit
    await helper.closePopup();
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Handle any confirmation popups after submit
    await helper.closePopup();

    await expect(page).not.toHaveURL(/error/);
    console.log("✅ Dealership Registration form submitted successfully!");

  } finally {
    helper.cleanup();
  }
});