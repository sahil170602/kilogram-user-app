import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kilogram.rider',
  appName: 'Kilogram Rider',
  webDir: 'dist',
  server: {
    // 🎯 Ensure this is set to allow local file loading
    androidScheme: 'https',
    cleartext: true 
  }
};

export default config;