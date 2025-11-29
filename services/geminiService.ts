
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryRequest, GeneratedStory, StoryGenre, MediaType, ImageStyle, VideoFormat } from '../types';
import { VIDEO_API_KEY, VIDEO_API_URL } from '../constants';

// Fonction auxiliaire pour régénérer uniquement l'image (ou la vidéo)
export const regenerateStoryImage = async (
  currentPrompt: string, 
  style: ImageStyle,
  mediaType: MediaType,
  videoFormat?: VideoFormat
): Promise<{ imageUrl: string; videoUrl?: string; videoError?: string; videoFormat?: VideoFormat }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // 1. Génération Image
  const finalImagePrompt = `${currentPrompt}. \n\nStyle: ${style}. \nHigh resolution, detailed, masterpiece.`;
  
  let imageUrl = "";
  let base64Image = "";

  const imageResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
          parts: [{ text: finalImagePrompt }]
      },
      config: {
      imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
      }
      }
  });

  const candidates = imageResponse.candidates;
  if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
              base64Image = part.inlineData.data;
              imageUrl = `data:${part.inlineData.mimeType};base64,${base64Image}`;
              break;
          }
      }
  }

  if (!imageUrl) {
    throw new Error("La régénération de l'image a échoué.");
  }

  // 2. Si c'était une vidéo, on tente de régénérer la vidéo aussi à partir de l'image
  let videoUrl: string | undefined;
  let videoError: string | undefined;

  if (mediaType === MediaType.VIDEO && base64Image) {
      try {
        videoUrl = await generateVideoFromImage(currentPrompt, base64Image, videoFormat);
      } catch (e: any) {
        console.error("Erreur régénération vidéo:", e);
        videoError = e.message;
      }
  }

  return { imageUrl, videoUrl, videoError, videoFormat };
};

