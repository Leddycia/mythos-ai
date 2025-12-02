
import React, { useState, useEffect } from 'react';
import { STORY_GENRES, AGE_GROUPS, IMAGE_STYLES, LANGUAGES, MEDIA_TYPES, VIDEO_FORMATS, APP_NAME } from './constants';
import { StoryRequest, GeneratedStory, StoryGenre, AgeGroup, ImageStyle, MediaType, HistoryItem, VideoFormat, ChatMessage } from './types';
import { generateFullStory } from './services/geminiService';
import Button from './components/Button';
import Input from './components/Input';
import Select from './components/Select';
import StoryDisplay from './components/StoryDisplay';
import HistoryList from './components/HistoryList';
import LoginPage from './components/LoginPage';
import WelcomePage from './components/WelcomePage';
import Sidebar from './components/Sidebar';
import ImageGallery from './components/ImageGallery';
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';
import LoadingBot from './components/LoadingBot';

// Extend window interface for Google AI Studio specific features
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

interface UserSession {
  email: string;
  name: string;
}

type ViewType = 'welcome' | 'create' | 'history' | 'images' | 'settings' | 'about';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<UserSession | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [loading, setLoading] = useState(false);
  
  // Story & Chat State
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [lastRequest, setLastRequest] = useState<StoryRequest | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  // Load user session & history from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mythos_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedHistory = localStorage.getItem('mythos_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Impossible de charger les données locales", e);
      localStorage.removeItem('mythos_history');
    }
  }, []);

  const handleLogin = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('mythos_user', JSON.stringify(newUser));
    setCurrentView('welcome');
  };

  const handleLogout = () => {
    setUser(null);
    setStory(null);
    setChatHistory([]);
    setTopic('');
    setLastRequest(null);
    localStorage.removeItem('mythos_user');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Form State
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<StoryGenre>(StoryGenre.EDUCATIONAL);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.CHILD);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.CARTOON);
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.TEXT_WITH_IMAGE);
  const [videoFormat, setVideoFormat] = useState<VideoFormat>(VideoFormat.MP4);
  const [language, setLanguage] = useState<string>('Français');
  const [haitianCulture, setHaitianCulture] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
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

    const updatedHistory = [newItem, ...history].slice(0, 5);
    try {
      localStorage.setItem('mythos_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (e: any) {
      // Gestion erreur quota...
    }
  };

  const handleGenerate = async () => {
    const request: StoryRequest = {
        topic,
        genre,
        ageGroup,
        imageStyle,
        includeHaitianCulture: haitianCulture,
        language,
        mediaType,
        videoFormat: mediaType === MediaType.VIDEO ? videoFormat : undefined,
        isFastMode
    };

    if (!request.topic) {
        setError("Veuillez entrer un sujet ou un concept à apprendre.");
        return;
    }

    setError(null);
    setLoading(true);
    setLastRequest(request);
    setChatHistory([]); // Reset chat for new story

    try {
      const result = await generateFullStory(request);
      setStory(result);
      saveToHistory(result, request);
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  // Handle "User sends message in chat"
  const handleChatInteraction = async (userMessage: string) => {
    if (!lastRequest || !story) return;

    // 1. Add User Message to History UI
    const newUserMsg: ChatMessage = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newUserMsg]);
    
    setLoading(true);

    try {
        // 2. Prepare context for AI
        // Initial context + current chat history + new message
        const conversationContext = [
            { role: 'ai', text: story.content }, // Initial lesson content
            ...chatHistory.map(m => ({ role: m.role, text: m.role === 'user' ? m.content : m.aiResponse?.content || '' })),
            { role: 'user', text: userMessage }
        ];

        const followUpRequest: StoryRequest = {
            ...lastRequest,
            topic: userMessage, // The prompt is the user's question
            isFollowUp: true,
            // Force text only for chat interactions to be faster
            mediaType: MediaType.TEXT_ONLY,
            conversationHistory: conversationContext,
            // Use fast mode for chat if enabled originally
            isFastMode: lastRequest.isFastMode
        };

        const result = await generateFullStory(followUpRequest);

        // 3. Add AI Response to History UI
        const newAiMsg: ChatMessage = { role: 'ai', content: result.content, aiResponse: result };
        setChatHistory(prev => [...prev, newAiMsg]);

    } catch (e) {
        console.error("Chat error", e);
        // Add error message to chat?
    } finally {
        setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mythos_history');
  };

  const handleResetStory = () => {
    setStory(null);
    setChatHistory([]);
  };

  const selectHistoryItem = (item: HistoryItem) => {
      setStory(item);
      setChatHistory([]); // Reset chat when loading history item
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-[100dvh] text-slate-900 dark:text-white transition-colors duration-300 flex flex-col relative overflow-x-hidden">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-[blob_7s_infinite]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] animate-[blob_7s_infinite] animation-delay-2000"></div>
           <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px] animate-[blob_7s_infinite] animation-delay-4000"></div>
          {/* Mesh Gradient Overlay */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onChangeView={(view) => {
            setCurrentView(view);
            setStory(null);
            setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        userInitial={user.name.charAt(0)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''} lg:pl-0`}>
          {/* Header Mobile / Toggle */}
         {!isSidebarOpen && (
            <div className="fixed top-4 left-4 z-40">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all group"
                >
                    <svg className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
         )}
         
         <div className={`min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
            
            {loading && <LoadingBot />}

            <div className="p-4 md:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
                
                {story ? (
                    <StoryDisplay 
                        initialStory={story} 
                        onBack={() => setStory(null)}
                        onSendMessage={handleChatInteraction}
                        onEndSession={() => {
                            setStory(null);
                            setChatHistory([]);
                        }}
                        chatHistory={chatHistory}
                        isThinking={loading}
                    />
                ) : (
                    <>
                        {currentView === 'welcome' && (
                            <WelcomePage 
                                userName={user.name} 
                                onStartCreate={() => setCurrentView('create')}
                                onViewHistory={() => setCurrentView('history')}
                            />
                        )}

                        {currentView === 'create' && (
                             <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <div className="flex items-center gap-3 mb-8">
                                     <button onClick={() => setCurrentView('welcome')} className="lg:hidden text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                                     <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Créer une nouvelle leçon</h2>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
                                    <Input 
                                        label="Sujet ou Concept à explorer" 
                                        placeholder="Ex: La Révolution Haïtienne, Le Théorème de Pythagore..." 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="!text-xl"
                                        autoFocus
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Genre / Type" options={STORY_GENRES} value={genre} onChange={(e) => setGenre(e.target.value as StoryGenre)} />
                                        <Select label="Public Cible" options={AGE_GROUPS} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Format du contenu" options={MEDIA_TYPES} value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)} />
                                        {mediaType === MediaType.VIDEO && (
                                            <Select label="Format Vidéo" options={VIDEO_FORMATS} value={videoFormat} onChange={(e) => setVideoFormat(e.target.value as VideoFormat)} />
                                        )}
                                        {mediaType !== MediaType.TEXT_ONLY && mediaType !== MediaType.VIDEO && (
                                            <Select label="Style Visuel" options={IMAGE_STYLES} value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <Select label="Langue" options={LANGUAGES} value={language} onChange={(e) => setLanguage(e.target.value)} />
                                         
                                         <div className="flex flex-col gap-2 justify-end pb-1">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input type="checkbox" className="sr-only peer" checked={haitianCulture} onChange={(e) => setHaitianCulture(e.target.checked)} />
                                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-fuchsia-500"></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    Mode Culture Haïtienne 🇭🇹
                                                </span>
                                            </label>
                                            
                                            <label className="flex items-center gap-3 cursor-pointer group mt-2">
                                                <div className="relative">
                                                    <input type="checkbox" className="sr-only peer" checked={isFastMode} onChange={(e) => setIsFastMode(e.target.checked)} />
                                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    Mode Réponse Rapide
                                                </span>
                                            </label>
                                         </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {error}
                                        </div>
                                    )}

                                    <Button onClick={handleGenerate} isLoading={loading} className="w-full !py-4 text-lg shadow-indigo-500/20" variant="primary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Générer la leçon
                                    </Button>
                                </div>
                             </div>
                        )}

                        {currentView === 'history' && (
                            <HistoryList 
                                history={history} 
                                onSelect={selectHistoryItem} 
                                onClear={handleClearHistory}
                                onBack={() => setCurrentView('welcome')}
                            />
                        )}

                        {currentView === 'images' && (
                            <ImageGallery 
                                history={history} 
                                onSelect={selectHistoryItem} 
                                onBack={() => setCurrentView('welcome')}
                            />
                        )}

                        {currentView === 'settings' && (
                            <SettingsPage 
                                onBack={() => setCurrentView('welcome')} 
                                onClearHistory={handleClearHistory}
                                theme={theme}
                                toggleTheme={toggleTheme}
                                user={user}
                            />
                        )}

                        {currentView === 'about' && (
                            <AboutPage onBack={() => setCurrentView('welcome')} />
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {!story && currentView !== 'welcome' && (
                <div className="w-full py-6 text-center text-slate-400 dark:text-slate-600 text-sm mt-auto">
                    Développé par <span className="font-semibold text-indigo-500">B.A BA-Tech</span> • Ayiti AI Hackathon 2025
                </div>
            )}
         </div>

      </main>
    </div>
  );
};

export default App;
