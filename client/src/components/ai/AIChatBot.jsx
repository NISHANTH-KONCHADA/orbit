import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useProject } from '../../context/ProjectContext';
import { timeAgo } from '../../utils/helpers';
import ReactMarkdown from 'react-markdown';

const AIChatBot = () => {
  const { activeProject } = useProject();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `👋 Hi! I'm **Orbit AI**, your project management assistant.\n\nI know your current project context. Ask me anything — about tasks, blockers, sprint status, or let me help you write a task description!`,
      time: new Date(),
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Gemini requires history to start with a 'user' role — skip the initial model greeting
      const firstUserIdx = messages.findIndex((m) => m.role === 'user');
      const history = (firstUserIdx === -1 ? [] : messages.slice(firstUserIdx))
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await aiService.chat(text, activeProject?._id, history);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: res.reply, time: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `❌ ${err.message || 'Something went wrong'}`, time: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'What are the critical issues?',
    'Summarize this sprint',
    'What tasks are unassigned?',
    'What should I work on next?',
  ];

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
          bg-gradient-to-br from-orbit-500 to-orbit-600
          flex items-center justify-center text-white
          hover:scale-110 active:scale-95 transition-all duration-200
          ${open ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
        `}
        title="Open Orbit AI"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={22} />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat panel */}
      <div
        className={`
          fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-900
          rounded-2xl shadow-modal border border-gray-200 dark:border-gray-700
          flex flex-col transition-all duration-300 origin-bottom-right
          ${open ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}
          ${expanded ? 'w-[480px] h-[600px]' : 'w-80 h-[480px]'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orbit-500 to-purple-500 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Orbit AI</p>
              <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Gemini 1.5 Flash
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-7 h-7"
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-7 h-7"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orbit-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                  <Bot size={10} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-orbit-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orbit-500 to-purple-500 flex items-center justify-center">
                <Bot size={10} className="text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (shown when only 1 message = initial) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-orbit-50 dark:bg-orbit-900/30 text-orbit-700 dark:text-orbit-400 border border-orbit-200 dark:border-orbit-700 hover:bg-orbit-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Orbit AI anything…"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-orbit-500 hover:bg-orbit-600 disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              {loading ? <Loader2 size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatBot;
