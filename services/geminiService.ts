
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, GeneratedStory, StoryGenre, MediaType, ImageStyle, VideoFormat, QuizQuestion } from '../types';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, APP_NAME } from '../constants';

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
            const errorBody = await response.text().catch(() => "Détails indisponibles");
            console.error(`[ElevenLabs API Error] Status: ${response.status}. Details: ${errorBody}`);
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
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Erreur HTTP Pollinations: ${response.status} ${response.statusText}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("[Pollinations API Error] Échec génération image:", error);
        return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
    }
}

// --- SERVICE VIDEO (SIMULATION) ---

const simulateVideoFromImage = async (base64ImageWithHeader: string): Promise<string> => {
    console.log("Simulation vidéo active...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return base64ImageWithHeader;
}

// --- HELPER CONFIGURATION MANQUANTE ---
const getConfigurationHelpStory = (topic: string): GeneratedStory => ({
    title: "⚠️ Clé API Manquante",
    content: `
### Configuration Requise pour ${APP_NAME}

Vous voyez ce message car **aucune clé API Google Gemini valide n'a été détectée**. L'application ne peut pas générer le contenu sur "${topic}".

#### Comment configurer la clé ?

1.  **Obtenir une clé :** Rendez-vous sur [Google AI Studio](https://aistudio.google.com/app/apikey) et créez une clé API gratuite.
2.  **En Local :** Créez un fichier \`.env\` à la racine du projet et ajoutez :
    \`\`\`bash
    VITE_API_KEY=votre_clé_commençant_par_AIza...
    \`\`\`
3.  **Sur Vercel / Netlify :** Allez dans les paramètres de votre projet, section **Environment Variables**, et ajoutez une variable nommée \`API_KEY\` avec votre clé.

Une fois la clé ajoutée, rechargez la page pour profiter de l'expérience complète !
    `,
    imagePrompt: "Error 404 robot repairing settings gear, digital art",
    imageUrl: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=1000",
    isVideoSimulated: true,
    nextStepSuggestion: "J'ai configuré ma clé, recharger la page ?"
});

// --- SERVICE OPENAI (FALLBACK) ---
const generateOpenAIContent = async (apiKey: string, prompt: string, model: string = "gpt-4o"): Promise<string> => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`OpenAI Error: ${response.status}`);
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error("OpenAI Fallback failed:", e);
        throw e;
    }
};

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
  // Récupération des clés
  const geminiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  const openAIKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.OPENAI_API_KEY;
  
  if ((!geminiKey || geminiKey === '') && (!openAIKey || openAIKey === '')) {
     return [];
  }

  const prompt = `
  Génère un Quiz interactif (QCM) de 5 questions basé EXCLUSIVEMENT sur le contenu ci-dessous.
  
  CONTENU À ÉVALUER:
  ${content.substring(0, 15000)}

  CIBLE: ${ageGroup}

  RÈGLES:
  1. Retourne JSON uniquement.
  2. Chaque question doit avoir 3 choix de réponse.
  3. Fournis une explication courte pour la bonne réponse.
  4. Varie les questions.

  SCHEMA:
  {
    "questions": [
       { "question": "...", "options": ["A", "B", "C"], "correctAnswer": "A", "explanation": "..." }
    ]
  }
  `;

  let responseText = '';

  // 1. Essai Gemini
  if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        responseText = response.text || '';
      } catch (e) {
        console.warn("Gemini Quiz failed, trying OpenAI...", e);
      }
  }

  // 2. Fallback OpenAI
  if (!responseText && openAIKey) {
      try {
          responseText = await generateOpenAIContent(openAIKey, prompt);
      } catch (e) {
          console.error("OpenAI Quiz failed too", e);
      }
  }

  if (!responseText) return [];

  try {
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const json = JSON.parse(cleanJson);
    
    if (json && Array.isArray(json.questions)) {
        return json.questions;
    }
    return [];
  } catch (error) {
    console.error("Erreur parsing quiz JSON:", error);
    return [];
  }
};

