
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis .env (si en local)
  // process.cwd() peut causer des soucis de typage, on le cast
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Priorité : 1. Variable système (Vercel) 2. Variable locale .env (VITE_)
  // Vercel expose "API_KEY", Vite préfère "VITE_API_KEY". On supporte les deux.
  const geminiKey = env.API_KEY || env.VITE_API_KEY;
  const openaiKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY;

  if (!geminiKey) {
    console.warn("⚠️ BUILD WARNING: API_KEY manquante. L'app affichera le message de configuration.");
  }

  return {
    plugins: [react()],
    define: {
      // Injection sécurisée dans le code client
      'process.env.API_KEY': JSON.stringify(geminiKey || ''),
      'import.meta.env.VITE_API_KEY': JSON.stringify(geminiKey || ''),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(openaiKey || ''),
      'process.env.VITE_OPENAI_API_KEY': JSON.stringify(openaiKey || '')
    }
  };
});
