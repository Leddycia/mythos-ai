import { StoryGenre, AgeGroup, ImageStyle, MediaType, VideoFormat } from './types';

export const STORY_GENRES = [
  { value: StoryGenre.EDUCATIONAL, label: '🎓 Leçon / Explication de Cours' },
  { value: StoryGenre.FANTASY, label: '✨ Histoire Fantastique' },
  { value: StoryGenre.SCI_FI, label: '🚀 Science-Fiction' },
  { value: StoryGenre.FOLKTALE, label: '📜 Conte & Légende' },
  { value: StoryGenre.MYSTERY, label: '🕵️ Mystère' },
  { value: StoryGenre.ADVENTURE, label: '🌍 Aventure' },
];

export const AGE_GROUPS = [
  { value: AgeGroup.CHILD, label: '🧸 Enfants (5-10 ans) - Explique-moi comme si j\'avais 5 ans' },
  { value: AgeGroup.TEEN, label: '🎒 Adolescents (11-17 ans) - Cool et pertinent' },
  { value: AgeGroup.ADULT, label: '🎓 Adultes (18+) - Détaillé et pro' },
];

export const IMAGE_STYLES = [
  { value: ImageStyle.DIGITAL_ART, label: '🎨 Art Numérique (Moderne)' },
  { value: ImageStyle.CARTOON, label: '🎬 Animation 3D / Pixar' },
  { value: ImageStyle.REALISTIC, label: '📸 Photographies Réalistes' },
  { value: ImageStyle.WATERCOLOR, label: '🖌️ Aquarelle Douce' },
  { value: ImageStyle.OIL_PAINTING, label: '🖼️ Peinture à l\'huile Classique' },
  { value: ImageStyle.SKETCH, label: '✏️ Esquisse au Crayon' },
  { value: ImageStyle.RETRO, label: '🎞️ Rétro / Vintage' },
];

export const MEDIA_TYPES = [
  { value: MediaType.TEXT_WITH_IMAGE, label: '📝🖼️ Leçon Illustrée (Texte + Image)' },
  { value: MediaType.TEXT_ONLY, label: '📝 Leçon Texte (Simple)' },
  { value: MediaType.VIDEO, label: '🎥 Vidéo Explicative (Pixazo/Sora)' },
];

export const VIDEO_FORMATS = [
  { value: VideoFormat.MP4, label: 'MP4 (Standard Web)' },
  { value: VideoFormat.MOV, label: 'MOV (Haute Qualité)' },
];

export const LANGUAGES = [
  { value: 'Français', label: '🇫🇷 Français' },
  { value: 'Haitian Creole', label: '🇭🇹 Créole Haïtien' },
  { value: 'English', label: '🇺🇸 Anglais' },
  { value: 'Spanish', label: '🇪🇸 Espagnol' },
];

export const APP_NAME = "MythosAI";

// Configuration de l'API Vidéo Personnalisée (Pixazo / Open-Sora)
export const VIDEO_API_KEY = 'fb7aeba79cfe4959b042396fbb9325f8';
export const VIDEO_API_URL = 'https://gateway.pixazo.ai/sora-video/v1/video/i2v/generate';