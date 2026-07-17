import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const authService = {
  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  logout: async () => {
    await signOut(auth);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
};
