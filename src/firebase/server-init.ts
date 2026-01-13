
import { initializeApp, getApp, getApps, FirebaseApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a workaround to use the client-side config with the server-side SDK
// In a real production app, you would use a service account JSON file
const getServiceAccount = () => {
    if (process.env.VERCEL_ENV && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
    // For local development, we can try to use a simplified object
    // Note: This might have permission limitations
    return {
        projectId: firebaseConfig.projectId,
        // You might need to generate a private key for local development
        // and add it here if you encounter permission issues.
    };
}


// This function is safe to call on the server
export function initializeFirebaseServer() {
  if (getApps().length === 0) {
    // In a server environment (like Vercel functions), use admin SDK
    const serviceAccount = getServiceAccount();
    return initializeApp({
        credential: cert(serviceAccount)
    });
  } else {
    return getApp();
  }
}

export function getFirestoreServer() {
  const app = initializeFirebaseServer();
  return getFirestore(app);
}
