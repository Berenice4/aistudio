
import React, { useState, useCallback, useEffect } from 'react';
// FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
import { FunctionDeclaration, GenerateContentParameters, GenerateContentResponse, Part } from '@google/genai';
import { ChatMessage, UploadedFile } from './types';
import ContextPanel from './components/ContextPanel';
import ChatPanel from './components/ChatPanel';
import DebugPanel from './components/DebugPanel';
import { generateResponse } from './services/geminiService';
import TutorialOverlay from './components/TutorialOverlay';
import CoinIcon from './components/icons/CoinIcon';
import { TUTORIAL_STEPS } from './constants/tutorialSteps';
import SparklesIcon from './components/icons/SparklesIcon';
import ChatBubbleLeftRightIcon from './components/icons/ChatBubbleLeftRightIcon';
import BugAntIcon from './components/icons/BugAntIcon';

const CHAT_HISTORY_KEY = 'agent_context_chat_history';

const App: React.FC = () => {
  const [systemInstruction, setSystemInstruction] = useState<string>('Sei un agente AI utile e amichevole. La tua personalità è arguta e curiosa.');
  const [tools, setTools] = useState<FunctionDeclaration[]>([]);
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestResponse, setLatestResponse] = useState<GenerateContentResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showTokenCount, setShowTokenCount] = useState<boolean>(false);
  const [sessionTokenCount, setSessionTokenCount] = useState<number>(0);
  const [mobileView, setMobileView] = useState<'context' | 'chat' | 'debug'>('chat');

  useEffect(() => {
    loadChatHistory();
  }, []);

  const saveChatHistory = () => {
    if (chatHistory.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
      alert('Conversazione salvata!');
    }
  };
  
  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
      setLatestResponse(null);
      setAnalysis(null);
      setSessionTokenCount(0);
    }
  };
  
  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setLatestResponse(null);
    setAnalysis(null);
    setSessionTokenCount(0);
  };

  const analyzeResponse = useCallback(async (userPrompt: string, modelResponse: ChatMessage) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    const modelResponseText = modelResponse.parts.map(p => p.text || '').join('\n');

    const analysisPrompt = `
You are an expert AI agent analyst. Your task is to review a conversation and provide a critical analysis of the AI agent's last response.
Focus on how the agent's pre-configured context (system instruction, tools) may have influenced its behavior.

CONVERSATION:
User: "${userPrompt}"
Agent: "${modelResponseText}"

Please provide a concise analysis in markdown format, covering:
1.  **Clarity & Relevance:** Did the agent directly and clearly address the user's prompt?
2.  **Reasoning Quality:** Are there any logical leaps, factual inaccuracies, or unsupported assumptions?
3.  **Contextual Improvement:** Based on this single turn, suggest specific improvements to the agent's system instruction or tool definitions that could lead to a better response in the future.
    `.trim();

    try {
      const response = await generateResponse({ contents: [{ text: analysisPrompt }] });
      setAnalysis(response.text);
    } catch (error) {
      setAnalysis(`Failed to generate analysis: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);


  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setCurrentMessage('');
    setAnalysis(null);

    const userMessagePart: Part = { text: message };
    const fileParts: Part[] = uploadedFiles.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      }
    }));

    const userParts = [...fileParts, userMessagePart];

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { 
        role: 'user', 
        parts: userParts,
        files: uploadedFiles.map(f => ({ name: f.name }))
      },
    ];
    setChatHistory(newHistory);

    const contents = newHistory.map(({ role, parts }) => ({ role, parts }));

    // FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
    const request: GenerateContentParameters = { contents };

    if (systemInstruction) {
      request.config = { ...request.config, systemInstruction };
    }

    if (tools.length > 0) {
      request.config = { ...request.config, tools: [{ functionDeclarations: tools }] };
    } else if (useGoogleSearch) {
      request.config = { ...request.config, tools: [{ googleSearch: {} }] };
    }
    
    try {
      const response = await generateResponse(request);
      setLatestResponse(response);

      if (response.usageMetadata?.totalTokenCount) {
        setSessionTokenCount(prev => prev + response.usageMetadata.totalTokenCount);
      }
      setUploadedFiles([]);

      const modelResponse: ChatMessage = {
        role: 'model',
        parts: response.candidates?.[0].content.parts || [{ text: 'No content found.' }],
        functionCalls: response.functionCalls,
      };
      
      setChatHistory(prev => [...prev, modelResponse]);
      if (modelResponse.parts.some(p => p.text)) {
        analyzeResponse(message, modelResponse);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: `An error occurred: ${error instanceof Error ? error.message : String(error)}` }],
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [systemInstruction, tools, useGoogleSearch, chatHistory, uploadedFiles, analyzeResponse]);

  const handleTutorialStepChange = (stepIndex: number) => {
    if (window.innerWidth < 768) { // md breakpoint
      const step = TUTORIAL_STEPS[stepIndex];
      const selector = step.selector;

      if (['#context-panel', '#system-instruction', '#grounding-section', '#tools-section'].includes(selector)) {
        setMobileView('context');
      } else if (['#chat-panel-messages', '#chat-input-form'].includes(selector)) {
        setMobileView('chat');
      } else if (['#debug-panel'].includes(selector)) {
        setMobileView('debug');
      }
    }
  };

  const contextPanelProps = {
    systemInstruction, setSystemInstruction, tools, setTools, useGoogleSearch, setUseGoogleSearch, uploadedFiles, setUploadedFiles
  };
  const chatPanelProps = {
    messages: chatHistory, currentMessage, setCurrentMessage, sendMessage, isLoading, saveChat: saveChatHistory, loadChat: loadChatHistory, clearChat: clearChatHistory, onStartTutorial: () => setIsTutorialOpen(true)
  };
  const debugPanelProps = {
    latestResponse, analysis, isAnalyzing
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <main className="flex flex-1 overflow-hidden">
        {/* Desktop View */}
        <div className="w-full max-w-sm md:w-1/4 lg:w-1/5 xl:w-1/4 hidden md:block">
          <ContextPanel {...contextPanelProps} />
        </div>
        <div className="flex-1 hidden md:block">
          <ChatPanel {...chatPanelProps} />
        </div>
        <div className="w-full max-w-sm md:w-1/4 lg:w-1/5 xl:w-1/4 hidden lg:block">
          <DebugPanel {...debugPanelProps} />
        </div>

        {/* Mobile View */}
        <div className="w-full h-full md:hidden">
          {mobileView === 'context' && <ContextPanel {...contextPanelProps} />}
          {mobileView === 'chat' && <ChatPanel {...chatPanelProps} />}
          {mobileView === 'debug' && <DebugPanel {...debugPanelProps} />}
        </div>
      </main>

      {/* Mobile navigation footer */}
      <footer className="md:hidden flex items-center justify-around py-1 px-4 text-xs text-gray-400 border-t border-gray-800 bg-gray-950">
        <button onClick={() => setMobileView('context')} className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-20 ${mobileView === 'context' ? 'text-primary' : 'hover:text-white'}`}>
          <SparklesIcon className="w-6 h-6" />
          <span>Contesto</span>
        </button>
        <button onClick={() => setMobileView('chat')} className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-20 ${mobileView === 'chat' ? 'text-primary' : 'hover:text-white'}`}>
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <span>Chat</span>
        </button>
        <button onClick={() => setMobileView('debug')} className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-20 ${mobileView === 'debug' ? 'text-primary' : 'hover:text-white'}`}>
          <BugAntIcon className="w-6 h-6" />
          <span>Ispettore</span>
        </button>
      </footer>
      
      {/* Desktop footer */}
      <footer className="hidden md:flex items-center justify-between py-2 px-4 text-xs text-gray-500 border-t border-gray-800">
        <span>©2025 Mirko Compagno</span>
        <div className="flex items-center gap-4">
          {showTokenCount && latestResponse?.usageMetadata && (
            <div className="flex items-center gap-2 text-gray-400">
              <span>Ultimo Turno: {latestResponse.usageMetadata.totalTokenCount} tokens</span>
              <div className="h-3 w-px bg-gray-700"></div>
              <span>Sessione: {sessionTokenCount} tokens</span>
            </div>
          )}
          <button onClick={() => setShowTokenCount(!showTokenCount)} title="Mostra/Nascondi Conteggio Token" className="text-gray-400 hover:text-white transition-colors">
            <CoinIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
      {isTutorialOpen && <TutorialOverlay onClose={() => setIsTutorialOpen(false)} onStepChange={handleTutorialStepChange} />}
    </div>
  );
};

export default App;
