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

  const authCtx = testEnv.authenticatedContext('student123', { email: 'student@zcas.edu.zm', email_verified: false });

  const db = authCtx.firestore();
  
  console.log("Testing read on settings...");
  try {
     const docRef = db.collection('settings').doc('electionSchedule');
     await assertSucceeds(docRef.get());
     console.log("SUCCESS: can read settings");
  } catch (e) {
     console.error("FAIL: cannot read settings", e);
  }
  
  console.log("Testing read on students...");
  try {
     const docRef = db.collection('students').doc('student123');
     await assertSucceeds(docRef.get());
     console.log("SUCCESS: can read own student doc");
  } catch (e) {
     console.error("FAIL: cannot read own student doc", e);
  }
}

runTests().then(() => {
   console.log("Tests complete!");
   process.exit(0);
});
