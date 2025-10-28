import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import SaveIcon from './icons/SaveIcon';
import FolderOpenIcon from './icons/FolderOpenIcon';
import DocumentMinusIcon from './icons/DocumentMinusIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ClockIcon from './icons/ClockIcon';
import ConfirmModal from './ConfirmModal';
import PlayIcon from './icons/PlayIcon';
import PaperClipIcon from './icons/PaperClipIcon';

const SEARCH_HISTORY_KEY = 'agent_context_search_history';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: (message: string) => void;
  isLoading: boolean;
  saveChat: () => void;
  loadChat: () => void;
  clearChat: () => void;
  onStartTutorial: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, currentMessage, setCurrentMessage, sendMessage, isLoading, saveChat, loadChat, clearChat, onStartTutorial }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const allMatches = messages.flatMap((msg, msgIndex) => {
      const textPart = msg.parts.find(p => 'text' in p)?.text || '';
      const regex = new RegExp(searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      let match;
      const matchesInMessage = [];
      while ((match = regex.exec(textPart)) !== null) {
        matchesInMessage.push(`match-${msgIndex}-${match.index}`);
      }
      return matchesInMessage;
    });

    setSearchResults(allMatches);
    setCurrentResultIndex(allMatches.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (currentResultIndex === -1) return;

    document.querySelectorAll('.search-highlight-active').forEach(el => el.classList.remove('search-highlight-active'));
    
    const activeResultId = searchResults[currentResultIndex];
    const activeElement = document.getElementById(activeResultId);
    if (activeElement) {
      activeElement.classList.add('search-highlight-active');
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentResultIndex, searchResults]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !isLoading) {
      sendMessage(currentMessage);
    }
  };

  const highlightText = (text: string, query: string, messageIndex: number) => {
    if (!query.trim()) {
      return text;
    }
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    let matchIndex = 0;
    
    return (
      <>
        {parts.map((part, i) => {
          if (regex.test(part)) {
            const originalIndex = text.indexOf(part, matchIndex);
            matchIndex = originalIndex + 1;
            return (
              <span key={i} id={`match-${messageIndex}-${originalIndex}`} className="search-highlight">
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  const renderContent = (message: ChatMessage, messageIndex: number) => {
    const textPart = message.parts.find(p => 'text' in p)?.text || '';
    
    return (
      <div className="space-y-2">
        {message.files && message.files.length > 0 && (
          <div className="border-t border-white/20 pt-2 mt-2 first:mt-0 first:border-0 first:pt-0">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-gray-200">
                <PaperClipIcon className="w-4 h-4" />
                <span>File allegati:</span>
            </div>
            <ul className="text-xs space-y-1 text-gray-300">
              {message.files.map((file, i) => (
                <li key={i} className="truncate ml-2"> - {file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {textPart && <p className="whitespace-pre-wrap">{highlightText(textPart, searchQuery, messageIndex)}</p>}
        {message.functionCalls && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-yellow-400 mb-1">Chiamata di Funzione:</p>
            {message.functionCalls.map((fc, i) => (
              <div key={i} className="bg-gray-950 p-2 rounded-md text-xs font-mono">
                <p><span className="text-purple-400">{fc.name}</span>(</p>
                <pre className="pl-4 text-green-400">{JSON.stringify(fc.args, null, 2)}</pre>
                <p>)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  const handleSearchNavigation = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    let nextIndex = currentResultIndex;
    if (direction === 'next') {
        nextIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
        nextIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    }
    setCurrentResultIndex(nextIndex);
  };
  
  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
  };

  const handleClearChat = () => {
    clearChat();
    setShowConfirmClear(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
       <div className="p-4 border-b border-gray-800 flex items-center gap-4 relative">
          <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                  type="text"
                  placeholder="Cerca nella conversazione..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      addToSearchHistory(searchQuery.trim());
                    }
                  }}
                  className="w-full bg-gray-800 border-gray-700 rounded-md py-2 pl-10 pr-10 text-white focus:ring-primary focus:border-primary"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  title="Pulisci ricerca"
                >
                    <XIcon className="w-5 h-5" />
                </button>
              )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
              {searchResults.length > 0 ? (
                <span className="text-sm bg-gray-800 px-2 py-1 rounded-md w-24 text-center">{currentResultIndex + 1} di {searchResults.length}</span>
              ) : (
                <span className="text-sm w-24 text-center"></span>
              )}
              <button onClick={() => handleSearchNavigation('prev')} title="Risultato precedente" className="p-1.5 rounded-md hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={searchResults.length === 0}>
                  <ChevronUpIcon className="w-5 h-5" />
              </button>
              <button onClick={() => handleSearchNavigation('next')} title="Risultato successivo" className="p-1.5 rounded-md hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={searchResults.length === 0}>
                  <ChevronDownIcon className="w-5 h-5" />
              </button>
              <div className="h-5 w-px bg-gray-700 mx-1"></div>
              <button onClick={() => setShowSearchHistory(!showSearchHistory)} title="Cronologia ricerche" className="p-1.5 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
                <ClockIcon className="w-5 h-5" />
              </button>
          </div>
          {showSearchHistory && (
              <div className="absolute top-full right-4 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                  {searchHistory.length > 0 ? (
                      <ul>
                          {searchHistory.map((item, index) => (
                              <li key={index} onClick={() => handleHistorySelect(item)} className="px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer truncate">
                                  {item}
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">Nessuna ricerca recente.</p>
                  )}
              </div>
          )}

          <div className="flex items-center gap-1">
            <button onClick={onStartTutorial} title="Avvia Tutorial" className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
              <PlayIcon className="w-5 h-5" />
            </button>
            <button onClick={saveChat} title="Salva Conversazione" className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" disabled={messages.length === 0}>
              <SaveIcon className="w-5 h-5" />
            </button>
            <button onClick={loadChat} title="Carica Conversazione" className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
              <FolderOpenIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setShowConfirmClear(true)} title="Pulisci Conversazione" className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" disabled={messages.length === 0}>
              <DocumentMinusIcon className="w-5 h-5" />
            </button>
          </div>
      </div>
      <div id="chat-panel-messages" className="flex-1 overflow-y-auto p-6" ref={chatContainerRef}>
        <div className="space-y-10">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-3xl ${msg.role === 'user' ? 'bg-primary text-white shadow-lg' : 'bg-gray-800'}`}>
                {renderContent(msg, index)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-3xl bg-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
         {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-8">
                <p className="text-lg">Inizia una conversazione con l'agente.</p>
                <p>Configura il suo contesto a sinistra e vedi i suoi pensieri a destra.</p>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800">
        <form id="chat-input-form" onSubmit={handleSendMessage} className="relative">
          <input
            id="chat-input"
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Scrivi il tuo messaggio..."
            className="w-full bg-gray-800 border-gray-700 rounded-full py-3 pl-4 pr-12 text-white focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !currentMessage.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
      {showConfirmClear && (
        <ConfirmModal
          title="Conferma Cancellazione Chat"
          message="Sei sicuro di voler cancellare l'intera cronologia della conversazione? Questa azione non può essere annullata."
          onConfirm={handleClearChat}
          onClose={() => setShowConfirmClear(false)}
        />
      )}
    </div>
  );
};

export default ChatPanel;