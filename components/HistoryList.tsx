import React from 'react';
import { HistoryItem, MediaType } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.VIDEO: return '🎥';
      case MediaType.TEXT_ONLY: return '📝';
      default: return '🖼️';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📚</span> Historique Récent
        </h3>
        <button 
          onClick={onClear}
          className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
        >
          Effacer tout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-lg">
                {getMediaIcon(item.mediaType)}
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                {formatDate(item.timestamp)}
              </span>
            </div>

            <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h4>

            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
               {item.content.substring(0, 100).replace(/[#*`]/g, '')}...
            </p>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {item.genre}
              </span>
              {item.videoError && (
                 <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    ⚠️ Vidéo
                 </span>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;