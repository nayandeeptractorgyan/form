class LanguagePopupHelper {
    constructor(page) {
      this.page = page;
      this.interval = null;
    }
  
    async start() {
      // Hide popup instantly (before render)
      await this.page.addInitScript(() => {
        const style = document.createElement("style");
        style.innerHTML = `
          .container:has([alt="close icon"]),
          button:has-text("Close") {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      });
  
      // Fallback click if it still appears
      this.interval = setInterval(async () => {
        try {
          const btn = this.page.locator('button:has-text("Close")').first();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click();
            console.log("🌐 Language popup closed");
          }
        } catch {}
      }, 1500);
    }
  
    stop() {
      if (this.interval) clearInterval(this.interval);
    }
  }
  
  module.exports = { LanguagePopupHelper };
  