// popup/popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const verifiedCountEl = document.getElementById('verifiedCount');
  const avgScoreEl = document.getElementById('avgScore');
  const integrationsEl = document.getElementById('integrations');

  chrome.runtime.sendMessage({ type: 'LEADPROOF_GET_STATS' }, (response) => {
    if (response) {
      verifiedCountEl.textContent = response.verifiedToday ?? '0';
      avgScoreEl.textContent = response.avgScore ?? '—';
      integrationsEl.textContent = (response.integrations || []).join(', ') || 'None';
    }
  });

  document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('viewReports').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://leadproof.ai/dashboard' });
  });

  document.getElementById('connectSite').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://leadproof.ai/connect-site' });
  });
});

// also handle token requests from service worker
navigator.serviceWorker?.addEventListener && navigator.serviceWorker.addEventListener('message', (ev) => {
  const msg = ev.data;
  if (!msg || msg.type !== 'LEADPROOF_REQUEST_TOKEN') return;
  // reply with token from chrome.storage
  chrome.storage.sync.get(['apiToken'], (res) => {
    ev.ports && ev.ports[0] && ev.ports[0].postMessage({ token: res.apiToken || null });
  });
});
