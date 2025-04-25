// src/components/ChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { FileNode } from '../services/github';

interface ChatPanelProps {
  repoUrl: string;
  fileTree: FileNode[];       // ← new prop
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ repoUrl, fileTree }) => {
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

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response using fileTree if you like:
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input, repoUrl, fileTree),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // You can now use `fileTree` to give richer answers:
  const generateBotResponse = (userInput: string, repo: string, tree: FileNode[]): string => {
    const repoName = repo.split('/').pop() || 'repository';

    if (/file|structure/i.test(userInput)) {
      const files = tree.filter(n => n.type === 'blob').slice(0, 3).map(n => n.path);
      return `I see ${tree.length} items in ${repoName}. A few example files are:\n• ${files.join('\n• ')}`;
    }
    // ...other logic...

    return `I'm analyzing ${repoName}. Could you be more specific?`;
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        Repository Chat
      </h2>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                flex max-w-[80%] rounded-lg px-4 py-2 
                ${msg.sender === 'user'
                  ? 'bg-red-900 dark:bg-red-800 text-red-100'
                  : 'bg-gray-800 text-gray-200'}
              `}>
                <div className="mr-2 mt-1">
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the repository..."
              className="w-full p-3 pr-12 border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-gray-800 text-gray-200 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 p-1 rounded-full hover:bg-red-900 transition-colors"
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
