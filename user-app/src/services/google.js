import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";

export const googleService = {
  clientId: GOOGLE_CLIENT_ID,

  initialize: () => {
    try {
      GoogleAuth.initialize({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } catch (e) {
      console.warn('GoogleAuth initialize warning:', e);
    }
  },

  signIn: async () => {
    try {
      googleService.initialize();
      const result = await GoogleAuth.signIn();
      const user = result.user;
      if (!user || !user.id) throw new Error('Google login failed - no user data');
      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        firstName: user.givenName || user.name || '',
        lastName: user.familyName || '',
        photoURL: user.imageUrl || null,
        username: user.email ? user.email.split('@')[0] : '',
      };
    } catch (e) {
      throw new Error(e.message || 'Google login failed');
    }
  },
};
