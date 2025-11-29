import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, GeneratedStory, StoryGenre, MediaType, ImageStyle, VideoFormat } from '../types';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../constants';

// --- SERVICE AUDIO ELEVENLABS ---

export const generateElevenLabsAudio = async (text: string): Promise<string> => {
    const cleanText = text
        .replace(/[*#_]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/^(Introduction|Conclusion|Titre|Concept|Résumé)\s*:/gmi, '')
        .trim();

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: cleanText,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail?.message || "Erreur ElevenLabs");
        }

        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Erreur génération audio ElevenLabs:", error);
        throw error;
    }
};

// --- SERVICE IMAGE GRATUIT (Pollinations.ai) ---

const generateFreeImage = async (prompt: string, style: ImageStyle): Promise<string> => {
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, 8k resolution, cinematic lighting`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                resolve(base64Url);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Erreur génération image gratuite:", error);
        throw new Error("Impossible de générer l'image via l'API gratuite.");
    }
}

// --- SERVICE VIDEO (SIMULATION) ---

const simulateVideoFromImage = async (base64ImageWithHeader: string): Promise<string> => {
    console.log("Simulation vidéo active...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return base64ImageWithHeader;
}

// --- FONCTIONS EXPORTÉES ---

export const regenerateAudio = async (text: string): Promise<string | undefined> => {
    try {
        return await generateElevenLabsAudio(text);
    } catch (e) {
        console.error("Echec régénération audio:", e);
        return undefined;
    }
};

export const regenerateStoryImage = async (
  currentPrompt: string, 
  style: ImageStyle,
  mediaType: MediaType,
  videoFormat?: VideoFormat
): Promise<{ imageUrl: string; videoUrl?: string; videoError?: string; videoFormat?: VideoFormat; isVideoSimulated?: boolean }> => {
  
  let imageUrl = "";
  try {
      imageUrl = await generateFreeImage(currentPrompt, style);
  } catch (e) {
      throw new Error("La régénération de l'image a échoué.");
  }

  let videoUrl: string | undefined;
  let isVideoSimulated = false;

  if (mediaType === MediaType.VIDEO && imageUrl) {
      videoUrl = await simulateVideoFromImage(imageUrl);
      isVideoSimulated = true;
  }

  return { imageUrl, videoUrl, videoFormat, isVideoSimulated };
};

export const generateFullStory = async (request: StoryRequest): Promise<GeneratedStory> => {
  // VÉRIFICATION CRITIQUE DE LA CLÉ API
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
      throw new Error("Clé API Google Gemini manquante. Veuillez configurer la variable d'environnement API_KEY dans Vercel (Settings > Environment Variables).");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // === 1. TEXT GENERATION (Foundation) ===
    
    const culturePrompt = request.includeHaitianCulture
      ? "IMPORTANT: Intégrez naturellement des références haïtiennes (lieux, proverbes, culture) dans le récit sans le forcer."
      : "";

    const isEducational = request.genre === StoryGenre.EDUCATIONAL;
    const isVideoMode = request.mediaType === MediaType.VIDEO;

    let systemInstruction = "";
    let taskDescription = "";
    let constraints = "";

    const narrativeConstraints = `
    RÈGLES DE NARRATION STRICTES :
    1. NE PAS utiliser de titres explicites comme "Introduction", "Développement", "Concept Clé", "Résumé", "Conclusion".
    2. Le texte doit couler naturellement, comme si une personne parlait.
    3. PAS de listes à puces ou de numérotation, sauf si absolument nécessaire pour une liste d'ingrédients ou d'étapes courtes.
    4. Expliquez les concepts directement dans le flux du récit.
    `;

    if (isVideoMode) {
        constraints = `
        CONTRAINTE VIDEO (15s) :
        - Texte EXTRÊMEMENT COURT (Max 40 mots).
        - Style script dynamique pour vidéo courte.
        ${narrativeConstraints}
        `;
    } else {
        constraints = `
        - Soyez complet et pédagogue mais conversationnel.
        ${narrativeConstraints}
        `;
    }

    if (isEducational) {
        systemInstruction = `Vous êtes un guide pédagogue expert. Vous expliquez les choses comme si vous parliez à un élève en face de vous.`;
        taskDescription = `Expliquez le sujet : "${request.topic}".`;
    } else {
        systemInstruction = "Vous êtes un conteur captivant.";
        taskDescription = `Racontez une histoire sur : "${request.topic}".`;
    }

    const prompt = `
      ${systemInstruction}
      
      TÂCHE : ${taskDescription}
      
      ${constraints}

      PARAMÈTRES :
      - Public : ${request.ageGroup} (Adaptez le vocabulaire et le ton)
      - Langue : ${request.language}
      ${culturePrompt}

      IMAGE PROMPT (Important) :
      Générez également une description visuelle EN ANGLAIS pour le générateur d'images.
      
      Retournez la réponse au format JSON :
      {
        "title": "Un titre court et accrocheur",
        "content": "Le texte narratif fluide",
        "imagePrompt": "Description visuelle (Anglais)"
      }
    `;

    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["title", "content", "imagePrompt"],
        }
      }
    });

    const textData = JSON.parse(textResponse.text || '{}');
    const title = textData.title || "Sans titre";
    const content = textData.content || "Aucun contenu généré.";
    const imagePromptText = textData.imagePrompt || `Educational illustration about ${request.topic}`;

    // === 2. IMAGE GENERATION (API Gratuite - Pollinations) ===
    
    let imageUrl: string | undefined;
    
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const cultureStyle = request.includeHaitianCulture ? "Caribbean aesthetic, vibrant colors, " : "";
            const finalImagePrompt = `${imagePromptText}, ${cultureStyle}`;
            imageUrl = await generateFreeImage(finalImagePrompt, request.imageStyle);
        } catch (imgError) {
            console.warn("Image generation failed:", imgError);
        }
    }

    // === 3. VIDEO GENERATION (SIMULATION) ===
    let videoUrl: string | undefined;
    let isVideoSimulated = false;
    
    if (request.mediaType === MediaType.VIDEO) {
        if (imageUrl) {
             videoUrl = await simulateVideoFromImage(imageUrl);
             isVideoSimulated = true;
        }
    }

    // === 4. AUDIO GENERATION (ElevenLabs) ===
    let audioUrl: string | undefined;
    try {
        audioUrl = await generateElevenLabsAudio(content);
    } catch (audioError) {
        console.warn("Audio generation failed:", audioError);
    }

    return {
        title,
        content,
        imageUrl, 
        audioUrl,
        videoUrl,
        imagePrompt: imagePromptText,
        videoFormat: request.videoFormat,
        isVideoSimulated
    };

  } catch (error: any) {
    console.error("Content generation failed:", error);
    // Renvoi de l'erreur avec un message plus explicite si c'est la clé
    if (error.message?.includes('API key')) {
        throw new Error("Problème de configuration API. Vérifiez votre clé API_KEY sur Vercel.");
    }
    throw new Error(error.message || "Échec de la génération.");
  }
};