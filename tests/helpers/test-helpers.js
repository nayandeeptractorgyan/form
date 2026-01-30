// tests/helpers/test-helpers.js

class TestHelpers {
  constructor(page) {
    this.page = page;
    this.popupMonitor = null;
  }

  // Initialize popup blocker
  async setupPopupBlocker() {
    await this.page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        .container:has([alt="close icon"]) { display: none !important; }
        div:has(> div > div:text("Tractor Enquiry Form")) { display: none !important; }
      `;
      document.head.appendChild(style);
    });

    this.popupMonitor = setInterval(async () => {
      await this.closePopup();
    }, 2000);
  }

  // Close language popup on homepage
  async closeLanguagePopup() {
    try {
      const languagePopup = this.page.locator('button:has-text("Close")').first();
      if (await languagePopup.isVisible({ timeout: 2000 }).catch(() => false)) {
        await languagePopup.click();
        await this.page.waitForTimeout(300);
        console.log("🌐 Language popup closed");
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Close location/deny popup
  async closeLocationPopup() {
    try {
      const locationPopup = this.page.locator('button:has-text("Deny"), button:has-text("No Thanks")').first();
      if (await locationPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
        await locationPopup.click();
        await this.page.waitForTimeout(300);
        console.log("📍 Location popup closed");
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Handle confirmation popup (Are you sure you want to close?)
  async handleConfirmationPopup() {
    try {
      // Look for "Not Now" button in confirmation popup
      const notNowButton = this.page.locator('button:has-text("Not Now")').first();
      if (await notNowButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notNowButton.click();
        await this.page.waitForTimeout(300);
        console.log("✅ Confirmation popup dismissed (Not Now)");
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Close popup if exists (handles multiple popup types)
  async closePopup() {
    try {
      // First, try to handle confirmation popup if it appears
      if (await this.handleConfirmationPopup()) {
        return true;
      }

      const closeSelectors = [
        'button:has(img[alt="close icon"])',
        'button:has-text("Skip")',
        'button:has-text("Close")',
        'button:has-text("Cancel")',
        'button[aria-label="Close"]',
        'button.close',
        'img[alt="close icon"]',
        '[class*="close"]'
      ];

      for (const selector of closeSelectors) {
        const btn = this.page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click();
          await this.page.waitForTimeout(300);
          
          // After clicking close, check if confirmation popup appears
          await this.handleConfirmationPopup();
          
          console.log(`🚫 Popup closed using: ${selector}`);
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // Close all initial popups (language, location, etc.)
  async closeInitialPopups() {
    await this.closeLanguagePopup();
    await this.closeLocationPopup();
    await this.closePopup();
    console.log("🧹 All initial popups closed");
  }

  // Select dropdown by value
  async selectByValue(selector, value) {
    await this.closePopup();
    
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        return el && !el.disabled && el.options.length > 1;
      },
      selector,
      { timeout: 20000 }
    );

    await this.page.evaluate(
      ({ selector, value }) => {
        const select = document.querySelector(selector);
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      },
      { selector, value }
    );

    await this.page.waitForTimeout(500);
  }

  // Select dropdown by value using index (for forms with multiple selects without IDs)
  async selectByValueUsingIndex(index, value) {
    await this.closePopup();
    
    await this.page.waitForFunction(
      (index) => {
        const el = document.querySelectorAll('select')[index];
        return el && !el.disabled && el.options.length > 1;
      },
      index,
      { timeout: 20000 }
    );

    await this.page.evaluate(
      ({ index, value }) => {
        const select = document.querySelectorAll('select')[index];
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      },
      { index, value }
    );

    await this.page.waitForTimeout(500);
    console.log(`📋 Selected dropdown[${index}] = ${value}`);
  }

  // Select first available option in dropdown by index (useful for cascading dropdowns)
  async selectFirstAvailableOption(index) {
    await this.closePopup();
    
    await this.page.waitForFunction(
      (index) => {
        const el = document.querySelectorAll('select')[index];
        return el && !el.disabled && el.options.length > 1;
      },
      index,
      { timeout: 20000 }
    );

    await this.page.waitForTimeout(1000);

    await this.page.evaluate(
      (index) => {
        const select = document.querySelectorAll('select')[index];
        const option = Array.from(select.options).find(opt => opt.value && opt.value !== '');
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`Selected first available option: ${option.text}`);
        }
      },
      index
    );

    await this.page.waitForTimeout(500);
    console.log(`📋 Selected first available option in dropdown[${index}]`);
  }

  // Select dropdown by text (improved for cascading dropdowns)
  async selectByText(selector, text) {
    await this.closePopup();
    
    // Wait for dropdown to be enabled and loaded
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        if (!el || el.disabled) return false;
        
        const options = Array.from(el.options);
        const hasOptions = options.length > 1;
        const hasLoading = options.some(o => o.text.toLowerCase().includes('loading'));
        
        return hasOptions && !hasLoading;
      },
      selector,
      { timeout: 20000 }
    );

    // Extra wait for React state updates
    await this.page.waitForTimeout(1000);

    // Select the option
    await this.page.evaluate(
      ({ selector, text }) => {
        const select = document.querySelector(selector);
        const options = Array.from(select.options);
        
        // Try to find by text match
        let option = options.find(opt => 
          opt.text.toLowerCase().includes(text.toLowerCase())
        );
        
        // If not found, select first non-placeholder option
        if (!option && options.length > 1) {
          option = options[1];
        }
        
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`Selected: ${option.text}`);
        }
      },
      { selector, text }
    );

    await this.page.waitForTimeout(500);
  }

  // Upload file from URL
  async uploadFileFromUrl(selector, fileUrl, fileName) {
    await this.closePopup();
    
    console.log(`📎 Uploading file from URL: ${fileName}`);
    
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();

    await this.page.locator(selector).setInputFiles({
      name: fileName,
      mimeType: "application/pdf",
      buffer: Buffer.from(buffer),
    });

    await this.page.waitForTimeout(500);
    console.log(`✅ File uploaded: ${fileName}`);
  }

  // Cleanup
  cleanup() {
    if (this.popupMonitor) {
      clearInterval(this.popupMonitor);
      console.log("🧹 Cleanup completed");
    }
  }
}

module.exports = { TestHelpers };