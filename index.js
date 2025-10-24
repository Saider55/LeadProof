import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map();

app.get("/", (req, res) => res.send("✅ LeadProof API running on Railway"));

app.post("/create-user", (req, res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({ error: "Email required" });
  const apiKey = "lp_live_" + crypto.randomBytes(8).toString("hex");
  users.set(email, { email, apiKey });
  res.json({ email, apiKey });
});

app.post("/verify-lead", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing or invalid API key" });

  const apiKey = auth.replace("Bearer ", "").trim();
  const user = [...users.values()].find((u) => u.apiKey === apiKey);
  if (!user) return res.status(403).json({ error: "Invalid API key" });

  const lead = req.body || {};
  const email = lead.email || "";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const randomScore = Math.floor(Math.random() * 100);
  const score = isValidEmail ? randomScore : Math.floor(Math.random() * 40);
  const quality = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  res.json({ success: true, email, score, quality });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 LeadProof API listening on", PORT));



