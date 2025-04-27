import admin from 'firebase-admin';

// Enhanced private key formatter that can handle different formats
const formatPrivateKey = (key: string | undefined): string | undefined => {
  // No key provided
  if (!key) return undefined;
  
  // Check if the key is already formatted correctly
  if (key.includes('-----BEGIN PRIVATE KEY-----') && 
      key.includes('-----END PRIVATE KEY-----') && 
      !key.includes('\\n')) {
    console.log('Private key appears to be properly formatted already');
    return key;
  }
  
  // The key might be a JSON string that needs to be parsed
  if (key.startsWith('"') && key.endsWith('"')) {
    try {
      key = JSON.parse(key);
      console.log('Successfully parsed private key from JSON format');
    } catch (e) {
      console.log('Private key is wrapped in quotes but not valid JSON');
    }
  }
  
  // Replace escaped newlines with real newlines
  if (key.includes('\\n')) {
    const formattedKey = key.replace(/\\n/g, '\n');
    console.log('Replaced escaped newlines in private key');
    return formattedKey;
  }
  
  // Return as is if none of the above conditions match
  console.log('Using private key as is');
  return key;
};

// Get Firebase configuration from environment variables
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

// Try to properly format the private key
const privateKey = formatPrivateKey(privateKeyRaw);

// Log the first few characters of private key for debugging (without exposing the full key)
if (privateKey) {
  const firstPartOfKey = privateKey.substring(0, 20);
  const hasProperFormat = privateKey.includes('-----BEGIN PRIVATE KEY-----');
  console.log(`Private key starts with: ${firstPartOfKey}...`);
  console.log(`Private key has proper PEM format: ${hasProperFormat}`);
}

let firebaseInitialized = false;
let auth: admin.auth.Auth;

try {
  // First try to initialize with full credentials if available
  if (projectId && clientEmail && privateKey) {
    console.log('Attempting to initialize Firebase Admin SDK with full credentials');
    try {
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      
      auth = admin.auth(app);
      firebaseInitialized = true;
      console.log('✓ Firebase Admin SDK initialized successfully with full credentials');
    } catch (certError) {
      console.error('Error initializing with credentials:', certError);
      throw certError; // Re-throw to be caught by outer try/catch
    }
  }
  // If we don't have all credentials, fall back to project ID only
  else if (projectId) {
    console.log('Falling back to project ID only initialization');
    const app = admin.initializeApp({
      projectId: projectId
    });
    
    auth = admin.auth(app);
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized with project ID only');
  }
  else {
    console.warn('Firebase Admin SDK not initialized due to missing project ID');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  
  // If full credentials failed but we have a project ID, try with just that
  if (projectId && !firebaseInitialized) {
    try {
      console.log('Attempting fallback initialization with project ID only');
      const app = admin.initializeApp({
        projectId: projectId
      });
      
      auth = admin.auth(app);
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized with fallback to project ID only');
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError);
    }
  }
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