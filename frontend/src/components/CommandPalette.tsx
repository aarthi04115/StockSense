import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PackagePlus, PackageMinus, ArrowRightLeft, FileEdit, PackageSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

const commands = [
  { id: 'c1', name: "Create Receipt", icon: PackagePlus, type: "action", shortcut: "R" },
  { id: 'c2', name: "Draft Delivery Order", icon: PackageMinus, type: "action", shortcut: "D" },
  { id: 'c3', name: "Initiate Internal Transfer", icon: ArrowRightLeft, type: "action", shortcut: "T" },
  { id: 'c4', name: "Log Stock Adjustment", icon: FileEdit, type: "action", shortcut: "A" },
  { id: 'c5', name: "Search SKU-1002 (Ergonomic Chair)", icon: PackageSearch, type: "sku", label: "In Stock: 145" },
  { id: 'c6', name: "Search SKU-8821 (Industrial Sensors)", icon: PackageSearch, type: "sku", label: "In Stock: 82" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = query
    ? commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleSelect = (cmd: any) => {
    setIsOpen(false);
    setQuery("");
    if (cmd.name.includes("Receipt")) navigate("/receipts");
    else if (cmd.name.includes("Delivery")) navigate("/deliveries");
    else if (cmd.name.includes("Transfer")) navigate("/transfers");
    else if (cmd.name.includes("Adjustment")) navigate("/dashboard");
    else if (cmd.type === "sku") navigate("/products");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden bg-[#0B0D17]/90 border-white/10"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SKUs, or type a command..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-gray-500 text-lg"
              />
              <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                <span className="px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5">ESC</span>
                to close
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 ${
                          cmd.type === 'action' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          <cmd.icon className="w-4 h-4" />
                        </div>
                        <span className="text-gray-200 group-hover:text-white transition-colors">{cmd.name}</span>
                      </div>
                      
                      {cmd.shortcut && (
                        <div className="text-xs font-mono text-gray-500">
                          <kbd className="px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5">{cmd.shortcut}</kbd>
                        </div>
                      )}
                      {cmd.label && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          {cmd.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-400">
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
