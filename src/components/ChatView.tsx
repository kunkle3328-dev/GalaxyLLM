import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Cpu, Trash2, ChevronDown, Check, Loader2, Bot, WifiOff, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

import { db, type ChatMessage } from '../services/db';
import { cn } from '@/src/lib/utils';
import { useInference } from '../hooks/useInference';

const SYSTEM_PROMPT = `You are Nova, a highly advanced, knowledgeable, and professional AI assistant. Provide detailed, accurate, and well-structured responses. Use markdown formatting, headers, lists, and code blocks where appropriate.`;

const PreBlock = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  
  const codeElement = React.Children.toArray(children)[0] as React.ReactElement<any>;
  const className = codeElement?.props?.className || '';
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : 'text';
  
  const handleCopy = () => {
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node?.props?.children) return extractText(node.props.children);
      return '';
    };
    
    navigator.clipboard.writeText(extractText(codeElement?.props?.children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-2xl font-mono">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-white/60 uppercase tracking-wider">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? <span className="text-emerald-400">Copied!</span> : <span>Copy</span>}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <pre {...props} className="!bg-transparent !p-0 !m-0">
          {children}
        </pre>
      </div>
    </div>
  );
};

const CodeBlock = ({ className, children, ...props }: any) => {
  const isMatch = /language-(\w+)/.exec(className || '') || className?.includes('hljs');
  if (isMatch) {
    return <code className={className} {...props}>{children}</code>;
  }
  return (
    <code className="bg-white/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono text-[13px]" {...props}>
      {children}
    </code>
  );
};

const markdownComponents = {
  pre: PreBlock,
  code: CodeBlock
};

export default function ChatView() {
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { init, generate, isInitializing, isGenerating, progress, error } = useInference();

  const messages = useLiveQuery(() => 
    db.messages.orderBy('timestamp').toArray()
  ) || [];

  const readyModels = useLiveQuery(() => 
    db.models.where('status').equals('ready').toArray()
  ) || [];

  const activeSession = useLiveQuery(() => 
    db.sessions.orderBy('lastMessageAt').reverse().first()
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (readyModels.length > 0 && !selectedModelId) {
      setSelectedModelId(readyModels[0].id);
    }
  }, [readyModels]);

  useEffect(() => {
    if (selectedModelId) {
      const modelRecord = readyModels.find(m => m.id === selectedModelId);
      init(selectedModelId, modelRecord?.modelUrl).catch(console.error);
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isGenerating]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || !selectedModelId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: activeSession?.id || 'default',
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    await db.messages.add(userMessage);
    const prompt = input;
    setInput('');
    setStreamingContent('');

    try {
      const modelRecord = readyModels.find(m => m.id === selectedModelId);
      await init(selectedModelId, modelRecord?.modelUrl);
      
      // Build full chat history
      const history: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: prompt }
      ];

      let fullResponse = '';
      await generate(history, (token) => {
        setStreamingContent(prev => prev + token);
        fullResponse += token;
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chatId: activeSession?.id || 'default',
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        modelId: selectedModelId
      };
      
      await db.messages.add(assistantMessage);
      setStreamingContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = async () => {
    await db.messages.clear();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Model Selector Header */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between relative overflow-hidden glass-panel">
        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            {selectedModelId ? readyModels.find(m => m.id === selectedModelId)?.name : 'Select Model'}
            <ChevronDown className={cn("w-3 h-3 transition-transform", isModelMenuOpen && "rotate-180")} />
          </button>

          {selectedModelId && isInitializing && (
            <div className="flex items-center gap-2 ml-2">
              <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">Initializing...</span>
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden mt-0.5 shadow-inner">
                  <motion.div 
                    className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress?.progress || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedModelId && !isInitializing && readyModels.some(m => m.id === selectedModelId) && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Ready</span>
            </div>
          )}
          
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider">Offline</span>
            </div>
          )}
          
          <AnimatePresence>
            {isModelMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsModelMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden"
                >
                  {readyModels.length === 0 ? (
                    <div className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider">No models ready</div>
                  ) : (
                    readyModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModelId(model.id);
                          setIsModelMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="text-xs font-medium">{model.name}</span>
                        {selectedModelId === model.id && <Check className="w-3 h-3 text-emerald-500" />}
                      </button>
                    ))
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && !streamingContent && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Sparkles className="w-12 h-12" />
            <div>
              <p className="text-lg font-medium">Ready for Inference</p>
              <p className="text-sm">Select a model to start chatting offline</p>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Bot className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Nova</span>
              </div>
            )}
            <div className={cn(
              "px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg",
              msg.role === 'user' 
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm" 
                : "glass-panel text-white/90 rounded-tl-sm prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0 prose-headings:text-white prose-strong:text-white prose-code:before:content-none prose-code:after:content-none"
            )}>
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-tighter opacity-30 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}

        {isGenerating && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Nova</span>
            </div>
            <div className="px-5 py-4 rounded-3xl text-sm leading-relaxed glass-panel text-white/90 rounded-tl-sm prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0 prose-headings:text-white prose-strong:text-white prose-code:before:content-none prose-code:after:content-none shadow-lg">
              {streamingContent ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {streamingContent + ' ▋'}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center gap-1 h-5">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-wider text-center">
            Error: {error}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent pb-8">
        <div className="max-w-3xl mx-auto flex items-end gap-3 relative">
          <button 
            onClick={clearChat}
            className="p-4 rounded-3xl glass-panel text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all hover:scale-105 active:scale-95 shadow-lg mb-0.5"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="flex-1 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={readyModels.length === 0 ? "Download a model first..." : "Message Nova..."}
              disabled={readyModels.length === 0 || isInitializing || isGenerating}
              className="w-full glass-panel rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 resize-none min-h-[56px] max-h-32 shadow-xl relative z-10"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isGenerating || isInitializing || readyModels.length === 0}
              className="absolute right-2 bottom-2 p-2.5 rounded-2xl bg-emerald-500 text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
