const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Helper function to run Playwright tests
const runPlaywrightTest = (testFile, res) => {
  exec(
    `npx playwright test tests/${testFile}`,
    { cwd: process.cwd() },
    (error, stdout, stderr) => {
      if (!error) {
        return res.json({
          status: "passed",
          output: stdout
        });
      }

      return res.json({
        status: "failed",
        error: stderr || error.message
      });
    }
  );
};

// API endpoints for each test file
app.post("/run-dealership-form", (req, res) => {
  runPlaywrightTest("dealership_form.spec.js", res);
});

app.post("/run-review-form", (req, res) => {
  runPlaywrightTest("review_form.spec.js", res);
});

app.post("/run-tractor-dealership-enquiry", (req, res) => {
  runPlaywrightTest("tractor_dealership_enquiry.spec.js", res);
});

app.post("/run-tractor-insurance", (req, res) => {
  runPlaywrightTest("tractor_insurance.spec.js", res);
});

app.post("/run-tractor-form", (req, res) => {
  runPlaywrightTest("tractorForm.spec.js", res);
});

app.post("/run-form-health", (req, res) => {
  runPlaywrightTest("form-health.spec.js", res);
});

// Optional: Run all tests
app.post("/run-all-tests", (req, res) => {
  exec(
    "npx playwright test",
    { cwd: process.cwd() },
    (error, stdout, stderr) => {
      if (!error) {
        return res.json({
          status: "passed",
          output: stdout
        });
      }

      return res.json({
        status: "failed",
        error: stderr || error.message
      });
    }
  );
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});