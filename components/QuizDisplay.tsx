
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import Button from './Button';

interface QuizDisplayProps {
  questions: QuizQuestion[];
  onClose: () => void;
  onRetry?: () => void;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ questions, onClose, onRetry }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(true);
    
    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRetry = () => {
      if(onRetry) onRetry();
  }

  if (quizFinished) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300 shadow-2xl">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-2xl font-bold font-serif mb-2 text-slate-900 dark:text-white">Quiz Terminé !</h3>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
          Votre score : <span className="font-bold text-indigo-600 dark:text-indigo-400">{score} / {questions.length}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
                 <Button onClick={handleRetry} variant="secondary">Encore 5 questions</Button>
            )}
            <Button onClick={onClose} variant="outline">Terminer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-6 mt-2 flex justify-between items-center">
        <span className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Question {currentIndex + 1} / {questions.length}</span>
        <span className="text-xs font-mono text-slate-400">Score: {score}</span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">
        {currentQuestion.question}
      </h3>

      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
          let stateClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
          
          if (showFeedback) {
             if (option === currentQuestion.correctAnswer) {
                stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
             } else if (option === selectedOption) {
                stateClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
             } else {
                stateClass = "opacity-50 border-slate-200 dark:border-slate-800";
             }
          } else if (selectedOption === option) {
             stateClass = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ${stateClass}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showFeedback && option === currentQuestion.correctAnswer && (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                )}
                {showFeedback && option === selectedOption && option !== currentQuestion.correctAnswer && (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-4">
             <p className="text-sm text-slate-600 dark:text-slate-300">
               <span className="font-bold">Explication :</span> {currentQuestion.explanation}
             </p>
          </div>
          <Button onClick={handleNext} className="w-full">
            {currentIndex < questions.length - 1 ? "Question Suivante" : "Voir le Résultat"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizDisplay;
