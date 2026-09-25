import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  ChevronDown,
  Briefcase,
  MapPin,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import { ChatRecommendedJob } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedPrompts?: string[];
  recommendedJobs?: ChatRecommendedJob[];
}

const STARTER_PROMPTS = [
  '🔍 Find .NET jobs in Bangalore',
  '⚡ Top React interview questions',
  '📝 How to optimize my resume for ATS?',
  '💼 Help me write a job description for Senior Backend Dev'
];

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "Hello! 👋 I'm your **JobPortal AI Career Assistant**, powered by our job matching engine.\n\nI can help you search current openings, prepare for interviews, optimize your resume for ATS, or draft job postings. How can I help you today?",
      timestamp: new Date(),
      suggestedPrompts: STARTER_PROMPTS
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context (last 6 messages)
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await aiApi.sendChatMessage({
        message: query,
        conversationHistory: history
      });

      if (response && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date(),
          suggestedPrompts: response.data.suggestedPrompts,
          recommendedJobs: response.data.recommendedJobs
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm having a little trouble connecting right now. Please try again in a moment, or feel free to browse jobs directly through the [Jobs page](/jobs).",
        timestamp: new Date(),
        suggestedPrompts: ['🔍 Search all open jobs', '💡 Tips for interview preparation']
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (!isOpen) {
        setHasUnread(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          "Conversation cleared! 🧹 What would you like to explore next? Feel free to ask about open jobs, resume tips, or career guidance.",
        timestamp: new Date(),
        suggestedPrompts: STARTER_PROMPTS
      }
    ]);
  };

  // Helper to format basic markdown-like text (bold, links, bullet points)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Check if bullet point
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
          const cleanLine = isBullet ? line.trim().substring(2) : line;

          // Parse markdown bold and internal links
          const parts: (string | React.ReactNode)[] = [];
          let lastIndex = 0;

          // Replace [text](url) markdown links
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let match;

          while ((match = linkRegex.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
              parts.push(cleanLine.substring(lastIndex, match.index));
            }
            const linkText = match[1];
            const linkHref = match[2];

            if (linkHref.startsWith('/')) {
              parts.push(
                <Link
                  key={`${idx}-${match.index}`}
                  to={linkHref}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-indigo-600 underline hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5"
                >
                  {linkText}
                  <ExternalLink className="w-3 h-3 inline ml-0.5" />
                </Link>
              );
            } else {
              parts.push(
                <a
                  key={`${idx}-${match.index}`}
                  href={linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 underline hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5"
                >
                  {linkText}
                  <ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>
              );
            }
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < cleanLine.length) {
            parts.push(cleanLine.substring(lastIndex));
          }

          // Format bold **text** in remaining text segments
          const formattedParts = parts.map((part, pIdx) => {
            if (typeof part !== 'string') return part;

            const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
            return (
              <React.Fragment key={pIdx}>
                {boldParts.map((sub, sIdx) => {
                  if (sub.startsWith('**') && sub.endsWith('**')) {
                    return (
                      <strong key={sIdx} className="font-semibold text-slate-900">
                        {sub.slice(2, -2)}
                      </strong>
                    );
                  }
                  return sub;
                })}
              </React.Fragment>
            );
          });

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-2 ml-1' : ''}>
              {isBullet && <span className="text-indigo-500 font-bold leading-5">•</span>}
              <div>{formattedParts}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
          {showTooltip && (
            <div className="mr-3 hidden md:flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Need career advice? Chat with AI</span>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-white ml-1 text-xs"
              >
                ×
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Career Chatbot"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25" />
            <Bot className="w-7 h-7 transition-transform group-hover:rotate-6" />

            {hasUnread && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-base tracking-tight leading-snug">
                  Career AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="text-xs text-indigo-100/90 font-medium">
                  Powered by Gemini &amp; Job Engine
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[88%] ${isAssistant ? '' : 'flex-row-reverse'}`}>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-sm mt-0.5 ${
                        isAssistant
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-sm ${
                        isAssistant
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow'
                      }`}
                    >
                      {isAssistant ? (
                        renderFormattedContent(message.content)
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Recommended Job Mini-Cards (if attached) */}
                  {message.recommendedJobs && message.recommendedJobs.length > 0 && (
                    <div className="w-full pl-9 pr-2 mt-2 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Matching Job Openings
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {message.recommendedJobs.map((job) => (
                          <div
                            key={job.id}
                            className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1">
                                  {job.title}
                                </h4>
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                                  {job.workplaceType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium">{job.companyName}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.location}
                              </span>
                              <Link
                                to={`/jobs/${job.id}`}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                              >
                                View Job
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Prompts */}
                  {message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
                    <div className="w-full pl-9 pr-2 mt-2.5 flex flex-wrap gap-1.5">
                      {message.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={isLoading}
                          className="text-xs text-left bg-white hover:bg-indigo-50/70 hover:border-indigo-300 hover:text-indigo-700 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 pl-9 pr-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="text-xs text-slate-500 font-medium ml-1">AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 rounded-2xl px-3 py-1.5 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about jobs, resume advice, interviews..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2">
              JobPortal AI assistant can make mistakes. Verify important career info.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
