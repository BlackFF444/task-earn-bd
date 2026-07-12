// Telegram WebApp SDK Integration
// Docs: https://core.telegram.org bots/webapps

// Always read fresh — SDK may load async after this module
const getTg = () => window.Telegram?.WebApp;

export const telegramService = {
  // Check if running inside Telegram
  isTelegramWebApp: () => {
    return !!window.Telegram?.WebApp;
  },

  // Initialize Telegram Mini App
  init: () => {
    const tg = getTg();
    if (!tg) return false;
    
    try {
      tg.requestFullscreen();
      tg.disableVerticalSwipes();
      tg.setHeaderColor('#05060f');
      tg.setBackgroundColor('#05060f');
      tg.expand();
    } catch (e) {
      console.warn('Telegram init warning:', e);
    }
    
    return true;
  },

  // Get current user data from Telegram
  getUser: () => {
    const tg = getTg();
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
      startParam: tg.initDataUnsafe.start_param || null,
    };
  },

  // Get initData for server verification
  getInitData: () => {
    return getTg()?.initData || '';
  },

  // Show Main Button
  showMainButton: (text, callback) => {
    const tg = getTg();
    if (!tg) return;
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
  },

  // Hide Main Button
  hideMainButton: () => {
    const tg = getTg();
    if (!tg) return;
    tg.MainButton.hide();
  },

  // Show Back Button
  showBackButton: (callback) => {
    const tg = getTg();
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
  },

  // Hide Back Button
  hideBackButton: () => {
    const tg = getTg();
    if (!tg) return;
    tg.BackButton.hide();
  },

  // Send data to bot
  sendData: (data) => {
    const tg = getTg();
    if (!tg) return;
    tg.sendData(JSON.stringify(data));
  },

  // Close the Mini App
  close: () => {
    const tg = getTg();
    if (!tg) return;
    tg.close();
  },

  // Show alert
  showAlert: (message) => {
    const tg = getTg();
    if (!tg) {
      window.alert(message);
      return;
    }
    tg.showAlert(message);
  },

  // Show confirm
  showConfirm: (message) => {
    const tg = getTg();
    if (!tg) {
      return Promise.resolve(window.confirm(message));
    }
    return new Promise((resolve) => {
      tg.showConfirm(message, (confirmed) => resolve(confirmed));
    });
  },

  // Haptic feedback
  hapticFeedback: (type = 'impact') => {
    const tg = getTg();
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

  // Get platform info (read fresh each time)
  get platform() { return getTg()?.platform || 'unknown'; },
  get colorScheme() { return getTg()?.colorScheme || 'dark'; },
  get themeParams() { return getTg()?.themeParams || {}; },
};
