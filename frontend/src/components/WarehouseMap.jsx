import { useState } from 'react';

const mockRacks = Array.from({ length: 24 }, (_, i) => ({
  id: `Rack-${i + 1}`,
  utilization: Math.random() * 100,
}));

export default function WarehouseMap() {
  const [selectedRack, setSelectedRack] = useState(null);

  const getRackColor = (utilization) => {
    if (utilization > 90) return 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-300';
    if (utilization > 60) return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30 text-amber-300';
    return 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300';
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Warehouse Map View</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
            &lt; 60% Full
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
            60-90% Full
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/50" />
            &gt; 90% Full
          </div>
        </div>
      </div>
      
      <div className="flex-1 glass-panel p-8 relative bg-white/[0.01]">
         <div className="grid grid-cols-6 gap-6 h-full">
            {mockRacks.map((rack) => (
              <button
                key={rack.id}
                onClick={() => setSelectedRack(rack)}
                className={`rounded-xl border p-4 flex flex-col justify-center items-center gap-2 transition-all cursor-pointer shadow-lg
                  ${getRackColor(rack.utilization)}
                  ${selectedRack?.id === rack.id ? 'ring-2 ring-white/50 scale-105' : ''}
                `}
              >
                <div className="font-bold">{rack.id}</div>
                <div className="text-sm opacity-80">{rack.utilization.toFixed(0)}% Utilized</div>
              </button>
            ))}
         </div>
         
         {/* Side Panel for Selected Rack */}
         {selectedRack && (
           <div className="absolute top-8 right-8 bottom-8 w-80 glass-panel bg-[#0B0D17]/95 p-6 shadow-2xl animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">{selectedRack.id} Details</h3>
                <button onClick={() => setSelectedRack(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-sm text-slate-400">Total Capacity</div>
                  <div className="text-lg font-semibold text-slate-200">1,000 Units</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-sm text-slate-400">Current Load</div>
                  <div className="text-lg font-semibold text-slate-200">{(selectedRack.utilization * 10).toFixed(0)} Units</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg mt-4 border border-violet-500/30">
                   <div className="text-sm font-semibold text-violet-400 mb-3">Top Items in Rack:</div>
                   <ul className="text-sm space-y-3 text-slate-300">
                     <li className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-400"></span>Widget A</span>
                        <span className="font-mono">120</span>
                     </li>
                     <li className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-400"></span>Gadget C</span>
                        <span className="font-mono">85</span>
                     </li>
                     <li className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-magenta-400"></span>Cable Pack</span>
                        <span className="font-mono">40</span>
                     </li>
                   </ul>
                </div>
                <button className="w-full mt-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-violet-500/20">
                  Initiate Transfer
                </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
