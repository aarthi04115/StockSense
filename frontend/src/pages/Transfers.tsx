import { useState } from "react";
import { Plus, Search, Filter, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

export function Transfers() {
  const [transfers, setTransfers] = useState([
    { id: "TRN-881", from: "Warehouse A", to: "Production Floor", product: "SKU-1002", qty: 20, status: "Done", date: "2024-03-24" },
    { id: "TRN-882", from: "Warehouse A", to: "Warehouse B", product: "SKU-1004", qty: 50, status: "Draft", date: "2024-03-26" },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transfers</h1>
          <p className="text-gray-400">Manage internal stock movements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
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
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Qty</th>
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
                  <td className="px-6 py-4 text-gray-400">{t.product}</td>
                  <td className="px-6 py-4 text-white font-medium">{t.qty}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      t.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
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
