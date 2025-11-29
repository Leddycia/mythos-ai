import React, { useState, useEffect } from 'react';
import { STORY_GENRES, AGE_GROUPS, IMAGE_STYLES, LANGUAGES, MEDIA_TYPES, VIDEO_FORMATS, APP_NAME } from './constants';
import { StoryRequest, GeneratedStory, StoryGenre, AgeGroup, ImageStyle, MediaType, HistoryItem, VideoFormat } from './types';
import { generateFullStory } from './services/geminiService';
import Button from './components/Button';
import Input from './components/Input';
import Select from './components/Select';
import StoryDisplay from './components/StoryDisplay';
import HistoryList from './components/HistoryList';

// Extend window interface for Google AI Studio specific features
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('mythos_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Impossible de charger l'historique", e);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Form State
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<StoryGenre>(StoryGenre.EDUCATIONAL); // Default to Educational
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.CHILD);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.CARTOON); // Default style
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.TEXT_WITH_IMAGE);
  const [videoFormat, setVideoFormat] = useState<VideoFormat>(VideoFormat.MP4);
  const [language, setLanguage] = useState<string>('Français');
  const [haitianCulture, setHaitianCulture] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToHistory = (newStory: GeneratedStory, request: StoryRequest) => {
    const newItem: HistoryItem = {
      ...newStory,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      originalTopic: request.topic,
      mediaType: request.mediaType,
      genre: request.genre
    };

    // Keep only last 5
    const updatedHistory = [newItem, ...history].slice(0, 5);
    
    // Attempt to save to localStorage
    // Logic: If quota exceeded, try removing large media data from the item being saved
    try {
      localStorage.setItem('mythos_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn("LocalStorage full. Saving without heavy media.");
        // Create a lighter version without Base64 strings for audio/image if they are internal
        // External URLs (like Video API) are fine
        const lightItem = { ...newItem };
        
        // Remove heavy base64 audio/image if present (approximate check)
        if (lightItem.imageUrl && lightItem.imageUrl.startsWith('data:')) {
           lightItem.imageUrl = undefined; // User will have to regenerate
        }
        if (lightItem.audioUrl && lightItem.audioUrl.length > 1000) {
           lightItem.audioUrl = undefined; // User will have to regenerate
        }

        const lighterHistory = [lightItem, ...history].slice(0, 5);
        try {
            localStorage.setItem('mythos_history', JSON.stringify(lighterHistory));
            setHistory(lighterHistory);
        } catch (e2) {
            console.error("Impossible de sauvegarder même en version allégée", e2);
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic) {
        setError("Veuillez entrer un sujet ou un concept à apprendre.");
        return;
    }

    setError(null);
    setLoading(true);

    try {
      const request: StoryRequest = {
        topic,
        genre,
        ageGroup,
        imageStyle,
        includeHaitianCulture: haitianCulture,
        language,
        mediaType,
        videoFormat: mediaType === MediaType.VIDEO ? videoFormat : undefined
      };

      const result = await generateFullStory(request);
      setStory(result);
      saveToHistory(result, request);

    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if(window.confirm("Voulez-vous vraiment effacer l'historique ?")) {
        setHistory([]);
        localStorage.removeItem('mythos_history');
    }
  };

  const handleReset = () => {
    setStory(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStory(null)}>
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <span className="font-bold text-xl tracking-tight font-serif text-slate-900 dark:text-white">{APP_NAME}</span>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Theme Toggle Button */}
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Changer le thème"
              >
                {theme === 'dark' ? (
                  /* Sun Icon for Dark Mode */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  /* Moon Icon for Light Mode */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <div className="hidden md:block">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Gemini 2.5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {story ? (
          <StoryDisplay story={story} onBack={handleReset} />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Hero Section */}
              <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Ayiti AI Hackathon 2025
                </div>
                
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                  Apprenez et Créez avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">l'Intelligence Artificielle</span>
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Une plateforme éducative interactive qui explique des concepts complexes, raconte des histoires et génère des leçons adaptées à votre niveau.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex -space-x-2 overflow-hidden">
                      {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-500">
                              U{i}
                          </div>
                      ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm flex items-center">Rejoint par des apprenants de toute Haïti.</p>
                </div>
              </div>

              {/* Form Section */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-8 duration-700 transition-colors duration-300">
                  <div className="space-y-6">
                      <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Créer une Leçon ou une Histoire</h2>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">L'IA s'adaptera à votre âge et au sujet choisi.</p>
                      </div>

                      <div className="space-y-4">
                          <Input 
                              label="Sujet, Concept ou Titre" 
                              placeholder="ex: La Photosynthèse, La Révolution Haïtienne, Le Courage..."
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Select 
                                  label="Type de contenu" 
                                  options={STORY_GENRES}
                                  value={genre}
                                  onChange={(e) => setGenre(e.target.value as StoryGenre)}
                              />
                              <Select 
                                  label="Niveau (Public Cible)" 
                                  options={AGE_GROUPS}
                                  value={ageGroup}
                                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                              />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Select 
                                  label="Format du Support"
                                  options={MEDIA_TYPES}
                                  value={mediaType}
                                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                              />
                              {mediaType === MediaType.VIDEO ? (
                                <Select 
                                    label="Format Vidéo"
                                    options={VIDEO_FORMATS}
                                    value={videoFormat}
                                    onChange={(e) => setVideoFormat(e.target.value as VideoFormat)}
                                />
                              ) : (
                                <Select 
                                    label="Style Visuel" 
                                    options={IMAGE_STYLES}
                                    value={imageStyle}
                                    onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                                    disabled={mediaType === MediaType.TEXT_ONLY}
                                    className={mediaType === MediaType.TEXT_ONLY ? 'opacity-50' : ''}
                                />
                              )}
                          </div>
                          
                          <Select
                              label="Langue de sortie"
                              options={LANGUAGES}
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                          />

                          {/* Cultural Toggle */}
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                              onClick={() => setHaitianCulture(!haitianCulture)}
                          >
                              <div className={`w-12 h-6 rounded-full relative transition-colors ${haitianCulture ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${haitianCulture ? 'left-7' : 'left-1'}`} />
                              </div>
                              <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-white">Mode Culturel Haïtien</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Intégrer des références locales (géographie, contes, culture) dans la leçon.</p>
                              </div>
                          </div>

                          {error && (
                              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                  {error}
                              </div>
                          )}
                          
                          <Button 
                              className="w-full !py-4 text-lg" 
                              onClick={handleGenerate}
                              isLoading={loading}
                          >
                              {mediaType === MediaType.VIDEO ? 'Générer la Vidéo 🎥' : 'Générer le contenu ✨'}
                          </Button>
                      </div>
                  </div>
              </div>
            </div>

            {/* History Section */}
            <HistoryList 
              history={history} 
              onSelect={(item) => setStory(item)} 
              onClear={handleClearHistory} 
            />
          </>
        )}
      </main>

      {/* Credits Footer */}
      <footer className="fixed bottom-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Développé par <span className="text-slate-700 dark:text-slate-300 font-semibold">B.A BA-Tech</span> pour Ayiti AI Hackathon 2025.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;