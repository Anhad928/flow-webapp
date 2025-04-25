import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';

interface ChatPanelProps {
  repoUrl: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ repoUrl }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `I've analyzed the repository structure. What would you like to know about it?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input, repoUrl),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string, repo: string): string => {
    const repoName = repo.split('/').pop() || 'repository';
    
    if (userInput.toLowerCase().includes('file') || userInput.toLowerCase().includes('structure')) {
      return `The ${repoName} contains a typical React project structure with src/components, src/utils folders, and configuration files at the root level.`;
    } else if (userInput.toLowerCase().includes('component')) {
      return `I found several components in the repository, including App.tsx and Header.tsx. These components handle the UI rendering of the application.`;
    } else if (userInput.toLowerCase().includes('dependency') || userInput.toLowerCase().includes('package')) {
      return `The main dependencies in package.json include React and several development tools like TypeScript and a bundler.`;
    } else {
      return `I'm analyzing the repository structure. Could you be more specific about what you'd like to know about ${repoName}?`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Repository Chat
      </h2>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                flex max-w-[80%] rounded-lg px-4 py-2 
                ${message.sender === 'user' 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}
              `}>
                <div className="mr-2 mt-1">
                  {message.sender === 'user' 
                    ? <User className="h-4 w-4" /> 
                    : <Bot className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="mt-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the repository..."
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 dark:text-indigo-400 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200"
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;