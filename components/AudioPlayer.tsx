
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createWavBlob } from '../utils/audioUtils';

interface AudioPlayerProps {
  pcmBase64: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ pcmBase64 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Initialisation de l'audio avec la source base64 convertie en Blob WAV
  useEffect(() => {
    // Nettoyage précédent
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
    
    setIsPlaying(false);
    setHasError(false);

    try {
        // Conversion explicite PCM -> WAV Blob pour compatibilité navigateur
        const blob = createWavBlob(pcmBase64);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = (e) => {
            console.error("Erreur lecture audio", e);
            setHasError(true);
            setIsPlaying(false);
        };
        audioRef.current = audio;
    } catch (e) {
        console.error("Erreur création audio", e);
        setHasError(true);
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrl) { // Cleanup URL object to avoid memory leaks
            URL.revokeObjectURL(audioUrl);
        }
    };
  }, [pcmBase64]);


  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
    } else {
        // Re-check readyState just in case
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => {
                console.error("Erreur play", e);
                setHasError(true);
            });
    }
  }, [isPlaying]);

  if (hasError) return <div className="text-red-500 dark:text-red-400 text-sm px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">Audio indisponible (Erreur format)</div>;

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
      <button
        onClick={togglePlay}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all transform active:scale-95 ${
          isPlaying 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-indigo-500/30'
        } shadow-lg`}
        aria-label={isPlaying ? "Pause" : "Lire l'explication audio"}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 text-left">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Explication Audio</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{isPlaying ? 'Lecture en cours...' : 'Écouter la leçon'}</p>
      </div>
      <div className="flex space-x-1 items-end h-6 min-w-[24px]">
          {isPlaying && (
              <>
                <div className="w-1 bg-indigo-500 dark:bg-indigo-400 animate-[bounce_1s_infinite] h-3 rounded-full"></div>
                <div className="w-1 bg-indigo-500 dark:bg-indigo-400 animate-[bounce_1.2s_infinite] h-5 rounded-full"></div>
                <div className="w-1 bg-indigo-500 dark:bg-indigo-400 animate-[bounce_0.8s_infinite] h-4 rounded-full"></div>
                <div className="w-1 bg-indigo-500 dark:bg-indigo-400 animate-[bounce_1.1s_infinite] h-6 rounded-full"></div>
              </>
          )}
      </div>
    </div>
  );
};

export default AudioPlayer;
