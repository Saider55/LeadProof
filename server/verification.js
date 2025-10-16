// server/verification.js
// Orchestrate simple verification heuristics (mocked) for local development

export async function verifyLead(lead) {
  const checks = {};
  let score = 50;

  // 1) Email syntax check
  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    checks.email_syntax = false;
    score -= 40;
  } else {
    checks.email_syntax = true;
    score += 5;
  }

  // 2) Disposable domain heuristic
  try {
    const domain = (lead.email || '').split('@')[1] || '';
    const disposable = ['mailinator.com','tempmail.com','10minutemail.com'];
    checks.disposable_domain = disposable.includes(domain.toLowerCase());
    if (checks.disposable_domain) score -= 50;
    else score += 5;
  } catch (err) {}

  // 3) Name/email plausibility (very naive)
  if (lead.name && lead.email) {
    const nameParts = lead.name.toLowerCase().split(' ');
    const emailLocal = (lead.email.split('@')[0] || '').toLowerCase();
    const matches = nameParts.some(p => emailLocal.includes(p));
    checks.name_email_match = matches;
    score += matches ? 10 : 0;
  }

  // clamp score 0-100
  score = Math.max(0, Math.min(100, score));
  return { score, checks };
}
