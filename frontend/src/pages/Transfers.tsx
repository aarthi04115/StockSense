import { useState, useEffect } from "react";
import { Plus, Search, Filter, ArrowRightLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transfer {
  id: string;
  from: string;
  to: string;
  product: string;
  qty: number;
  status: string;
  date: string;
}

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    source_warehouse_id: 1,
    destination_warehouse_id: 2
  });

  const fetchTransfers = () => {
    fetch("http://localhost:8000/v1/transfers/")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((t: any) => ({
          id: `TRN-${t.id}`,
          from: `Warehouse ${t.source_warehouse_id}`,
          to: `Warehouse ${t.destination_warehouse_id}`,
          product: "Multiple Items",
          qty: 0,
          status: t.status || "Draft",
          date: t.validated_at ? new Date(t.validated_at).toLocaleDateString() : "Pending"
        }));
        setTransfers(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transfers:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      source_warehouse_id: formData.source_warehouse_id,
      destination_warehouse_id: formData.destination_warehouse_id,
      lines: []
    };
    
    fetch("http://localhost:8000/v1/transfers/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        setIsModalOpen(false);
        fetchTransfers();
      } else {
        console.error("Failed to create transfer");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col relative">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create Draft Transfer</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Source Warehouse ID</label>
                  <input 
                    type="number" required
                    value={formData.source_warehouse_id} onChange={e => setFormData({...formData, source_warehouse_id: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Destination Warehouse ID</label>
                  <input 
                    type="number" required
                    value={formData.destination_warehouse_id} onChange={e => setFormData({...formData, destination_warehouse_id: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                    Create Draft
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transfers</h1>
          <p className="text-gray-400">Manage internal stock movements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4" />
            New Transfer
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="relative group w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400" />
            <input 
              type="text" 
              placeholder="Search transfers..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            />
          </div>
          <button className="p-2 rounded-xl bg-black/20 border border-white/10 text-gray-400 hover:text-white transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-400 uppercase bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 rounded-tl-xl">Transfer ID</th>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <motion.tr 
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="p-2 bg-black/40 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                      <ArrowRightLeft className="h-4 w-4 text-violet-400" />
                    </div>
                    {t.id}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{t.from}</td>
                  <td className="px-6 py-4 text-gray-300">{t.to}</td>
                  <td className="px-6 py-4 text-gray-400">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      t.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      t.status === "Waiting" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
