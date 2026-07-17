const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";

export const googleService = {
  clientId: GOOGLE_CLIENT_ID,

  waitForGsi: () => {
    return new Promise((resolve) => {
      if (window.google && window.google.accounts) {
        resolve(true);
        return;
      }
      let attempts = 0;
      const check = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(check);
          resolve(true);
        }
        attempts++;
        if (attempts > 50) {
          clearInterval(check);
          resolve(false);
        }
      }, 200);
    });
  },

  signIn: async () => {
    const ready = await googleService.waitForGsi();
    if (!ready) throw new Error('Google services not available. Check internet connection.');

    return new Promise((resolve, reject) => {
      try {
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
              reject(new Error('Failed to get user profile'));
            }
          },
          error_callback: (err) => {
            reject(new Error(err.type || 'Google authentication failed'));
          },
        });
        client.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
  },
};
