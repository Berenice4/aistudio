
import React, { useState, useCallback, useEffect } from 'react';
import { FunctionDeclaration, GenerateContentRequest, GenerateContentResponse, Part } from '@google/genai';
import { ChatMessage, UploadedFile } from './types';
import ContextPanel from './components/ContextPanel';
import ChatPanel from './components/ChatPanel';
import DebugPanel from './components/DebugPanel';
import { generateResponse } from './services/geminiService';
import TutorialOverlay from './components/TutorialOverlay';
import CoinIcon from './components/icons/CoinIcon';

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

    const request: GenerateContentRequest = { contents };

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

  return (
    <div className="flex flex-col h-screen font-sans">
      <main className="flex flex-1 overflow-hidden">
        <div className="w-full max-w-sm md:w-1/4 lg:w-1/5 xl:w-1/4 hidden md:block">
          <ContextPanel
            systemInstruction={systemInstruction}
            setSystemInstruction={setSystemInstruction}
            tools={tools}
            setTools={setTools}
            useGoogleSearch={useGoogleSearch}
            setUseGoogleSearch={setUseGoogleSearch}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        </div>
        <div className="flex-1">
          <ChatPanel
            messages={chatHistory}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
            saveChat={saveChatHistory}
            loadChat={loadChatHistory}
            clearChat={clearChatHistory}
            onStartTutorial={() => setIsTutorialOpen(true)}
          />
        </div>
        <div className="w-full max-w-sm md:w-1/4 lg:w-1/5 xl:w-1/4 hidden lg:block">
          <DebugPanel 
            latestResponse={latestResponse} 
            analysis={analysis}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </main>
      <footer className="flex items-center justify-between py-2 px-4 text-xs text-gray-500 border-t border-gray-800">
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
      {isTutorialOpen && <TutorialOverlay onClose={() => setIsTutorialOpen(false)} />}
    </div>
  );
};

export default App;