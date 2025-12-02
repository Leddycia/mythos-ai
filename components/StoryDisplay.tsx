
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedStory, ImageStyle, MediaType, ChatMessage, VideoFormat, QuizQuestion } from '../types';
import Button from './Button';
import AudioPlayer from './AudioPlayer';
import Input from './Input';
import { regenerateStoryImage, generateQuizFromContent } from '../services/geminiService';
import { createWavBlob } from '../utils/audioUtils';
import QuizDisplay from './QuizDisplay';

interface MessageBlockProps {
    msg: ChatMessage;
    isInitial?: boolean;
    onSendMessage: (message: string) => void;
    onDownloadText: (story: GeneratedStory) => void;
    onDownloadImage: (story: GeneratedStory) => void;
    onDownloadAudio: (story: GeneratedStory) => void;
    onGenerateQuiz?: (content: string) => void;
    isGeneratingQuiz?: boolean;
}

const MessageBlock: React.FC<MessageBlockProps> = ({ 
    msg, 
    isInitial = false,
    onSendMessage,
    onDownloadText,
    onDownloadImage,
    onDownloadAudio,
    onGenerateQuiz,
    isGeneratingQuiz
}) => {
      if (msg.role === 'user') {
          return (
              <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-indigo-600 text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-md">
                      <p className="text-base md:text-lg">{msg.content}</p>
                  </div>
              </div>
          );
      }

      const story = msg.aiResponse!;
      
      return (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden relative transition-colors duration-300 animate-in fade-in slide-in-from-left-4 duration-500 ${isInitial ? 'mb-8 md:mb-12 border-indigo-200 dark:border-indigo-800' : ''}`}>
            {isInitial && <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500" />}
            
            <div className="p-6 md:p-10">
                {/* Header (Titre + Audio) */}
                <div className="flex flex-col gap-6 mb-8">
                    <h3 className={`font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-fuchsia-600 dark:from-indigo-200 dark:to-white leading-tight ${isInitial ? 'text-3xl md:text-5xl text-center' : 'text-xl md:text-2xl'}`}>
                        {story.title}
                    </h3>
                    {story.audioUrl && (
                        <div className="w-full max-w-md mx-auto md:mx-0">
                            <AudioPlayer pcmBase64={story.audioUrl} />
                        </div>
                    )}
                </div>

                {/* Content Layout */}
                <div className="flex flex-col gap-8">
                    {/* Visual Section */}
                    {(story.imageUrl || story.videoUrl) && (
                        <div className="w-full">
                            <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800 aspect-video max-h-[500px]">
                                {story.videoUrl && !story.isVideoSimulated ? (
                                    <video src={story.videoUrl} controls className="w-full h-full object-contain" autoPlay loop muted />
                                ) : (
                                    <img 
                                        src={story.imageUrl} 
                                        alt={story.title} 
                                        className={`w-full h-full object-cover ${story.isVideoSimulated ? 'animate-[kenburns_20s_infinite_alternate]' : ''}`}
                                    />
                                )}
                                {story.isVideoSimulated && (
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        <span className="text-white text-[10px] font-semibold tracking-wide">APERÇU VIDÉO</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Text Section */}
                    <div className="prose prose-slate dark:prose-invert prose-lg md:prose-xl max-w-none">
                        <div className="font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                            <ReactMarkdown>{story.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Toolbar (Download & Quiz) */}
                <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => onDownloadText(story)} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Texte</button>
                        {story.imageUrl && <button onClick={() => onDownloadImage(story)} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Image</button>}
                        {story.audioUrl && <button onClick={() => onDownloadAudio(story)} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Audio</button>}
                    </div>

                    {onGenerateQuiz && (
                         <Button 
                             onClick={() => onGenerateQuiz(story.content)}
                             disabled={isGeneratingQuiz}
                             variant="secondary"
                             className="!py-2.5 !px-5 !text-sm !rounded-xl"
                         >
                            {isGeneratingQuiz ? 'Génération...' : '🧠 Générer un Quiz'}
                         </Button>
                    )}
                </div>

                {/* Suggestion Chips */}
                {story.nextStepSuggestion && !isInitial && (
                   <div className="mt-6 flex flex-wrap gap-2">
                      <button 
                        onClick={() => onSendMessage(story.nextStepSuggestion!)}
                        className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-5 py-3 rounded-full text-base font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800 text-left w-full sm:w-auto"
                      >
                         ✨ {story.nextStepSuggestion}
                      </button>
                   </div>
                )}
            </div>
        </div>
      );
};

interface StoryDisplayProps {
  initialStory: GeneratedStory;
  onBack: () => void;
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  chatHistory: ChatMessage[];
  isThinking: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ initialStory, onBack, onSendMessage, onEndSession, chatHistory, isThinking }) => {
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  
  // State pour le loader spécifique du quiz de sortie
  const [isGeneratingExitQuiz, setIsGeneratingExitQuiz] = useState(false);

  // Scroll to bottom logic
  useEffect(() => {
    if (activeQuiz && quizRef.current) {
        quizRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isThinking, activeQuiz]);

  const handleGenerateQuiz = async (content: string) => {
      setIsGeneratingQuiz(true);
      setActiveQuiz(null); // Reset current quiz
      try {
          const quiz = await generateQuizFromContent(content, "Adolescents");
          if (quiz && quiz.length > 0) {
              setActiveQuiz(quiz);
          } else {
              alert("Impossible de générer un quiz sur ce contenu.");
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingQuiz(false);
      }
  };

  const handleCloseQuiz = () => {
      setActiveQuiz(null);
      // Si on était en train de quitter (quiz de fin), et qu'on ferme le quiz, on peut soit rester sur le chat soit quitter.
      // Ici, on reste sur le chat pour permettre de revoir le contenu.
  };

  // --- Helpers pour le téléchargement ---
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = (story: GeneratedStory) => {
    const blob = new Blob([`# ${story.title}\n\n${story.content}`], { type: 'text/markdown;charset=utf-8' });
    downloadFile(blob, `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
  };

  const handleDownloadImage = async (story: GeneratedStory) => {
    if (!story.imageUrl) return;
    try {
      const response = await fetch(story.imageUrl);
      const blob = await response.blob();
      downloadFile(blob, `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
    } catch (e) {
      console.error("Erreur téléchargement image", e);
    }
  };

  const handleDownloadAudio = (story: GeneratedStory) => {
    if (!story.audioUrl) return;

    try {
      if (story.audioUrl.startsWith('data:audio/mpeg') || story.audioUrl.startsWith('http')) {
         fetch(story.audioUrl)
            .then(res => res.blob())
            .then(blob => downloadFile(blob, `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`));
      } else {
          const wavBlob = createWavBlob(story.audioUrl);
          downloadFile(wavBlob, `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`);
      }
    } catch (e) {
      console.error("Erreur lors du téléchargement audio", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!userInput.trim()) return;
      onSendMessage(userInput);
      setUserInput("");
  };

  // Interception du clic "Terminer session"
  const handleEndClick = () => {
      setShowExitPrompt(true);
  };

  const handleConfirmExit = async (shouldTakeQuiz: boolean) => {
      setShowExitPrompt(false);
      
      if (shouldTakeQuiz) {
          setIsGeneratingExitQuiz(true); // Active le loader plein écran
          
          // Construction du contexte complet (Leçon initiale + Chat)
          const sessionContent = `
            LEÇON INITIALE:
            ${initialStory.content}

            HISTORIQUE DE LA CONVERSATION:
            ${chatHistory.map(m => `${m.role === 'user' ? 'Élève' : 'Professeur'}: ${m.content}`).join('\n')}
          `;
          
          try {
              // On appelle la fonction de génération mais on gère l'état 'activeQuiz' ici
              const quiz = await generateQuizFromContent(sessionContent, "Adolescents");
              if (quiz && quiz.length > 0) {
                  setActiveQuiz(quiz);
              } else {
                  // Fallback si échec
                  onEndSession(); 
              }
          } catch (e) {
              console.error("Erreur quiz exit", e);
              onEndSession();
          } finally {
              setIsGeneratingExitQuiz(false);
          }
      } else {
          onEndSession();
      }
  };

  const lastAiMessage = chatHistory.filter(m => m.role === 'ai').pop();
  const suggestion = lastAiMessage?.aiResponse?.nextStepSuggestion;

  return (
    <div className="max-w-6xl mx-auto pb-48 lg:pb-40 relative">
      {/* Header Navigation */}
      <div className="mb-6 sticky top-4 z-30 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Button variant="ghost" onClick={onBack} className="!py-2 !px-4 text-sm">
          ← Retour
        </Button>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:block">Session Interactive</span>
        <div className="w-8"></div>
      </div>

      <div className="space-y-8 md:space-y-12 px-2 md:px-4">
         {/* Initial Lesson */}
         <MessageBlock 
            msg={{ role: 'ai', content: '', aiResponse: initialStory }} 
            isInitial={true} 
            onSendMessage={onSendMessage}
            onDownloadText={handleDownloadText}
            onDownloadImage={handleDownloadImage}
            onDownloadAudio={handleDownloadAudio}
            onGenerateQuiz={handleGenerateQuiz}
            isGeneratingQuiz={isGeneratingQuiz}
         />

         {/* Chat History */}
         {chatHistory.map((msg, idx) => (
             <MessageBlock 
                key={idx} 
                msg={msg} 
                onSendMessage={onSendMessage}
                onDownloadText={handleDownloadText}
                onDownloadImage={handleDownloadImage}
                onDownloadAudio={handleDownloadAudio}
             />
         ))}

         {/* Quiz Overlay / Block */}
         {activeQuiz && (
             <div ref={quizRef} className="scroll-mt-24">
                 <QuizDisplay 
                    questions={activeQuiz} 
                    onClose={() => {
                        handleCloseQuiz();
                        // Si le quiz venait d'une demande de sortie, on propose un bouton pour vraiment sortir maintenant
                    }} 
                    onRetry={() => handleGenerateQuiz(initialStory.content)} 
                 />
                 
                 {/* Bouton spécial pour quitter après le quiz */}
                 <div className="mt-4 flex justify-center">
                     <Button variant="outline" onClick={onEndSession} className="border-red-200 hover:bg-red-50 text-red-600">
                         Quitter définitivement la session
                     </Button>
                 </div>
             </div>
         )}

         {/* Loading Indicator (Chat Thinking) */}
         {isThinking && (
             <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-md">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-base font-medium text-slate-500 dark:text-slate-400">Professeur Mythos réfléchit...</span>
                </div>
             </div>
         )}
         
         {/* Bouton Fin de Session (Caché si Quiz Actif) */}
         {!activeQuiz && !isThinking && (
            <div className="flex justify-center py-8">
                <button 
                    onClick={handleEndClick}
                    className="group flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:bg-red-500 transition-colors"></span>
                    Terminer la session interactive
                </button>
            </div>
         )}

         <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Sticky Bottom) - Caché si le Quiz est actif */}
      {!activeQuiz && !isGeneratingExitQuiz && (
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 pb-6 md:pb-8 bg-gradient-to-t from-white/90 dark:from-[#0B0F19]/90 via-white/80 dark:via-[#0B0F19]/80 to-transparent z-40 backdrop-blur-xl transition-all duration-300">
              <div className="max-w-6xl mx-auto">
                  {/* Suggestion Rapide */}
                  {!isThinking && suggestion && chatHistory.length === 0 && (
                      <div className="mb-4 flex justify-center animate-in slide-in-from-bottom-2 fade-in">
                            <button 
                                onClick={() => onSendMessage(suggestion)}
                                className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-3.5 rounded-full font-medium shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all flex items-center gap-2 text-base w-full sm:w-auto justify-center"
                            >
                                <span className="truncate max-w-[300px] sm:max-w-none">Continuer : {suggestion}</span>
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l7-7m7-7H3" /></svg>
                            </button>
                      </div>
                  )}

                  <form onSubmit={handleSubmit} className="relative flex gap-3 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Posez une question pour approfondir..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 text-base md:text-lg"
                        disabled={isThinking}
                      />
                      <button 
                        type="submit"
                        disabled={!userInput.trim() || isThinking}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 md:p-3.5 rounded-xl transition-colors shrink-0 shadow-md"
                      >
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* LOADER PLEIN ÉCRAN POUR LA GÉNÉRATION DU QUIZ DE SORTIE */}
      {isGeneratingExitQuiz && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
               <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Génération du Quiz Récapitulatif...</h3>
               <p className="text-slate-500 dark:text-slate-400 animate-pulse">Professeur Mythos analyse toute votre conversation.</p>
          </div>
      )}

      {/* MODAL DE CONFIRMATION DE SORTIE */}
      {showExitPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Déjà parti ?</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                          Avant de quitter, voulez-vous un petit quiz rapide pour vérifier que vous avez tout compris de cette session ?
                      </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => handleConfirmExit(true)} 
                        className="w-full justify-center !text-lg"
                        variant="primary"
                      >
                          Oui, tester mes connaissances !
                      </Button>
                      <Button 
                        onClick={() => handleConfirmExit(false)} 
                        className="w-full justify-center" 
                        variant="ghost"
                      >
                          Non, quitter simplement
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default StoryDisplay;
