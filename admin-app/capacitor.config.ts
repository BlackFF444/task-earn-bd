import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskearnbd.admin',
  appName: 'Task Earn BD Admin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
