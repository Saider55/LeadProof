// service/service-worker.js
// Handles messages from content script, adds auth, forwards to backend, shows notifications.

const API_BASE = 'https://api.leadproof.ai'; // replace with your backend endpoint

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  clients.claim();
});

async function postLeadToServer(lead, token) {
  try {
    const res = await fetch(`${API_BASE}/verify-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(lead)
    });
    return await res.json();
  } catch (err) {
    return { error: String(err) };
  }
}

// helper to ask a client (popup/options) for token via MessageChannel
async function requestTokenFromClient() {
  try {
    const windowClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
    if (!windowClients || windowClients.length === 0) return null;
    const client = windowClients[0];
    return await new Promise((resolve) => {
      const mc = new MessageChannel();
      mc.port1.onmessage = (ev) => {
        resolve(ev.data && ev.data.token ? ev.data.token : null);
      };
      client.postMessage({ type: 'LEADPROOF_REQUEST_TOKEN' }, [mc.port2]);
      // timeout after 2s
      setTimeout(() => resolve(null), 2000);
    });
  } catch (err) {
    return null;
  }
}

self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data) return;
  if (data.type === 'LEADPROOF_SUBMIT_LEAD') {
    (async () => {
      const lead = data.payload || {};
      let token = null;
      try {
        token = await requestTokenFromClient();
      } catch (err) {
        console.warn('Token request failed', err);
      }

      const result = await postLeadToServer(lead, token);
      if (result && result.score !== undefined) {
        if (result.score >= 80) {
          self.registration.showNotification('LeadProof — High quality lead', {
            body: `${lead.email || 'Unknown email'} scored ${result.score}`,
            icon: '/icons/icon48.png'
          });
        }
      } else {
        console.warn('LeadProof server response:', result);
      }
    })();
  }
});

// respond to runtime messages from popup/options
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === 'LEADPROOF_GET_STATS') {
    // Example: forward request to backend or return cached values
    sendResponse({ verifiedToday: 0, avgScore: '—', integrations: [] });
  }
});
