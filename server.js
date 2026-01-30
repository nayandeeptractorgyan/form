const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   SERVE DASHBOARD (HTML + CSS)
================================ */

// Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, "dashboard")));

// Serve dashboard on root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard", "index.html"));
});

/* ================================
   PLAYWRIGHT TEST RUNNER
================================ */

const runPlaywrightTest = (testFile, res) => {
  exec(
    `npx playwright test --workers=1 tests/${testFile}`,
    { cwd: process.cwd() },
    (error, stdout, stderr) => {
      if (!error) {
        return res.json({
          status: "passed",
          output: stdout,
        });
      }

      return res.json({
        status: "failed",
        error: stderr || error.message,
      });
    }
  );
};

/* ================================
   API ENDPOINTS
================================ */

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

// Run all tests
app.post("/run-all-tests", (req, res) => {
  exec(
    "npx playwright test --workers=1",
    { cwd: process.cwd() },
    (error, stdout, stderr) => {
      if (!error) {
        return res.json({
          status: "passed",
          output: stdout,
        });
      }

      return res.json({
        status: "failed",
        error: stderr || error.message,
      });
    }
  );
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

/* ================================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
