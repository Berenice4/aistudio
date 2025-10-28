
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';
import XIcon from './icons/XIcon';

interface TutorialOverlayProps {
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});
  const currentStep = TUTORIAL_STEPS[stepIndex];

  useLayoutEffect(() => {
    const updatePosition = () => {
      try {
        const element = document.querySelector<HTMLElement>(currentStep.selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          const rect = element.getBoundingClientRect();
          
          setHighlightStyle({
            position: 'absolute',
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(12, 12, 15, 0.7)',
            border: '2px solid #4F46E5',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none',
          });

          const tooltipHeight = 150; // Approximate height
          const spaceBelow = window.innerHeight - rect.bottom;
          
          if (spaceBelow > tooltipHeight + 20) {
            setTooltipStyle({
              top: `${rect.bottom + 16}px`,
              left: `${rect.left}px`,
            });
          } else {
            setTooltipStyle({
              bottom: `${window.innerHeight - rect.top + 16}px`,
              left: `${rect.left}px`,
            });
          }
        }
      } catch (e) {
        console.error("Errore nel selettore del tutorial:", currentStep.selector, e);
        // Salta al prossimo step se l'elemento non viene trovato
        if (stepIndex < TUTORIAL_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onClose();
        }
      }
    };

    // Un piccolo ritardo per consentire il rendering/scroll prima di posizionare
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [stepIndex, currentStep.selector, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div style={highlightStyle}></div>
      <div style={tooltipStyle} className="fixed bg-gray-800 text-white p-4 rounded-lg shadow-2xl border border-gray-700 w-80 z-50 transition-all duration-300 ease-in-out">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <XIcon className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-2 text-primary">{currentStep.title}</h3>
        <p className="text-sm text-gray-300 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{stepIndex + 1} / {TUTORIAL_STEPS.length}</span>
          <div className="space-x-2">
            <button onClick={handlePrev} disabled={stepIndex === 0} className="py-1 px-3 bg-gray-700 rounded-md text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Precedente</button>
            <button onClick={handleNext} className="py-1 px-3 bg-primary rounded-md text-sm hover:bg-primary-hover">
              {stepIndex === TUTORIAL_STEPS.length - 1 ? 'Fine' : 'Successivo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;