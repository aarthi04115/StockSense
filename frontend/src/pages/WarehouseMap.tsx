import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Maximize2 } from "lucide-react";

const RACKS = ["A", "B", "C", "D"];
const BINS = [1, 2, 3, 4, 5, 6, 7, 8];

export function WarehouseMap() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Generate a mock floor plan grid
  const getCellColor = (rack: string, bin: number) => {
    // Mock logic to show different stock levels
    const val = rack.charCodeAt(0) + bin;
    if (val % 5 === 0) return "bg-rose-500/20 border-rose-500/50"; // Low/Out of stock
    if (val % 3 === 0) return "bg-amber-500/20 border-amber-500/50"; // Medium stock
    if (val % 7 === 0) return "bg-white/5 border-white/10"; // Empty bin
    return "bg-emerald-500/20 border-emerald-500/50"; // Healthy stock
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Warehouse Map</h1>
          <p className="text-gray-400">Spatial visualization of stock locations across the facility.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400" />
            <input 
              type="text" 
              placeholder="Locate SKU or Product..." 
              className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            />
          </div>
          <button className="p-2 rounded-xl glass-panel text-gray-400 hover:text-white transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel p-6 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500/50 border border-emerald-500"></div> Healthy</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500/50 border border-amber-500"></div> Medium</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500/50 border border-rose-500"></div> Low/Empty</div>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <Maximize2 className="h-4 w-4" /> Fullscreen
          </button>
        </div>

        {/* Map Grid container */}
        <div className="flex-1 overflow-auto bg-black/20 rounded-xl border border-white/5 p-8 flex items-center justify-center">
          <div className="flex gap-16">
            {RACKS.map((rack, rIdx) => (
              <div key={rack} className="flex flex-col gap-4">
                <div className="text-center font-bold text-gray-400 text-lg mb-2">Rack {rack}</div>
                <div className="grid grid-cols-2 gap-2">
                  {BINS.map((bin, bIdx) => {
                    const cellId = `${rack}-${bin}`;
                    const isSelected = selectedCell === cellId;
                    return (
                      <motion.div
                        key={bin}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCell(cellId)}
                        className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition-colors relative flex items-center justify-center ${getCellColor(rack, bin)} ${isSelected ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}
                      >
                        <span className="text-xs font-medium text-white/50">{rack}{bin}</span>
                        {isSelected && (
                          <motion.div layoutId="cell-highlight" className="absolute inset-0 bg-white/10 rounded-lg" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating details panel */}
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 glass-panel p-5 shadow-2xl border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Location {selectedCell}</h3>
                <p className="text-sm text-gray-400">Warehouse 1, Zone A</p>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-gray-400">Stored Product</span>
                <span className="text-white font-medium">Premium Widgets (SKU-1002)</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-gray-400">Quantity</span>
                <span className="text-emerald-400 font-bold">145 Units</span>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">Transfer Stock</button>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">Adjust Count</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
