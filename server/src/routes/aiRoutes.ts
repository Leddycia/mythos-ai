import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
// Note: Dans une implémentation réelle, déplacez la logique de geminiService.ts ici
// et utilisez le SDK Google GenAI côté serveur.

const router = Router();

router.post('/generate-text', authenticateToken, async (req, res) => {
  // TODO: Implémenter l'appel Gemini ici
  // const { prompt } = req.body;
  // const result = await ai.generateContent(prompt)...
  res.json({ message: "Endpoint prêt pour migration Gemini" });
});

export default router;