export const generateFullStory = async (request: StoryRequest): Promise<GeneratedStory> => {
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  const openAIKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.OPENAI_API_KEY;

  // VERIFICATION CRITIQUE DE LA CLÉ
  if ((!apiKey || apiKey === 'undefined' || apiKey === '') && (!openAIKey || openAIKey === '')) {
      console.error("🔴 AUCUNE CLÉ API DÉTECTÉE (Gemini ou OpenAI).");
      await new Promise(resolve => setTimeout(resolve, 1000));
      // RETOURNE LA CARTE D'AIDE À LA CONFIGURATION AU LIEU D'UNE HISTOIRE
      return getConfigurationHelpStory(request.topic);
  }

  try {
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
    1. NE PAS utiliser de titres explicites comme "Introduction", "Développement".
    2. Le texte doit couler naturellement.
    3. PAS de listes à puces excessives.
    4. INTERDICTION d'utiliser des émojis.
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
             Vous êtes "Professeur Mythos", un tuteur interactif.
             Structure attendue :
             1. Réponse directe à l'utilisateur.
             2. Interaction : Terminez par une ouverture (question, devinette).
             3. Ton : Adapté à l'âge (${request.ageGroup}).
             `;
             taskDescription = `L'utilisateur dit : "${request.topic}". Répondez.`;
        } else {
            systemInstruction = `Vous êtes un guide pédagogue expert. À la fin, proposez TOUJOURS une suite logique.`;
            taskDescription = `Expliquez : "${request.topic}".`;
        }
    } else {
        if (isConversation) {
             systemInstruction = "Vous êtes le Maître du Donjon narratif. Continuez l'aventure.";
             taskDescription = `L'utilisateur dit : "${request.topic}". Continuez l'histoire.`;
        } else {
            systemInstruction = "Vous êtes un conteur captivant. Proposez une suite à la fin.";
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
      Générez également une description visuelle EN ANGLAIS.
      
      Retournez la réponse au format JSON :
      {
        "title": "Titre",
        "content": "Contenu",
        "imagePrompt": "Description visuelle (Anglais)",
        "nextStepSuggestion": "Question pour continuer"
      }
    `;

    let textData: any = null;

    // 1. ESSAI GEMINI
    if (apiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            textData = JSON.parse(response.text || '{}');
        } catch (geminiError: any) {
             console.warn("Gemini generation failed, attempting fallback...", geminiError);
             if (!openAIKey) throw geminiError; // Si pas de fallback, on lance l'erreur
        }
    }

    // 2. FALLBACK OPENAI
    if (!textData && openAIKey) {
        try {
            console.log("Using OpenAI Fallback...");
            const jsonStr = await generateOpenAIContent(openAIKey, prompt);
            textData = JSON.parse(jsonStr);
        } catch (openaiError) {
            console.error("All AI services failed.");
            throw new Error("Tous les services IA sont indisponibles.");
        }
    }

    if (!textData) throw new Error("Génération échouée.");

    const title = textData.title || request.topic;
    const content = textData.content || "Contenu non disponible.";
    const imagePromptText = textData.imagePrompt || `Illustration of ${request.topic}`;
    const nextStepSuggestion = textData.nextStepSuggestion || "Continuer...";

    let imageUrl: string | undefined;
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const cultureStyle = request.includeHaitianCulture ? "Caribbean aesthetic, vibrant colors, " : "";
            const finalImagePrompt = `${imagePromptText}, ${cultureStyle}`;
            imageUrl = await generateFreeImage(finalImagePrompt, request.imageStyle);
        } catch (imgError) {
            console.warn("Image gen failed", imgError);
            imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000";
        }
    }

    let videoUrl: string | undefined;
    let isVideoSimulated = false;
    
    if (request.mediaType === MediaType.VIDEO && imageUrl) {
         videoUrl = await simulateVideoFromImage(imageUrl);
         isVideoSimulated = true;
    }

    let audioUrl: string | undefined;
    try {
        audioUrl = await generateElevenLabsAudio(content);
    } catch (audioError) {
        console.warn("Audio gen failed", audioError);
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
    console.error("[Service] Critical Failure:", error);
    
    // Si c'est une erreur de clé ou d'authentification explicite qui a filtré
    if (error.message?.includes('API key') || error.message?.includes('401')) {
        return getConfigurationHelpStory(request.topic);
    }
    
    throw new Error(`Erreur: ${error.message || "Le service IA est indisponible."}`);
  }
};
