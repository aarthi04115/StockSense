import { useState, useEffect } from "react";
import { Plus, Search, Filter, Box } from "lucide-react";
import { motion } from "framer-motion";

interface Delivery {
  id: string;
  customer: string;
  items: number;
  status: string;
  date: string;
}

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/v1/deliveries/")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          id: `DEL-${d.id}`,
          customer: `Customer ${d.customer_id || 'Unknown'}`,
          items: 1, // Mocking line count
          status: d.status || "Draft",
          date: d.validated_at ? new Date(d.validated_at).toLocaleDateString() : "Pending"
        }));
        setDeliveries(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching deliveries:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Deliveries</h1>
          <p className="text-gray-400">Manage outgoing stock for customer shipments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4" />
            New Delivery
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="relative group w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400" />
            <input 
              type="text" 
              placeholder="Search deliveries..." 
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
                <th className="px-6 py-3 rounded-tl-xl">Delivery ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <motion.tr 
                  key={delivery.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="p-2 bg-black/40 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                      <Box className="h-4 w-4 text-violet-400" />
                    </div>
                    {delivery.id}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{delivery.customer}</td>
                  <td className="px-6 py-4 text-gray-400">{delivery.date}</td>
                  <td className="px-6 py-4 text-white font-medium">{delivery.items}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      delivery.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      delivery.status === "Picked" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}>
                      {delivery.status}
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
