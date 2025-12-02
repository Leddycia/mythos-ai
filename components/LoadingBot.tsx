
import React, { useEffect, useState } from 'react';

const LoadingBot: React.FC = () => {
  const [message, setMessage] = useState("J'allume mes circuits...");

  // Messages ludiques pour les enfants
  useEffect(() => {
    const messages = [
      "Je réfléchis très fort... 🤔",
      "Je peins une jolie image... 🎨",
      "J'écris ton histoire... ✍️",
      "Je prépare ma plus belle voix... 🎤",
      "Encore un petit instant ! 🚀"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setMessage(messages[i]);
      i = (i + 1) % messages.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* Bot Container - Smaller & Bouncing */}
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        
        {/* --- EFFETS D'ARRIÈRE-PLAN --- */}
        
        {/* 1. Glow Central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[40px] animate-pulse-slow"></div>

        {/* 2. Anneaux Pulsants (Ripple) */}
        <div className="absolute inset-0 border border-indigo-200 dark:border-indigo-800 rounded-full animate-ping-slow opacity-30"></div>
        <div className="absolute inset-4 border border-fuchsia-200 dark:border-fuchsia-800 rounded-full animate-ping-slow animation-delay-2000 opacity-30"></div>

        {/* 3. Orbites Rotatives */}
        <div className="absolute inset-0 animate-spin-slow">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
        </div>
        <div className="absolute inset-8 animate-spin-reverse-slow">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_8px_#d946ef]"></div>
        </div>


        {/* --- LE ROBOT MIGNON (Au centre) --- */}
        <div className="relative animate-bounce-happy z-10 scale-90">
            <div className="relative w-32 h-full flex flex-col items-center justify-center">
                
                {/* Tête (Flottante) */}
                <div className="relative w-16 h-14 bg-white border-[3px] border-slate-900 dark:border-white rounded-[1.5rem] z-20 shadow-lg flex items-center justify-center mb-0.5 animate-wiggle-fast origin-bottom">
                    {/* Antenne */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                    </div>

                    {/* Visage Écran */}
                    <div className="w-10 h-7 bg-slate-900 rounded-lg flex items-center justify-center gap-1.5 overflow-hidden relative">
                        {/* Yeux */}
                        <div className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-blink-soft shadow-[0_0_6px_#22d3ee]"></div>
                        <div className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-blink-soft shadow-[0_0_6px_#22d3ee]"></div>
                    </div>
                </div>

                {/* Corps (Rond) */}
                <div className="w-20 h-16 bg-white border-[3px] border-slate-900 dark:border-white rounded-full z-10 shadow-xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-slate-100 to-slate-200">
                    {/* Détail ventre (Cœur lumineux sans texte) */}
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
                        <div className="w-5 h-5 bg-indigo-500 rounded-full opacity-40 animate-ping"></div>
                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                    </div>

                    {/* Bras (Petites ailes) */}
                    <div className="absolute -left-2 top-6 w-4 h-8 bg-white border-[3px] border-slate-900 dark:border-white rounded-full origin-right animate-wiggle"></div>
                    <div className="absolute -right-2 top-6 w-4 h-8 bg-white border-[3px] border-slate-900 dark:border-white rounded-full origin-left animate-wiggle" style={{ animationDelay: '0.5s' }}></div>
                </div>

            </div>
        </div>

        {/* Ombre */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/20 dark:bg-black/50 rounded-full blur-sm animate-[pulse_2s_infinite]"></div>

      </div>

      {/* Texte */}
      <div className="relative z-10 text-center space-y-3">
        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm font-sans">
          Mythos
        </h3>
        <div className="inline-block bg-white dark:bg-slate-800 px-6 py-2 rounded-xl shadow-lg border-b-4 border-indigo-200 dark:border-indigo-900">
            <p className="text-indigo-600 dark:text-indigo-300 font-bold text-base animate-pulse">
                {message}
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingBot;
