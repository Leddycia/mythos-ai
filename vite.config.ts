import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode (ex: .env, .env.production)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // On cherche la clé dans process.env (Vercel standard) ou VITE_API_KEY
  const apiKey = env.API_KEY || env.VITE_API_KEY;

  return {
    plugins: [react()],
    define: {
      // Injection de la clé dans le code client
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});