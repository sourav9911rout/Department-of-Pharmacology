
import { initializeApp, getApp, getApps, FirebaseApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

const getServiceAccount = () => {
    if (process.env.VERCEL_ENV && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
    // For local development, return undefined to allow default credential discovery
    return undefined;
}


// This function is safe to call on the server
export function initializeFirebaseServer() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    
    // In a server environment with a service account, use admin SDK with cert.
    // Locally, initialize without credentials to use default discovery.
    const appOptions = serviceAccount 
      ? { credential: cert(serviceAccount) } 
      : { projectId: firebaseConfig.projectId };

    return initializeApp(appOptions);
  } else {
    return getApp();
  }
}

export function getFirestoreServer() {
  const app = initializeFirebaseServer();
  return getFirestore(app);
}
