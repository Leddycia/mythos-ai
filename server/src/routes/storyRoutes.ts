import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Obtenir l'historique de l'utilisateur connecté
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stories = await prisma.story.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limite pour performance
    });
    (res as any).json(stories);
  } catch (error) {
    (res as any).status(500).json({ message: "Erreur chargement historique" });
  }
});

// Sauvegarder une nouvelle histoire
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, topic, genre, mediaType, imageUrl, audioUrl, videoUrl } = req.body;
    
    const story = await prisma.story.create({
      data: {
        userId: req.user!.userId,
        title, content, topic, genre, mediaType,
        imageUrl, audioUrl, videoUrl
      }
    });
    
    (res as any).json(story);
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ message: "Erreur sauvegarde" });
  }
});

// Supprimer une histoire
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.story.deleteMany({
      where: { 
        id: req.params.id,
        userId: req.user!.userId // Sécurité: on ne supprime que ses propres histoires
      }
    });
    (res as any).json({ message: "Histoire supprimée" });
  } catch (error) {
    (res as any).status(500).json({ message: "Erreur suppression" });
  }
});

export default router;