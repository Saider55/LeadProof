// server/index.js
// Minimal Express API for LeadProof

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import pg from 'pg';
import { verifyLead } from './verification.js';

const app = express();
app.use(helmet());
app.use(bodyParser.json());

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/leadproof' });

const requireApiKey = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  // TODO: validate token properly
  req.user = { id: 'demo' };
  next();
};

app.post('/verify-lead', requireApiKey, async (req, res) => {
  try {
    const lead = req.body;
    const result = await verifyLead(lead);
    // persist to DB (light example)
    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS leads (
          id bigserial PRIMARY KEY,
          email text,
          name text,
          data jsonb,
          score int,
          source text,
          ip inet,
          created_at timestamptz DEFAULT now()
        );`
      );
      await pool.query(
        `INSERT INTO leads (email, name, data, score, source, ip) VALUES ($1,$2,$3,$4,$5,$6)`,
        [lead.email || null, lead.name || null, lead, result.score || null, lead._origin, lead._ip || null]
      );
    } catch (err) {
      console.warn('DB insert failed:', err.message);
    }

    res.json({ score: result.score, checks: result.checks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LeadProof API listening on ${PORT}`));