// Fonction isolée pour l'appel API Vidéo (Image to Video)
const generateVideoFromImage = async (prompt: string, base64Image: string, format?: VideoFormat): Promise<string> => {
    console.log(`Appel de l'API Vidéo (${VIDEO_API_URL}) avec format ${format || 'défaut'}...`);
          
    const videoApiResponse = await fetch(VIDEO_API_URL, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VIDEO_API_KEY}`,
      },
      body: JSON.stringify({
          prompt: prompt,
          image: base64Image,
          aspect_ratio: "16:9",
          format: format || "mp4" // Paramètre de format ajouté
      })
    });

    if (!videoApiResponse.ok) {
        let errorMsg = `Erreur HTTP ${videoApiResponse.status}`;
        try {
            const errorBody = await videoApiResponse.text();
            try {
                const jsonErr = JSON.parse(errorBody);
                if (jsonErr.detail) errorMsg = jsonErr.detail;
                else if (jsonErr.message) errorMsg = jsonErr.message;
                else if (jsonErr.error) errorMsg = jsonErr.error;
            } catch {
                if (errorBody.length < 100) errorMsg += `: ${errorBody}`;
            }
        } catch {}
        
        throw new Error(errorMsg);
    }

    const videoData = await videoApiResponse.json();
    // Adaptation aux réponses possibles de différentes API Sora/Pixazo
    const videoUrl = videoData.video_url || videoData.url || videoData.output?.url || videoData.video;

    if (!videoUrl) {
        console.warn("API Response structure unknown:", videoData);
        throw new Error("Le serveur vidéo a répondu sans URL valide.");
    }
    
    return videoUrl;
}

export const generateFullStory = async (request: StoryRequest): Promise<GeneratedStory> => {
  // Always create a new instance to pick up potentially updated API keys from the UI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    // === 1. TEXT GENERATION (Foundation) ===
    
    const culturePrompt = request.includeHaitianCulture
      ? "IMPORTANT: Pour les exemples et le contexte, utilisez des références à la culture haïtienne (lieux comme la Citadelle ou Jacmel, folklore, proverbes, vie quotidienne en Haïti) pour rendre l'apprentissage plus pertinent localement."
      : "";

    const isEducational = request.genre === StoryGenre.EDUCATIONAL;

    let systemInstruction = "";
    let taskDescription = "";

    if (isEducational) {
        systemInstruction = `Vous êtes un professeur expert, patient et pédagogue. Votre objectif est de vulgariser des concepts complexes pour les rendre accessibles selon le niveau de l'élève.`;
        taskDescription = `
            Créez une leçon structurée sur le sujet : "${request.topic}".
            
            Structure obligatoire de la réponse :
            1. **Introduction accrocheuse** : Une phrase pour capter l'attention.
            2. **Le Concept Clé** : L'explication principale.
            3. **L'Analogie** : Une comparaison simple pour comprendre (ex: "Imagine que l'électricité est comme de l'eau...").
            4. **Exemple Concret** : Une application dans la vie réelle (si possible en lien avec Haïti si demandé).
            5. **Résumé** : Ce qu'il faut retenir en 2 phrases.
        `;
    } else {
        systemInstruction = "Vous êtes un conteur créatif, captivant et culturellement riche.";
        taskDescription = `Créez une histoire immersive et divertissante sur le sujet : "${request.topic}".`;
    }

    const prompt = `
      ${systemInstruction}
      
      TÂCHE : ${taskDescription}
      
      PARAMÈTRES :
      - Genre/Format : ${request.genre}
      - Public Cible (Niveau) : ${request.ageGroup}
      - Langue de sortie : ${request.language}
      ${culturePrompt}

      ADAPTATION AU NIVEAU (${request.ageGroup}) :
      - Pour "Enfants (5-10 ans)" : Utilisez des mots très simples, des phrases courtes, un ton joyeux et tutoyez l'enfant. Utilisez beaucoup d'emojis.
      - Pour "Adolescents (11-17 ans)" : Utilisez un ton dynamique, engageant, tutoyez, mais gardez un vocabulaire précis. Reliez le sujet à leurs intérêts.
      - Pour "Adultes (18+ ans)" : Utilisez un ton professionnel, vouvoyez, allez en profondeur dans les détails techniques et historiques.

      FORMATTAGE :
      Utilisez le Markdown pour bien structurer (Titres #, Gras **, Listes -).
      
      IMAGE PROMPT (Important) :
      Générez également une description visuelle EN ANGLAIS pour le générateur d'images (champ 'imagePrompt'). Cette description doit représenter le concept clé ou une scène de l'histoire.
      Si le format est VIDEO, décrivez une scène dynamique avec du mouvement (cinematic, motion).

      Retournez la réponse au format JSON respectant ce schéma :
      {
        "title": "Titre de la leçon ou de l'histoire",
        "content": "Le contenu complet en markdown...",
        "imagePrompt": "A detailed artistic description in English for an image generation model..."
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
    const imagePromptText = textData.imagePrompt || `An educational illustration about ${request.topic}`;

    // === 2. IMAGE GENERATION (Requis pour Image ET Vidéo) ===
    
    let imageUrl: string | undefined;
    let base64Image: string | undefined; 
    
    if (request.mediaType !== MediaType.TEXT_ONLY) {
        try {
            const selectedStyle = request.imageStyle;
            const cultureStyle = request.includeHaitianCulture ? "Caribbean colors, vibrant Haitian art influence, tropical atmosphere." : "";
            const motionPrompt = request.mediaType === MediaType.VIDEO ? "Cinematic lighting, dynamic angle, ready for animation." : "";
            
            const finalImagePrompt = `${imagePromptText}. \n\nStyle: ${selectedStyle}. ${cultureStyle} ${motionPrompt} \nHigh resolution, detailed, masterpiece.`;

            const imageResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [{ text: finalImagePrompt }]
                },
                config: {
                imageConfig: {
                    aspectRatio: "16:9", 
                    imageSize: "1K"
                }
                }
            });

            const candidates = imageResponse.candidates;
            if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Image = part.inlineData.data;
                        imageUrl = `data:${part.inlineData.mimeType};base64,${base64Image}`;
                        break;
                    }
                }
            }
        } catch (imgError) {
            console.warn("Image generation failed:", imgError);
        }
    }

    // === 3. VIDEO GENERATION (External API - i2v from Generated Image) ===
    let videoUrl: string | undefined;
    let videoError: string | undefined;
    
    if (request.mediaType === MediaType.VIDEO) {
        if (base64Image) {
            try {
               // On utilise l'image générée juste avant comme base pour la vidéo
               videoUrl = await generateVideoFromImage(imagePromptText, base64Image, request.videoFormat);
            } catch (apiError: any) {
                console.error("Video API Call failed:", apiError);
                videoError = apiError.message || "Erreur inconnue lors de la génération vidéo.";
            }
        } else {
             videoError = "Impossible de générer l'image de base nécessaire à la vidéo.";
        }
    }

    // === 4. AUDIO GENERATION (Gemini TTS pour WAV/PCM) ===
    let audioUrl: string | undefined;
    try {
        const ttsPrompt = `
        Agissez comme un orateur humain naturel et bienveillant.
        Votre tâche est d'expliquer le contenu suivant à l'oral.
        
        RÈGLES DE NARRATION :
        1. Ne lisez PAS les titres de sections.
        2. Ne lisez PAS les caractères Markdown.
        3. Transformez le texte structuré en une conversation fluide.
        4. Parlez directement à l'apprenant.
        5. Commencez directement l'explication.
        
        Ton : ${isEducational ? "Pédagogue, chaleureux, clair et encourageant." : "Immersif, captivant et expressif."}
        
        Sujet : ${title}
        
        Contenu à oraliser :
        ${content}`;

        // Utilisation de Gemini TTS qui renvoie du PCM (facilement convertissable en WAV)
        const speechResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });

        const audioPart = speechResponse.candidates?.[0]?.content?.parts?.[0];
        if (audioPart && audioPart.inlineData && audioPart.inlineData.data) {
             audioUrl = audioPart.inlineData.data; 
        }

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
        videoError, // On retourne l'erreur pour l'afficher dans l'UI
        videoFormat: request.videoFormat
    };

  } catch (error: any) {
    console.error("Content generation failed:", error);
    throw new Error(error.message || "Échec de la génération.");
  }
};