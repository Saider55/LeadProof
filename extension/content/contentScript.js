// content/contentScript.js
// Auto-detect forms on the page and intercept submit events to forward leads to the extension service worker.

(function () {
  const attach = (form) => {
    if (form.__leadproof_attached) return;
    form.__leadproof_attached = true;

    form.addEventListener('submit', async (e) => {
      try {
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        payload._origin = location.href;
        payload._form_action = form.action || null;

        // Send to the service worker via postMessage to the active client
        // If there's no service worker controlling the page, we fallback to runtime.sendMessage
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'LEADPROOF_SUBMIT_LEAD',
            payload
          });
        } else if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'LEADPROOF_SUBMIT_LEAD', payload }, function(resp){});
        }
        // Let the original submit proceed (do not block)
      } catch (err) {
        console.error('LeadProof content script error', err);
      }
    }, {capture: true});
  };

  // attach to all forms
  document.querySelectorAll('form').forEach(attach);

  // observe dynamically added forms
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach((n) => {
        if (n.nodeType === 1) {
          if (n.matches && n.matches('form')) attach(n);
          n.querySelectorAll && n.querySelectorAll('form').forEach(attach);
        }
      });
    }
  });

  mo.observe(document.documentElement, {childList: true, subtree: true});
})();
