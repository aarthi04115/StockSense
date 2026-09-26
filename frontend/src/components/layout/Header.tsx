import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 flex items-center justify-between px-6 border-b border-white/5 glass-panel rounded-none z-10 sticky top-0"
    >
      <div className="flex-1 max-w-xl relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search products, SKUs, or transactions (Cmd+K)..." 
          className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all shadow-inner"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-medium text-gray-400">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-medium text-gray-400">K</kbd>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors group">
          <Bell className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </button>
      </div>
    </motion.header>
  );
}
