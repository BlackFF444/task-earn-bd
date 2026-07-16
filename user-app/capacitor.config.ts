import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskearnbd.app',
  appName: 'Task Earn BD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
