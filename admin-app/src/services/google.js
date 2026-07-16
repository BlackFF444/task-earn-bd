// Google OAuth Login (for Android / Web standalone app)
// Uses Google Identity Services (GIS) loaded via script tag in index.html

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

export const googleService = {
  clientId: GOOGLE_CLIENT_ID,

  // Load Google Identity Services script
  loadScript: () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        resolve();
        return;
      }
      const existing = document.getElementById('google-identity-script');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  },

  // Prompt Google One Tap / consent, return user info
  signIn: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await googleService.loadScript();
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              const profile = await res.json();
              resolve({
                id: profile.sub,
                email: profile.email,
                name: profile.name,
                firstName: profile.given_name || profile.name,
                lastName: profile.family_name || '',
                photoURL: profile.picture,
                username: profile.email ? profile.email.split('@')[0] : '',
              });
            } catch (e) {
              reject(e);
            }
          },
        });
        client.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
  },
};
