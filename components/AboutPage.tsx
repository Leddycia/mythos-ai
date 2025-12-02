
import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const teamMembers = [
    {
      name: "Angie-Reyna Leddycia Saint-Vil",
      role: "Capitaine / Développeur / Project Manager",
      initials: "AS"
    },
    {
      name: "Bern Waddly Louis Jean",
      role: "Dév / Ingénieur IA",
      initials: "BL"
    },
    {
      name: "Keen Bialy Christ Sayther CELESTIN",
      role: "Dév / Data Analyst",
      initials: "KC"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
        <button 
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour à l'accueil
        </button>

        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white mb-4">À propos</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Ayiti AI Hackathon 2025
            </div>
        </div>

        <div className="grid gap-8 md:gap-12">
            
            {/* Section Projet */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">La Vision MythosAI</h3>
                <blockquote className="text-xl italic text-slate-600 dark:text-slate-300 border-l-4 border-fuchsia-500 pl-4 my-6">
                    "Faire de MythosAI un environnement d’apprentissage créatif et intelligent qui grandit avec chaque utilisateur, tout au long de sa vie."
                </blockquote>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ce projet a été conçu pour répondre au manque d’outils accessibles et motivants pour développer la créativité et l'apprentissage en Haïti. En combinant l'intelligence artificielle générative et la richesse culturelle locale, nous offrons une plateforme unique pour apprendre en créant.
                </p>
            </div>

            {/* Section Équipe */}
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </span>
                    L'Équipe B.A BA-Tech
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {teamMembers.map((member, idx) => (
                        <div key={idx} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:-translate-y-1 shadow-md">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                {member.initials}
                            </div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{member.name}</h4>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">{member.role.split(' / ')[0]}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.role.split(' / ').slice(1).join(' • ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Carte */}
            <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-3xl p-8 text-white text-center shadow-lg">
                <p className="font-medium opacity-90 mb-2">Développé avec passion pour l'avenir de l'éducation en Haïti.</p>
                <p className="text-sm opacity-75">© 2025 B.A BA-Tech</p>
            </div>

        </div>
    </div>
  );
};

export default AboutPage;
