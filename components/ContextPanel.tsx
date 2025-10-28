
import React, { useState, useRef } from 'react';
import { FunctionDeclaration } from '@google/genai';
import ToolEditor from './ToolEditor';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import { SYSTEM_INSTRUCTION_TEMPLATES } from '../constants/templates';
import { TOOL_TEMPLATES } from '../constants/toolTemplates';
import HelpIcon from './icons/HelpIcon';
import HelpModal from './HelpModal';
import CheckIcon from './icons/CheckIcon';
import { UploadedFile } from '../types';
import PaperClipIcon from './icons/PaperClipIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ContextPanelProps {
  systemInstruction: string;
  setSystemInstruction: (si: string) => void;
  tools: FunctionDeclaration[];
  setTools: (tools: FunctionDeclaration[]) => void;
  useGoogleSearch: boolean;
  setUseGoogleSearch: (use: boolean) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  systemInstruction,
  setSystemInstruction,
  tools,
  setTools,
  useGoogleSearch,
  setUseGoogleSearch,
  uploadedFiles,
  setUploadedFiles
}) => {
  const [isEditingTool, setIsEditingTool] = useState<FunctionDeclaration | null>(null);
  const [isCreatingTool, setIsCreatingTool] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackTimeoutRef = useRef<number | null>(null);
  
  const hasFunctionTools = tools.length > 0;
  const hasUploadedFiles = uploadedFiles.length > 0;

  const showFeedback = (message: string) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedbackMessage(message);
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };

  const handleSaveTool = (tool: FunctionDeclaration) => {
    if (isCreatingTool) {
      setTools([...tools, tool]);
      showFeedback('Strumento salvato con successo.');
    } else if (isEditingTool) {
      const index = tools.findIndex(t => t.name === isEditingTool.name);
      if (index > -1) {
        const newTools = [...tools];
        newTools[index] = tool;
        setTools(newTools);
        showFeedback('Strumento salvato con successo.');
      }
    }
  };

  const openToolCreator = () => {
    setIsEditingTool(null);
    setIsCreatingTool(true);
    setUseGoogleSearch(false);
  };
  
  const openToolEditor = (tool: FunctionDeclaration) => {
    setIsCreatingTool(false);
    setIsEditingTool(tool);
  };

  const deleteTool = (toolNameToDelete: string) => {
    setTools(tools.filter(t => t.name !== toolNameToDelete));
    showFeedback('Strumento eliminato con successo.');
  };
  
  const handleToggleSearch = (checked: boolean) => {
    setUseGoogleSearch(checked);
    if(checked) {
      setTools([]);
      setUploadedFiles([]);
    }
  };

  const handleSystemInstructionTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = SYSTEM_INSTRUCTION_TEMPLATES.find(t => t.name === e.target.value);
    if (selectedTemplate) {
      setSystemInstruction(selectedTemplate.prompt);
    }
  };

  const handleToolTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = TOOL_TEMPLATES.find(t => t.name === e.target.value);
    if (selectedTemplate) {
      if (tools.some(t => t.name === selectedTemplate.template.name)) {
        showFeedback(`Lo strumento '${selectedTemplate.template.name}' esiste già.`);
      } else {
        setTools([...tools, selectedTemplate.template]);
        showFeedback(`Strumento '${selectedTemplate.template.name}' aggiunto.`);
      }
    }
    // Reset dropdown to placeholder
    e.target.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUseGoogleSearch(false);

    // FIX: Use a for...of loop to correctly infer the type of `file` as File.
    for (const file of files) {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64String = (loadEvent.target?.result as string).split(',')[1];
          if (base64String) {
            const newFile: UploadedFile = {
              name: file.name,
              mimeType: file.type,
              data: base64String,
            };
            setUploadedFiles(prev => [...prev.filter(f => f.name !== newFile.name), newFile]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Si prega di caricare solo file PDF.');
      }
    }
    // Pulisce il valore dell'input per permettere di ricaricare lo stesso file
    event.target.value = '';
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <div id="context-panel" className="bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary"/>
            <h1 className="text-xl font-bold">AI Agent Context Engineer</h1>
        </div>
        <button onClick={() => setShowHelp(true)} className="text-gray-400 hover:text-primary transition-colors" title="Aiuto">
            <HelpIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${feedbackMessage ? 'max-h-20 mb-4' : 'max-h-0'}`}>
        {feedbackMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-md px-4 py-2 flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* System Instruction */}
        <div id="system-instruction">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-300">Istruzione di Sistema</label>
            <select onChange={handleSystemInstructionTemplateChange} defaultValue="" className="bg-gray-800 border-gray-700 rounded-md p-1 text-xs focus:ring-primary focus:border-primary">
              <option value="" disabled>- Seleziona un modello -</option>
              {SYSTEM_INSTRUCTION_TEMPLATES.map(template => (
                <option key={template.name} value={template.name}>{template.name}</option>
              ))}
            </select>
          </div>
          <textarea
            id="system-instruction-textarea"
            rows={5}
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            placeholder="es., Sei un assistente utile."
          />
        </div>

        {/* Grounding */}
        <div id="grounding-section">
            <h2 className="text-sm font-medium text-gray-300 mb-2">Ancoraggio (Grounding)</h2>
            <div className="bg-gray-800 rounded-md p-3">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-200">Ricerca Google</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={useGoogleSearch} onChange={e => handleToggleSearch(e.target.checked)} disabled={hasFunctionTools || hasUploadedFiles}/>
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </div>
                </label>
                {hasFunctionTools && <p className="text-xs text-yellow-500 mt-2">Disabilita gli strumenti di funzione per abilitare l'ancoraggio.</p>}
                {hasUploadedFiles && <p className="text-xs text-yellow-500 mt-2">Rimuovi i file PDF per abilitare la Ricerca Google.</p>}
            </div>
            <div className="bg-gray-800 rounded-md p-3 mt-2">
                <label htmlFor="pdf-upload" className={`flex items-center justify-between ${useGoogleSearch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span className="text-sm text-gray-200">File PDF di Contesto</span>
                    <PaperClipIcon className="w-5 h-5 text-gray-400" />
                </label>
                <input id="pdf-upload" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} disabled={useGoogleSearch} />
                <div className="mt-2 space-y-1">
                    {uploadedFiles.map(file => (
                        <div key={file.name} className="flex items-center justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                            <span className="text-gray-300 truncate pr-2">{file.name}</span>
                            <button onClick={() => removeFile(file.name)} className="text-gray-500 hover:text-red-400">
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>


        {/* Tools */}
        <div id="tools-section">
          <div className="flex justify-between items-center mb-2 gap-2">
            <h2 className="text-sm font-medium text-gray-300">Strumenti (Chiamata di Funzione)</h2>
            <div className="flex items-center gap-2">
                <select 
                  onChange={handleToolTemplateChange} 
                  defaultValue="" 
                  className="bg-gray-800 border-gray-700 rounded-md p-1 text-xs focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={useGoogleSearch}
                  title="Aggiungi uno strumento da un modello"
                >
                  <option value="" disabled>- Aggiungi da modello -</option>
                  {TOOL_TEMPLATES.map(template => (
                    <option key={template.name} value={template.name}>{template.name}</option>
                  ))}
                </select>
                <button
                  onClick={openToolCreator}
                  disabled={useGoogleSearch}
                  className="flex items-center gap-1 text-sm bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" /> Aggiungi
                </button>
            </div>
          </div>
           {useGoogleSearch && <p className="text-xs text-yellow-500 mb-2">Disabilita l'ancoraggio per abilitare gli strumenti di funzione.</p>}
          <div className="space-y-2">
            {tools.map((tool) => (
              <div key={tool.name} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{tool.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openToolEditor(tool)} className="text-xs text-primary-hover hover:text-primary">Modifica</button>
                    <button onClick={() => deleteTool(tool.name)} className="text-gray-400 hover:text-red-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tools.length === 0 && !useGoogleSearch && <p className="text-sm text-gray-500 text-center py-4">Nessun strumento definito.</p>}
          </div>
        </div>
      </div>
      {(isCreatingTool || isEditingTool) && (
        <ToolEditor
          tool={isEditingTool}
          onSave={handleSaveTool}
          onClose={() => { setIsCreatingTool(false); setIsEditingTool(null); }}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default ContextPanel;