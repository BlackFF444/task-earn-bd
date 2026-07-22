import { signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider } from './firebase';

let googleAuthInitialized = false;

async function initGoogleAuth() {
  if (googleAuthInitialized) return;
  const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
  await GoogleAuth.initialize({
    clientId: undefined,
    scopes: ['profile', 'email'],
    grantOfflineAccess: false,
  });
  googleAuthInitialized = true;
}

export const authService = {
  signInWithGoogle: async () => {
    if (Capacitor.isNativePlatform()) {
      await initGoogleAuth();
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      const result = await GoogleAuth.signIn();
      if (!result || !result.authentication || !result.authentication.idToken) {
        throw new Error('Google Sign-In failed: no idToken received');
      }
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  logout: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
        await GoogleAuth.signOut();
      } catch {}
    }
    await signOut(auth);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
};
