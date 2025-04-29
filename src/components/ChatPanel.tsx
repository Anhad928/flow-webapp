// src/components/ChatPanel.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown         from 'react-markdown';
import remarkGfm             from 'remark-gfm';
import { Send, User, Bot }   from 'lucide-react';
import type { FileNode }     from '../services/github';

export interface ChatPanelProps {
  repoUrl : string;
  fileTree: FileNode[];
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
      id: 'init',
      text: "I've analyzed the repository. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  /* —— utility: collapse ** spaced ** ➜ **spaced** & _ spaced _ ➜ _spaced_ —— */
  const tidyMd = (s: string) =>
    s
      // ** bold **
      .replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**')
      // _ italic _
      .replace(/__\s+([^_]+?)\s+__/g, '**$1**')
      .replace(/_\s+([^_]+?)\s+_/g, '_$1_');

  /* fake-LLM fallback --------------------------------------------------- */
  const localAnswer = (q: string) => {
    const repo = repoUrl.split('/').pop() ?? 'repository';
    if (/structure|file/i.test(q)) {
      const sample = fileTree.slice(0, 3).map(n => `• ${n.path}`).join('\n');
      return `**Files in ${repo}**\n\n${sample}`;
    }
    return `I'm not sure – could you ask something more specific about **${repo}**?`;
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);

    /* try the streaming back-end first ---------------------------------- */
    try {
      const res = await fetch('https://server-frosty-river-911.fly.dev/api/analyze', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          repo    : repoUrl,
          tree    : fileTree,
          question: userMsg.text,
        }),
      });

      if (!res.ok || !res.body) throw new Error(String(res.status));

      const reader = res.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let answer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        value
          .split(/\r?\n/)
          .filter(l => l.startsWith('data:'))
          .forEach(l => {
            const chunk = l.replace(/^data:\s*/, '');
            if (chunk === '[DONE]') return;
            answer += chunk + ' ';

            setMessages(prev => [
              ...prev.filter(m => m.id !== 'typing'),
              {
                id       : 'typing',
                text     : tidyMd(answer.trim()),   // ▲ fix markdown
                sender   : 'bot',
                timestamp: new Date(),
              },
            ]);
          });
      }

      setMessages(prev =>
        prev
          .filter(m => m.id !== 'typing')
          .concat({
            id       : Date.now().toString() + '_bot',
            text     : tidyMd(answer.trim()),      // ▲ fix markdown
            sender   : 'bot',
            timestamp: new Date(),
          }),
      );
    } catch (err) {
      console.error('SSE failed – using stub:', err);
      setMessages(m => [
        ...m,
        {
          id       : Date.now().toString() + '_bot',
          text     : localAnswer(userMsg.text),    // already well-formatted
          sender   : 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  /* —— UI ——————————————————————————————————————————————————————— */
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Repository Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`flex max-w-[75%] rounded-lg px-4 py-2 shadow
                ${m.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-100'}`}
            >
              {m.sender === 'user'
                ? <User className="h-4 w-4 mr-2 mt-[2px] text-white" />
                : <Bot  className="h-6 w-6 mr-2 mt-[2px] text-indigo-300" />}

              <div className="space-y-1">
                {m.sender === 'bot'
                  ? (
                    <div className="prose prose-sm prose-invert break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                  )}

                <span className="text-[10px] text-gray-400">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 px-3 py-2 rounded-lg animate-pulse">…</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={send}>
        <div className="relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the repository…"
            className="w-full bg-gray-800 text-gray-100 placeholder-gray-500
                       border border-gray-700 rounded-md py-3 pr-12
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       text-indigo-400 hover:text-indigo-200 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
