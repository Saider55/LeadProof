// options/options.js
document.addEventListener('DOMContentLoaded', async () => {
  const adminEmail = document.getElementById('adminEmail');
  const autoEmail = document.getElementById('autoEmail');
  const hqToCrm = document.getElementById('hqToCrm');
  const apiToken = document.getElementById('apiToken');
  const save = document.getElementById('save');

  chrome.storage.sync.get(['adminEmail','autoEmail','hqToCrm','apiToken'], (res) => {
    adminEmail.value = res.adminEmail || '';
    autoEmail.checked = !!res.autoEmail;
    hqToCrm.checked = !!res.hqToCrm;
    apiToken.value = res.apiToken || '';
  });

  save.addEventListener('click', () => {
    chrome.storage.sync.set({
      adminEmail: adminEmail.value,
      autoEmail: autoEmail.checked,
      hqToCrm: hqToCrm.checked,
      apiToken: apiToken.value
    }, () => {
      alert('Saved!');
    });
  });
});
