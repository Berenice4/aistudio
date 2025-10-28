
import React from 'react';
import { GenerateContentResponse } from '@google/genai';
import SparklesIcon from './icons/SparklesIcon';

interface DebugPanelProps {
  latestResponse: GenerateContentResponse | null;
  analysis: string | null;
  isAnalyzing: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ latestResponse, analysis, isAnalyzing }) => {
  const groundingChunks = latestResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return (
    <div id="debug-panel" className="bg-gray-900 border-l border-gray-800 p-4 flex flex-col h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Ispettore Agente</h2>
      
      {groundingChunks.length > 0 && (
        <div className="mb-4">
            <h3 className="font-semibold text-gray-300 mb-2">Fonti di Ancoraggio</h3>
            <div className="space-y-2">
                {groundingChunks.map((chunk, index) => (
                    <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" key={index} className="block text-sm bg-gray-800 p-2 rounded-md hover:bg-gray-700 truncate">
                        <p className="font-medium text-blue-400 truncate">{chunk.web?.title || 'Fonte Sconosciuta'}</p>
                        <p className="text-xs text-gray-400 truncate">{chunk.web?.uri}</p>
                    </a>
                ))}
            </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            Analisi Potenziata dall'AI
        </h3>
        <div className="bg-gray-950 p-3 rounded-md text-gray-300 min-h-[120px]">
          {isAnalyzing && (
            <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <span>Analisi in corso...</span>
                </div>
            </div>
          )}
          {!isAnalyzing && analysis && (
             <pre className="whitespace-pre-wrap font-sans text-xs">
                {analysis}
            </pre>
          )}
           {!isAnalyzing && !analysis && latestResponse && (
            <p className="text-gray-500 text-center py-4 text-xs">L'analisi apparirà qui dopo la risposta dell'agente.</p>
          )}
          {!isAnalyzing && !analysis && !latestResponse && (
             <p className="text-gray-500 text-center py-4 text-xs">Invia un messaggio per iniziare l'analisi.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-300 mb-2">Ultima Risposta Grezza</h3>
        <pre className="bg-gray-950 p-3 rounded-md text-xs text-gray-300 overflow-x-auto h-full">
          {latestResponse ? JSON.stringify(latestResponse, null, 2) : 'Ancora nessuna risposta.'}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;
