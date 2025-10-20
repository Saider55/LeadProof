<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>LeadProof — Connect Your Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
  <div class="bg-white rounded-lg shadow p-8 w-full max-w-lg">
    <div class="text-center mb-4">
      <img src="/logo.png" alt="LeadProof" class="mx-auto w-20 h-20 mb-2" onerror="this.style.display='none'"/>
      <h1 class="text-2xl font-bold text-blue-600">🔗 Connect Your Website</h1>
      <p class="text-gray-600 mt-2">Enter your LeadProof API key to link the extension.</p>
    </div>

    <input id="apiKey" class="w-full border rounded p-3 mb-3" placeholder="sk_live_..." />
    <button id="saveBtn" class="w-full bg-blue-600 text-white py-2 rounded">Save & Connect</button>
    <p id="status" class="text-center mt-4 text-green-600"></p>
  </div>

  <script>
    const statusEl = document.getElementById('status');
    document.getElementById('saveBtn').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKey').value.trim();
      if (!apiKey) return alert('Please enter an API key');

      if (window.chrome && chrome.runtime) {
        // send message to extension (manifest.externally_connectable must allow this origin)
        chrome.runtime.sendMessage({ type: 'LEADPROOF_SAVE_KEY', apiKey }, (resp) => {
          statusEl.textContent = '✅ Connected — redirecting...';
          setTimeout(() => location.href = '/dashboard.html', 1000);
        });
      } else {
        statusEl.textContent = '⚠️ Please open this page from the LeadProof extension.';
      }
    });
  </script>
</body>
</html>


