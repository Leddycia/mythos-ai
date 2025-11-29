import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string };
  // Add explicit properties to avoid type errors if definitions are missing
  headers: any;
  body: any;
  params: any;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Cast to any to bypass "Property does not exist" errors caused by environment type mismatches
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return (res as any).status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return (res as any).status(403).json({ message: "Token invalide." });
  }
};