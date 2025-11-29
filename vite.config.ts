import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode (ex: .env, .env.production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Vercel expose automatiquement les variables commençant par VITE_
  // On vérifie les deux cas possibles
  const apiKey = env.API_KEY || env.VITE_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ AVERTISSEMENT: Aucune clé API_KEY ou VITE_API_KEY trouvée lors du build. L'application passera en mode DEMO.");
  }

  return {
    plugins: [react()],
    define: {
      // Injection de la clé dans le code client de manière sécurisée
      // Si la clé est absente, on injecte une chaîne vide pour éviter le crash au build
      'process.env.API_KEY': JSON.stringify(apiKey || '')
    }
  };
});