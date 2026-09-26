import { motion } from "framer-motion";
import { 
  PackageSearch, AlertTriangle, TrendingUp, Activity, 
  ChevronRight, MoreVertical 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const data = [
  { name: '20 Sep', receipts: 120, deliveries: 80, adjustments: 30, transfers: 60 },
  { name: '21 Sep', receipts: 100, deliveries: 90, adjustments: 25, transfers: 55 },
  { name: '22 Sep', receipts: 95, deliveries: 70, adjustments: 35, transfers: 80 },
  { name: '23 Sep', receipts: 150, deliveries: 110, adjustments: 40, transfers: 75 },
  { name: '24 Sep', receipts: 130, deliveries: 95, adjustments: 20, transfers: 65 },
  { name: '25 Sep', receipts: 110, deliveries: 85, adjustments: 30, transfers: 70 },
  { name: '26 Sep', receipts: 125, deliveries: 100, adjustments: 25, transfers: 65 },
];

const pieData = [
  { name: 'Main Warehouse', value: 560, color: '#34d399' },
  { name: 'Warehouse A', value: 310, color: '#3b82f6' },
  { name: 'Warehouse B', value: 220, color: '#f59e0b' },
  { name: 'Production Floor', value: 150, color: '#8b5cf6' },
];

const kpis = [
  { title: "Total Products\nin Stock", value: "1,240", change: "↑ 12% from last month", icon: PackageSearch, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", chartColor: "#34d399" },
  { title: "Low Stock\nItems", value: "48", change: "↑ 5 new items", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", chartColor: "#f43f5e" },
  { title: "Pending\nReceipts", value: "12", change: "↑ 3 this week", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", chartColor: "#3b82f6" },
  { title: "Pending\nDeliveries", value: "18", change: "↑ 6 this week", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", chartColor: "#fbbf24" },
  { title: "Internal\nTransfers", value: "7", change: "↑ 2 scheduled", icon: Activity, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", chartColor: "#8b5cf6" },
];

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Good Morning 👋</h1>
        <p className="text-gray-400">Here's a snapshot of your inventory operations today.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-4 relative overflow-hidden group border ${kpi.border} ${kpi.bg}`}
          >
            <div className="relative z-10 flex gap-3 items-start mb-2">
              <div className={`p-2 rounded-xl bg-black/40 border border-white/10 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-medium text-gray-300 leading-tight whitespace-pre-line">{kpi.title}</p>
            </div>
            
            <div className="relative z-10 mt-2">
              <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
              <p className={`text-[10px] font-medium mt-1 ${kpi.color}`}>{kpi.change}</p>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 h-6 mt-2 overflow-hidden opacity-80">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]">
                <path d="M0,15 Q15,5 30,15 T60,10 T100,15" fill="none" stroke={kpi.chartColor} strokeWidth="2" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Bar Chart & Activities Table) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel p-5 h-[350px] flex flex-col border border-white/5 bg-[#161b22]"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                  <BarChart className="w-3 h-3 text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Stock Movement Trend</h2>
              </div>
              <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-300 focus:outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 13, 22, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="receipts" name="Receipts" fill="#34d399" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="deliveries" name="Deliveries" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="adjustments" name="Adjustments" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="transfers" name="Transfers" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          {/* Recent Activities Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel p-5 border border-white/5 bg-[#161b22]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-500/20 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-gray-300" />
                </div>
                <h2 className="text-sm font-semibold text-white">Recent Inventory Activities</h2>
              </div>
              <button className="text-xs text-blue-400 flex items-center hover:text-blue-300">View All <ChevronRight className="w-3 h-3 ml-1" /></button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-400">
                <thead className="text-[10px] uppercase text-gray-500 border-b border-white/5">
                  <tr>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Reference</th>
                    <th className="py-2 font-medium">Product</th>
                    <th className="py-2 font-medium">Qty</th>
                    <th className="py-2 font-medium">Location</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Time</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3"><span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">Receipt</span></td>
                    <td className="py-3 text-gray-300">RCPT-2026-014</td>
                    <td className="py-3 text-gray-300">Steel Rods</td>
                    <td className="py-3 text-emerald-400">+50</td>
                    <td className="py-3 text-gray-300">Main Warehouse</td>
                    <td className="py-3"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Done</span></td>
                    <td className="py-3">10:24 AM</td>
                    <td className="py-3 text-right"><MoreVertical className="w-4 h-4 inline-block text-gray-500" /></td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3"><span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">Delivery</span></td>
                    <td className="py-3 text-gray-300">DEL-2026-032</td>
                    <td className="py-3 text-gray-300">Office Chairs</td>
                    <td className="py-3 text-rose-400">-10</td>
                    <td className="py-3 text-gray-300">Warehouse A</td>
                    <td className="py-3"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Done</span></td>
                    <td className="py-3">09:15 AM</td>
                    <td className="py-3 text-right"><MoreVertical className="w-4 h-4 inline-block text-gray-500" /></td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3"><span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 text-[10px] border border-violet-500/20">Transfer</span></td>
                    <td className="py-3 text-gray-300">TRF-2026-008</td>
                    <td className="py-3 text-gray-300">Monitors</td>
                    <td className="py-3 text-gray-300">20</td>
                    <td className="py-3 text-gray-400 text-[10px]">WH A → WH B</td>
                    <td className="py-3"><span className="text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] bg-blue-500/10">In Progress</span></td>
                    <td className="py-3">Yesterday</td>
                    <td className="py-3 text-right"><MoreVertical className="w-4 h-4 inline-block text-gray-500" /></td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3"><span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">Adjustment</span></td>
                    <td className="py-3 text-gray-300">ADJ-2026-005</td>
                    <td className="py-3 text-gray-300">PVC Pipes</td>
                    <td className="py-3 text-rose-400">-3</td>
                    <td className="py-3 text-gray-300">Warehouse B</td>
                    <td className="py-3"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Done</span></td>
                    <td className="py-3">Yesterday</td>
                    <td className="py-3 text-right"><MoreVertical className="w-4 h-4 inline-block text-gray-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Low Stock & Warehouse Donut) */}
        <div className="space-y-6">
          
          {/* Low Stock Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="glass-panel p-5 border border-white/5 bg-[#161b22] h-[350px]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-white">Low Stock Alerts</h2>
              </div>
              <button className="text-xs text-blue-400 flex items-center hover:text-blue-300">View All <ChevronRight className="w-3 h-3 ml-1" /></button>
            </div>
            
            <div className="space-y-4 mt-4">
              {[
                { name: 'Steel Rods', sku: 'SR-001', loc: 'Main Warehouse', current: 5, total: 100, icon: 'bg-gray-700' },
                { name: 'Office Chairs', sku: 'CH-002', loc: 'Warehouse A', current: 8, total: 50, icon: 'bg-gray-700' },
                { name: 'Monitor 24"', sku: 'MN-024', loc: 'Warehouse A', current: 3, total: 30, icon: 'bg-gray-700' },
                { name: 'Safety Helmets', sku: 'SH-005', loc: 'Main Warehouse', current: 6, total: 40, icon: 'bg-yellow-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.icon} flex items-center justify-center`}>
                       {/* Mock icon placeholder */}
                       <div className="w-4 h-4 border-2 border-white/30 rounded-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500">SKU: {item.sku} <span className="mx-1">•</span> {item.loc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] text-gray-400">{item.current} / {item.total} units</p>
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${(item.current/item.total)*100}%` }} />
                    </div>
                  </div>
                  <button className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] hover:bg-rose-500/20 transition-colors">
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stock by Warehouse Donut */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel p-5 border border-white/5 bg-[#161b22]"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                  <PackageSearch className="w-3 h-3 text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Stock by Warehouse</h2>
              </div>
              <button className="text-xs text-blue-400 flex items-center hover:text-blue-300">View All <ChevronRight className="w-3 h-3 ml-1" /></button>
            </div>
            
            <div className="flex items-center justify-between h-40">
              <div className="relative w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-white">1,240</span>
                  <span className="text-[8px] text-gray-400">Total Units</span>
                </div>
              </div>
              
              <div className="w-1/2 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-gray-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
