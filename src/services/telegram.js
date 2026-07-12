// Telegram WebApp SDK Integration
// Docs: https://core.telegram.org bots/webapps

const tg = window.Telegram?.WebApp;

export const telegramService = {
  // Check if running inside Telegram
  isTelegramWebApp: () => {
    return !!window.Telegram?.WebApp;
  },

  // Initialize Telegram Mini App
  init: () => {
    if (!tg) return false;
    
    // Request full screen mode
    tg.requestFullscreen();
    
    // Disable vertical swipes
    tg.disableVerticalSwipes();
    
    // Set header color
    tg.setHeaderColor('#05060f');
    
    // Set background color
    tg.setBackgroundColor('#05060f');
    
    // Expand the app
    tg.expand();
    
    return true;
  },

  // Get current user data from Telegram
  getUser: () => {
    if (!tg?.initDataUnsafe?.user) return null;
    
    const user = tg.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || null,
      languageCode: user.language_code || 'en',
      isPremium: user.is_premium || false,
    };
  },

  // Get initData for server verification
  getInitData: () => {
    return tg?.initData || '';
  },

  // Show Main Button
  showMainButton: (text, callback) => {
    if (!tg) return;
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
  },

  // Hide Main Button
  hideMainButton: () => {
    if (!tg) return;
    tg.MainButton.hide();
  },

  // Show Back Button
  showBackButton: (callback) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
  },

  // Hide Back Button
  hideBackButton: () => {
    if (!tg) return;
    tg.BackButton.hide();
  },

  // Send data to bot
  sendData: (data) => {
    if (!tg) return;
    tg.sendData(JSON.stringify(data));
  },

  // Close the Mini App
  close: () => {
    if (!tg) return;
    tg.close();
  },

  // Show alert
  showAlert: (message) => {
    if (!tg) {
      window.alert(message);
      return;
    }
    tg.showAlert(message);
  },

  // Show confirm
  showConfirm: (message) => {
    if (!tg) {
      return Promise.resolve(window.confirm(message));
    }
    return new Promise((resolve) => {
      tg.showConfirm(message, (confirmed) => resolve(confirmed));
    });
  },

  // Haptic feedback
  hapticFeedback: (type = 'impact') => {
    if (!tg?.HapticFeedback) return;
    
    switch (type) {
      case 'impact':
        tg.HapticFeedback.impactOccurred('medium');
        break;
      case 'notification':
        tg.HapticFeedback.notificationOccurred('success');
        break;
      case 'selection':
        tg.HapticFeedback.selectionChanged();
        break;
    }
  },

  // Get platform info
  platform: tg?.platform || 'unknown',
  colorScheme: tg?.colorScheme || 'dark',
  themeParams: tg?.themeParams || {},
};
