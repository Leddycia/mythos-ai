
import React from 'react';
import Button from './Button';

interface WelcomePageProps {
  userName: string;
  onStartCreate: () => void;
  onViewHistory: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ userName, onStartCreate, onViewHistory }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 md:space-y-24 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HERO SECTION --- */}
      <div className="relative text-center space-y-8 py-12 md:py-24">
        {/* Decorative Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-fuchsia-500/20 dark:bg-fuchsia-500/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center px-4">
          
          {/* BIG APP TITLE */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-indigo-600 dark:from-indigo-400 dark:via-fuchsia-400 dark:to-indigo-400 animate-in fade-in zoom-in-50 duration-1000 pb-4 drop-shadow-sm leading-tight">
            MythosAI
          </h1>

          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-slate-900 dark:text-white mt-6 md:mt-10 leading-tight">
            Apprendre n'a jamais été <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">aussi captivant.</span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mt-8">
            Bonjour <strong>{userName}</strong>. Transformez n'importe quel sujet en une expérience interactive : leçons, histoires, images et vidéos générées instantanément par l'IA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 w-full sm:w-auto px-4">
            <Button 
              onClick={onStartCreate} 
              variant="secondary"
              className="!py-5 !px-10 text-xl shadow-xl shadow-fuchsia-500/20 w-full sm:w-auto transform hover:scale-105 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Créer une leçon
            </Button>
            <Button 
              onClick={onViewHistory} 
              variant="outline" 
              className="!py-5 !px-10 text-xl w-full sm:w-auto hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Voir mes créations
            </Button>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative px-4 max-w-6xl mx-auto">
         {/* Connector Line (Desktop only) */}
         <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 dark:from-slate-800 dark:via-indigo-900 dark:to-slate-800 z-0"></div>

         {[
            { 
              icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              title: "1. Choisissez un sujet", 
              desc: "Maths, Histoire ou Conte Haïtien ? Tout est possible." 
            },
            { 
              icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
              title: "2. Personnalisez", 
              desc: "Niveau, Style Visuel, Format Audio/Vidéo." 
            },
            { 
              icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
              title: "3. Apprenez & Jouez", 
              desc: "L'IA génère le cours, illustre et pose des quiz." 
            }
         ].map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
               </div>
               <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
               <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">{step.desc}</p>
            </div>
         ))}
      </div>

      {/* --- BENTO GRID FEATURES --- */}
      <div className="px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-center mb-16 text-slate-900 dark:text-white">
          Une technologie <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600">révolutionnaire</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 grid-rows-[auto_auto_auto] md:grid-rows-[300px_300px]">
           
           {/* Card 1: Multimodal (Large) */}
           <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                 <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </div>
                 <h3 className="text-3xl font-bold mb-2">Multimodal Natif</h3>
                 <p className="text-indigo-100 text-lg">Texte, Voix Humaine (ElevenLabs), Image & Vidéo générés en un clic.</p>
              </div>
           </div>

           {/* Card 2: Adaptatif */}
           <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500 transition-colors shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/50 dark:to-indigo-900/10"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 w-fit p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Adaptatif</h3>
                    <p className="text-slate-500 dark:text-slate-400">Contenu ajusté pour Enfants, Ados ou Adultes.</p>
                 </div>
              </div>
           </div>

           {/* Card 3: Culture Haiti */}
           <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-red-500 transition-colors shadow-lg">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <svg className="w-32 h-32 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               </div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-fit p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mode Haïti</h3>
                    <p className="text-slate-500 dark:text-slate-400">Intégration unique de notre culture et proverbes.</p>
                  </div>
               </div>
           </div>

           {/* Card 4: Interactive Quiz (Medium) */}
           <div className="md:col-span-4 bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 md:p-12 relative overflow-hidden flex items-center shadow-lg">
               <div className="flex-1 relative z-10">
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Quiz Interactif</h3>
                   <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-lg">
                       Validez vos connaissances avec des quiz générés dynamiquement après chaque leçon.
                   </p>
                   <div className="flex gap-2">
                       <span className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-sm font-medium shadow-sm">Feedback Immédiat</span>
                       <span className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-sm font-medium shadow-sm">Score</span>
                   </div>
               </div>
               <div className="hidden md:block w-48 h-48 bg-gradient-to-tr from-fuchsia-500 to-indigo-500 rounded-2xl rotate-6 shadow-2xl absolute -right-6 top-1/2 -translate-y-1/2 border-4 border-white dark:border-slate-800"></div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default WelcomePage;
