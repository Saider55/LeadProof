 index.js — root launcher for Railway
import('.serverindex.js')
  .catch(err = {
    console.error('❌ Failed to start LeadProof server', err);
    process.exit(1);
  });


