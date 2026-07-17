import { signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider } from './firebase';

export const authService = {
  signInWithGoogle: async () => {
    if (Capacitor.isNativePlatform()) {
      // Android/iOS: use native Google Sign-In plugin
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      await GoogleAuth.initialize({
        clientId: undefined, // uses capacitor.config.json serverClientId
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      const result = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }

    // Web: use Firebase popup
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
