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
                'xi-api-key': "81454163426af0e27eda7e64fb3da07d0e5e91dece59b954e1589c8276df58c5",
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
            console.warn("ElevenLabs limit reached or error, falling back...");
            return ""; // Retourner vide pour gérer le fallback silencieusement
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
        return "";
    }
};

// --- SERVICE IMAGE GRATUIT (Pollinations.ai) ---

const generateFreeImage = async (prompt: string, style: ImageStyle): Promise<string> => {
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, 8k resolution, cinematic lighting`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    try {
        // On vérifie juste que l'URL est accessible
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
        // Fallback image si l'API échoue
        return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
    }
}

// --- SERVICE VIDEO (SIMULATION) ---

const simulateVideoFromImage = async (base64ImageWithHeader: string): Promise<string> => {
    console.log("Simulation vidéo active...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return base64ImageWithHeader;
}

// --- MOCK DATA FOR DEMO MODE ---
const getMockStory = (topic: string): GeneratedStory => ({
    title: `Démo : ${topic}`,
    content: `Ceci est une histoire de démonstration générée car la clé API Google Gemini n'a pas été détectée.
    
    MythosAI fonctionne normalement en se connectant à l'intelligence artificielle de Google. En attendant que vous configuriez votre clé API, voici un exemple de ce à quoi ressemble une leçon.
    
    Le sujet demandé était : **${topic}**.
    
    Dans un environnement réel, l'IA aurait expliqué ce concept en détail, adapté à votre niveau, avec des exemples pertinents et une narration fluide.`,
    imagePrompt: "Futuristic artificial intelligence glowing brain interface, digital art",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
    isVideoSimulated: true
});

// --- FONCTIONS EXPORTÉES ---

export const regenerateAudio = async (text: string): Promise<string | undefined> => {
    return await generateElevenLabsAudio(text);
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
      imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
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
  // 1. RECUPERATION DE LA CLÉ API
  // On vérifie process.env.API_KEY injecté par Vite define, ou import.meta.env
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

  // 2. MODE DÉMO / FALLBACK
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.warn("⚠️ CLÉ MANQUANTE : Passage en mode DÉMO.");
      // Simulation d'attente pour le réalisme
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getMockStory(request.topic);
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
    3. PAS de listes à puces ou de numérotation.
    `;

    if (isVideoMode) {
        constraints = `
        CONTRAINTE VIDEO (15s) :
        - Texte EXTRÊMEMENT COURT (Max 40 mots).
        - Style script dynamique.
        ${narrativeConstraints}
        `;
    } else {
        constraints = `
        - Soyez complet et pédagogue mais conversationnel.
        ${narrativeConstraints}
        `;
    }

    if (isEducational) {
        systemInstruction = `Vous êtes un guide pédagogue expert.`;
        taskDescription = `Expliquez : "${request.topic}".`;
    } else {
        systemInstruction = "Vous êtes un conteur captivant.";
        taskDescription = `Racontez une histoire sur : "${request.topic}".`;
    }

    const prompt = `
      ${systemInstruction}
      
      TÂCHE : ${taskDescription}
      
      ${constraints}

      PARAMÈTRES :
      - Public : ${request.ageGroup}
      - Langue : ${request.language}
      ${culturePrompt}

      IMAGE PROMPT (Important) :
      Générez également une description visuelle EN ANGLAIS.
      
      Retournez la réponse au format JSON :
      {
        "title": "Titre",
        "content": "Contenu",
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
    const title = textData.title || request.topic;
    const content = textData.content || "Contenu non disponible.";
    const imagePromptText = textData.imagePrompt || `Illustration of ${request.topic}`;

    // === 2. IMAGE GENERATION (API Gratuite - Pollinations) ===
    let imageUrl: string | undefined;
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const cultureStyle = request.includeHaitianCulture ? "Caribbean aesthetic, vibrant colors, " : "";
            const finalImagePrompt = `${imagePromptText}, ${cultureStyle}`;
            imageUrl = await generateFreeImage(finalImagePrompt, request.imageStyle);
        } catch (imgError) {
            console.warn("Image generation failed, using placeholder");
            imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
        }
    }

    // === 3. VIDEO GENERATION (SIMULATION) ===
    let videoUrl: string | undefined;
    let isVideoSimulated = false;
    
    if (request.mediaType === MediaType.VIDEO && imageUrl) {
         videoUrl = await simulateVideoFromImage(imageUrl);
         isVideoSimulated = true;
    }

    // === 4. AUDIO GENERATION (ElevenLabs) ===
    let audioUrl: string | undefined;
    try {
        audioUrl = await generateElevenLabsAudio(content);
    } catch (audioError) {
        console.warn("Audio generation failed");
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
    // En cas d'erreur API réelle, on fallback sur le mock pour ne pas bloquer l'utilisateur
    if (error.message?.includes('API key') || error.message?.includes('403') || error.message?.includes('401')) {
        return getMockStory(request.topic);
    }
    throw new Error("Une erreur est survenue. Le mode démo a été activé.");
  }
};
