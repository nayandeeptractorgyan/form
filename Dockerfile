FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]