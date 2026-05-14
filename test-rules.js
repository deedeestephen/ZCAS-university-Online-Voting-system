import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync, writeFileSync } from 'fs';

const PROJECT_ID = 'firestore-emulator-test';
let testEnv;

async function runTests() {
  const rules = readFileSync('firestore.rules', 'utf8');
  
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
    },
  });

  const authCtx = testEnv.authenticatedContext('THPN2wjznufJIaoWsmAf8dlvrCH3', { email: 'admin@zcas.edu.zm', email_verified: false });

  // Test admin checking candidates
  const db = authCtx.firestore();
  
  console.log("Testing read on candidates...");
  try {
     const docRef = db.collection('candidates').doc('any');
     await assertSucceeds(docRef.get());
     console.log("SUCCESS: can read candidate");
  } catch (e) {
     console.error("FAIL: cannot read candidate", e);
  }

  console.log("Testing list on candidates...");
  try {
     await assertSucceeds(db.collection('candidates').get());
     console.log("SUCCESS: can list candidates");
  } catch (e) {
     console.error("FAIL: cannot list candidates", e);
  }
}

runTests().then(() => {
   console.log("Tests complete!");
   process.exit(0);
});
