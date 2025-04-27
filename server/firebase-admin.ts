import admin from 'firebase-admin';

// Simply use project ID for initialization
// This avoids issues with private key formatting while still allowing for token verification
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

let firebaseInitialized = false;
let auth: admin.auth.Auth;

try {
  if (projectId) {
    console.log('Initializing Firebase Admin SDK with project ID');
    
    // Initialize with application default credentials
    const app = admin.initializeApp({
      projectId: projectId
    });
    
    auth = admin.auth(app);
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Firebase Admin SDK not initialized due to missing project ID');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

// Utility function to verify Firebase ID tokens
export async function verifyFirebaseToken(idToken: string) {
  if (!firebaseInitialized) {
    console.warn('Attempt to verify Firebase token but Firebase Admin SDK is not initialized');
    return null;
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

// Export auth object for use in other modules if initialized
export { auth, firebaseInitialized };