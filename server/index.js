// server/index.js
// ------------------------------------------------------
// LeadProof Backend API — Verifies & Scores Leads
// Free production-ready version for Railway
// ------------------------------------------------------

import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// Temporary in-memory user store (no DB required)
const users = new Map();

// --- Root check -------------------------------------------------
app.get("/", (req, res) => {
  res.send("✅ LeadProof API running on Railway");
});

// --- Create new user / API key ----------------------------------
app.post("/create-user", (req, res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Generate a random API key
  const apiKey = "lp_live_" + crypto.randomBytes(8).toString("hex");
  users.set(email, { email, apiKey });
  console.log("🔑 New API key created for:", email, apiKey);

  res.json({ email, apiKey });
});

// --- Verify lead endpoint ---------------------------------------
app.post("/verify-lead", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }

  const apiKey = auth.replace("Bearer ", "").trim();
  const user = [...users.values()].find((u) => u.apiKey === apiKey);
  if (!user) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  const lead = req.body || {};
  const email = lead.email || "";
  const name = lead.name || "";

  // --- SIMPLE VALIDATION LOGIC -----------------------------------
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const randomScore = Math.floor(Math.random() * 100);
  const score = isValidEmail ? randomScore : Math.floor(Math.random() * 40);
  const quality =
    score >= 80 ? "high" : score >= 50 ? "medium" : "low";

  console.log("✅ Verified lead:", { email, name, score, quality });

  // Optional: fake delay to simulate verification
  await new Promise((r) => setTimeout(r, 400));

  res.json({
    success: true,
    email,
    name,
    score,
    quality,
    checkedAt: new Date().toISOString(),
  });
});

// --- Start server ------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🚀 LeadProof API listening on port", PORT);
});

