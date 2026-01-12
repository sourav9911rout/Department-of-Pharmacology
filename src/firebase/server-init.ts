
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This function is safe to call on the server
export function initializeFirebaseServer() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export function getFirestoreServer() {
  const app = initializeFirebaseServer();
  return getFirestore(app);
}
