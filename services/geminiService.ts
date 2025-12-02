
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, GeneratedStory, StoryGenre, MediaType, ImageStyle, VideoFormat, QuizQuestion } from '../types';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../constants';

// --- SERVICE AUDIO ELEVENLABS ---

export const generateElevenLabsAudio = async (text: string): Promise<string> => {
    const cleanText = text
        .replace(/[*#_]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/^(Introduction|Conclusion|Titre|Concept|Résumé)\s*:/gmi, '')
        .trim();

    if (!cleanText) return "";

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
            // Tentative de lecture du message d'erreur détaillé de l'API
            const errorBody = await response.text().catch(() => "Détails indisponibles");
            console.error(`[ElevenLabs API Error] Status: ${response.status}. Details: ${errorBody}`);
            
            // Si erreur de quota ou d'auth, on retourne vide pour fallback silencieux
            return ""; 
        }

        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (e) => {
                console.error("[ElevenLabs] Erreur conversion Blob vers Base64", e);
                reject(e);
            };
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("[ElevenLabs Network Error] Impossible de contacter le service audio:", error);
        return "";
    }
};

// --- SERVICE IMAGE GRATUIT (Pollinations.ai) ---

const generateFreeImage = async (prompt: string, style: ImageStyle): Promise<string> => {
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, 8k resolution, cinematic lighting`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    try {
        // On vérifie que l'URL est accessible et renvoie bien une image
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP Pollinations: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                resolve(base64Url);
            };
            reader.onerror = (e) => {
                console.error("[Pollinations] Erreur lecture Blob image", e);
                reject(e);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("[Pollinations API Error] Échec génération image:", error);
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
    content: `Ceci est une histoire de démonstration générée car la clé API Google Gemini n'a pas été détectée ou une erreur critique est survenue.
    
    MythosAI fonctionne normalement en se connectant à l'intelligence artificielle de Google. En attendant que vous configuriez votre clé API, voici un exemple de ce à quoi ressemble une leçon.
    
    Le sujet demandé était : **${topic}**.
    
    Dans un environnement réel, l'IA aurait expliqué ce concept en détail, adapté à votre niveau, avec des exemples pertinents et une narration fluide.`,
    imagePrompt: "Futuristic artificial intelligence glowing brain interface, digital art",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
    isVideoSimulated: true,
    nextStepSuggestion: "Voulez-vous que je vous explique comment fonctionne une API plus en détail ?"
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
      console.warn("Erreur régénération image, utilisation fallback");
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

export const generateQuizFromContent = async (content: string, ageGroup: string): Promise<QuizQuestion[]> => {
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
     return [
       { question: "Question de démo 1 ?", options: ["Rép A", "Rép B", "Rép C"], correctAnswer: "Rép A", explanation: "Explication démo" },
       { question: "Question de démo 2 ?", options: ["Rép A", "Rép B", "Rép C"], correctAnswer: "Rép B", explanation: "Explication démo" },
       { question: "Question de démo 3 ?", options: ["Rép A", "Rép B", "Rép C"], correctAnswer: "Rép A", explanation: "Explication démo" },
       { question: "Question de démo 4 ?", options: ["Rép A", "Rép B", "Rép C"], correctAnswer: "Rép B", explanation: "Explication démo" },
       { question: "Question de démo 5 ?", options: ["Rép A", "Rép B", "Rép C"], correctAnswer: "Rép C", explanation: "Explication démo" }
     ];
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  Génère un Quiz interactif (QCM) de 5 questions basé EXCLUSIVEMENT sur le contenu suivant.
  
  CONTENU:
  ${content.substring(0, 4000)}

  CIBLE: ${ageGroup}

  RÈGLES:
  1. Retourne JSON uniquement.
  2. Chaque question doit avoir 3 choix de réponse.
  3. Fournis une explication courte pour la bonne réponse.
  4. Varie les questions pour couvrir tout le sujet.
  5. Génère exactement 5 questions.

  SCHEMA:
  {
    "questions": [
       { "question": "...", "options": ["A", "B", "C"], "correctAnswer": "A", "explanation": "..." }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            },
                            required: ["question", "options", "correctAnswer", "explanation"]
                        }
                    }
                }
            }
        }
    });

    const json = JSON.parse(response.text || '{}');
    return json.questions || [];
  } catch (error) {
    console.error("Erreur génération quiz:", error);
    return [];
  }
};

