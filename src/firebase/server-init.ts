
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firestore: getFirestore(firebaseApp),
  };
}

/**
 * Initializes Firebase for server-side usage.
 * It ensures that the app is initialized only once.
 */
export function initializeServerFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  } else {
    return getSdks(getApp());
  }
}
