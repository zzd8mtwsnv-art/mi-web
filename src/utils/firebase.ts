import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 5 &&
    !firebaseConfig.apiKey.includes('TU_API_KEY')
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Error inicializando Firebase:', error);
  }
}

export { auth, db };

// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Authentication methods
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  if (!auth) {
    throw new Error('Firebase no está configurado. Por favor, añade las variables de entorno en Vercel o en tu archivo .env');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithApple = async (): Promise<FirebaseUser> => {
  if (!auth) {
    throw new Error('Firebase no está configurado. Por favor, añade las variables de entorno en Vercel o en tu archivo .env');
  }
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
};

export const logOutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};