export const generateFullStory = async (request: StoryRequest): Promise<GeneratedStory> => {
  // 1. RECUPERATION DE LA CLÉ API
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

  // 2. MODE DÉMO / FALLBACK
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.warn("⚠️ CLÉ MANQUANTE : Passage en mode DÉMO.");
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
    const isConversation = request.isFollowUp;

    let systemInstruction = "";
    let taskDescription = "";
    let constraints = "";
    let historyContext = "";

    // Construction de l'historique de conversation
    if (request.conversationHistory && request.conversationHistory.length > 0) {
        const historyStr = request.conversationHistory.map(turn => 
            `${turn.role === 'user' ? 'Élève/Utilisateur' : 'Professeur Mythos'}: "${turn.text}"`
        ).join('\n');
        
        historyContext = `
        HISTORIQUE DE LA CONVERSATION RÉCENTE :
        ${historyStr}
        
        INSTRUCTION : Tenez compte de cet historique. Ne répétez pas ce qui a déjà été dit. Répondez directement à la dernière intervention de l'utilisateur.
        `;
    }

    const narrativeConstraints = `
    RÈGLES DE NARRATION STRICTES :
    1. NE PAS utiliser de titres explicites comme "Introduction", "Développement", "Concept Clé".
    2. Le texte doit couler naturellement, comme si une personne parlait.
    3. PAS de listes à puces ou de numérotation excessive.
    4. INTERDICTION d'utiliser des émojis dans le texte ou les suggestions.
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
        if (isConversation) {
             systemInstruction = `
             Vous êtes "Professeur Mythos", un tuteur interactif et dynamique. 
             Nous sommes dans un DIALOGUE continu avec l'élève.
             Votre but : Répondre aux questions, corriger si nécessaire, encourager, et maintenir l'engagement.
             
             Structure attendue :
             1. Réponse directe : Répondez à la question ou à la remarque de l'utilisateur.
             2. Interaction : Terminez TOUJOURS par une ouverture (une nouvelle question, une devinette, ou une demande d'opinion) pour forcer l'utilisateur à répondre.
             3. Ton : Encourageant, curieux et adapté à l'âge (${request.ageGroup}).
             `;
             taskDescription = `L'utilisateur dit : "${request.topic}". Répondez-lui en tenant compte du contexte.`;
        } else {
            systemInstruction = `Vous êtes un guide pédagogue expert et bienveillant. À la fin de votre explication, vous devez TOUJOURS proposer une suite logique sous forme de question directe à l'élève.`;
            taskDescription = `Expliquez : "${request.topic}".`;
        }
    } else {
        // Mode Histoire
        if (isConversation) {
             systemInstruction = "Vous êtes le Maître du Donjon narratif. Le lecteur réagit à l'histoire. Continuez l'aventure en prenant en compte sa réponse.";
             taskDescription = `L'utilisateur dit : "${request.topic}". Continuez l'histoire.`;
        } else {
            systemInstruction = "Vous êtes un conteur captivant. À la fin de l'histoire, proposez au lecteur d'imaginer une suite ou d'explorer un aspect de l'univers.";
            taskDescription = `Racontez une histoire sur : "${request.topic}".`;
        }
    }

    const prompt = `
      ${systemInstruction}
      
      ${historyContext}

      TÂCHE ACTUELLE : ${taskDescription}
      
      ${constraints}

      PARAMÈTRES :
      - Public : ${request.ageGroup}
      - Langue : ${request.language}
      ${culturePrompt}

      IMAGE PROMPT (Important) :
      Générez également une description visuelle EN ANGLAIS pour illustrer cette partie spécifique de la conversation.
      
      Retournez la réponse au format JSON :
      {
        "title": "Titre (ou sujet de la réponse)",
        "content": "Contenu (conversationnel)",
        "imagePrompt": "Description visuelle (Anglais)",
        "nextStepSuggestion": "Question pour continuer (ex: 'Prêt pour la réponse du quiz ?' ou 'Veux-tu savoir pourquoi...?')"
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
            nextStepSuggestion: { type: Type.STRING },
          },
          required: ["title", "content", "imagePrompt", "nextStepSuggestion"],
        }
      }
    });

    const textData = JSON.parse(textResponse.text || '{}');
    const title = textData.title || request.topic;
    const content = textData.content || "Contenu non disponible.";
    const imagePromptText = textData.imagePrompt || `Illustration of ${request.topic}`;
    const nextStepSuggestion = textData.nextStepSuggestion || "Continuer...";

    // === 2. IMAGE GENERATION (API Gratuite - Pollinations) ===
    let imageUrl: string | undefined;
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const cultureStyle = request.includeHaitianCulture ? "Caribbean aesthetic, vibrant colors, " : "";
            const finalImagePrompt = `${imagePromptText}, ${cultureStyle}`;
            imageUrl = await generateFreeImage(finalImagePrompt, request.imageStyle);
        } catch (imgError) {
            console.warn("[Service] Image generation failed, using placeholder", imgError);
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
        if (!audioUrl) {
           console.warn("[Service] ElevenLabs a retourné une réponse vide (quota ?)");
        }
    } catch (audioError) {
        console.warn("[Service] Audio generation failed globally:", audioError);
    }

    return {
        title,
        content,
        imageUrl, 
        audioUrl,
        videoUrl,
        imagePrompt: imagePromptText,
        videoFormat: request.videoFormat,
        isVideoSimulated,
        nextStepSuggestion
    };

  } catch (error: any) {
    console.error("[Service] Content generation critical failure:", error);
    
    // Détection d'erreurs d'autorisation
    if (error.message?.includes('API key') || error.message?.includes('403') || error.message?.includes('401')) {
        return getMockStory(request.topic);
    }
    
    // Pour toute autre erreur, on ne crash pas, on renvoie une version dégradée si possible, sinon une erreur lisible
    throw new Error("Le service IA est momentanément indisponible. Veuillez vérifier votre connexion ou réessayer plus tard.");
  }
};
