import { motion, AnimatePresence } from "framer-motion";

const attentionItems = [
  { id: 1, sku: "SKU-1001", name: "Premium Wireless Headphones", type: "stockout", days: 1, cur: 12, min: 20, priority: "high" },
  { id: 2, sku: "SKU-1002", name: "Ergonomic Office Chair", type: "stockout", days: 2, cur: 5, min: 10, priority: "high" },
  { id: 3, sku: "TRN-882", name: "Warehouse A to B", type: "stuck", days: 3, cur: "-", min: "-", priority: "medium" },
  { id: 4, sku: "SKU-1004", name: "Mechanical Keyboard", type: "stockout", days: 4, cur: 15, min: 25, priority: "low" },
];

export function AttentionFeed() {
  return (
    <div className="glass-panel p-6 flex flex-col h-full bg-white/[0.01]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[15px] font-bold text-white tracking-tight">Needs Attention</h3>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          3 Critical
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        <AnimatePresence>
          {attentionItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0 group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-200 text-[14px] group-hover:text-violet-300 transition-colors">{item.sku}</h4>
                    <span className={`px-1.5 py-[1px] text-[10px] uppercase font-bold rounded-md ${
                      item.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      item.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-400">{item.name}</div>
                </div>
                <div className="text-[12px] text-rose-400 font-medium">
                  {item.type === 'stockout' ? `Stockout in ${item.days}d` : `Stuck for ${item.days}d`}
                </div>
              </div>
              
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {item.cur !== "-" ? `Cur: ${item.cur} | Min: ${item.min}` : 'Transfer Issue'}
                </span>
                <button className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  {item.type === 'stockout' ? 'Draft Order' : 'Resolve'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
