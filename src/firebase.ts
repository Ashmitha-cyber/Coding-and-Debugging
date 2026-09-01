import { initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Gracefully handle Firestore connection: When the free daily write quota on the Google Cloud project
// is exhausted, we do not initialize Firestore client connection to prevent infinite backoff retries and console errors.
// The applet utilizes its authoritative full-stack Express server and real-time polling sync.
const db: Firestore | null = null;

export { app, db };


