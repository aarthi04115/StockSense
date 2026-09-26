import { motion } from "framer-motion";
import { ArrowRightLeft, PackagePlus, PackageMinus, Edit3, Clock } from "lucide-react";

// Mock data for the ledger timeline
const timelineEvents = [
  {
    id: 1,
    type: "RECEIPT",
    docId: "RC-2023-0891",
    product: "Premium Widgets (SKU-1002)",
    location: "Rack A, Bin 4",
    actor: "Jane Smith",
    delta: "+50",
    balanceAfter: 145,
    timestamp: "10 minutes ago",
    icon: PackagePlus,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    id: 2,
    type: "TRANSFER",
    docId: "TR-2023-1102",
    product: "Industrial Sensors (SKU-8821)",
    location: "Rack C, Bin 1 → Rack B, Bin 2",
    actor: "John Doe",
    delta: "0",
    balanceAfter: 82,
    timestamp: "2 hours ago",
    icon: ArrowRightLeft,
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/30",
  },
  {
    id: 3,
    type: "DELIVERY",
    docId: "DL-2023-0441",
    product: "Copper Wire Spools (SKU-3321)",
    location: "Rack D, Bin 8",
    actor: "System API",
    delta: "-12",
    balanceAfter: 34,
    timestamp: "5 hours ago",
    icon: PackageMinus,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  {
    id: 4,
    type: "ADJUSTMENT",
    docId: "ADJ-2023-0092",
    product: "Packaging Tape (SKU-9901)",
    location: "Rack A, Bin 1",
    actor: "Jane Smith",
    delta: "-3",
    balanceAfter: 42,
    timestamp: "Yesterday, 14:30",
    icon: Edit3,
    color: "text-rose-400",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30",
    note: "Damaged during handling",
  },
];

export function LedgerTimeline() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Ledger Timeline</h1>
        <p className="text-gray-400">Immutable, chronological log of all stock movements.</p>
      </div>

      <div className="glass-panel p-6 sm:p-10 relative">
        {/* Vertical line connecting events */}
        <div className="absolute left-[43px] sm:left-[67px] top-10 bottom-10 w-px bg-white/10" />
        
        <div className="space-y-10 relative z-10">
          {timelineEvents.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="flex gap-4 sm:gap-6 group"
            >
              {/* Event Icon / Node */}
              <div className="flex flex-col items-center mt-1">
                <div className={`h-12 w-12 rounded-full border flex items-center justify-center backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 ${event.bgColor} ${event.borderColor}`}>
                  <event.icon className={`h-5 w-5 ${event.color}`} />
                </div>
              </div>
              
              {/* Event Card */}
              <div className="flex-1">
                <div className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors group-hover:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${event.color} ${event.borderColor} ${event.bgColor}`}>
                          {event.type}
                        </span>
                        <span className="text-sm font-medium text-gray-400">{event.docId}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mt-2">{event.product}</h3>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                        <span className="text-gray-300 font-medium">{event.actor}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {event.timestamp}
                      </div>
                      <div className="mt-2 text-xl font-mono font-bold tracking-tight">
                        <span className={event.delta.startsWith('+') ? 'text-emerald-400' : event.delta.startsWith('-') ? 'text-rose-400' : 'text-gray-400'}>
                          {event.delta}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        Bal: <span className="text-gray-300">{event.balanceAfter}</span>
                      </div>
                    </div>
                  </div>
                  
                  {event.note && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-rose-400/80">Note:</span> {event.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
