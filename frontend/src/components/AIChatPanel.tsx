import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";

export function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "ai", content: "Hi! I'm your StockSense AI assistant. Ask me anything about your inventory, like \"what's pending in Warehouse 2?\"" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userQuery = input.trim();
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userQuery }]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/v1/ai/query?query=${encodeURIComponent(userQuery)}`, {
        method: "POST",
        headers: { "accept": "application/json" }
      });
      const data = await response.json();
      
      const reply = data.answer || data.message || "I couldn't process that query.";
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "ai",
        content: reply
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "ai",
        content: "Error contacting StockSense AI backend. Please ensure the server is running."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] glass-panel rounded-none border-l border-white/10 z-50 flex flex-col bg-[#0B0D17]/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30 text-violet-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] tracking-tight">StockSense AI</h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Online
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-slate-400 p-3 rounded-2xl rounded-tl-sm text-[13px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse delay-300"></span>
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about live inventory..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 p-2 text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
