import { motion } from "framer-motion";
import { TrendingUp, PackageSearch, AlertTriangle, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AttentionFeed } from "../components/AttentionFeed";

const data = [
  { name: 'Mon', stock: 4000, movements: 2400 },
  { name: 'Tue', stock: 3000, movements: 1398 },
  { name: 'Wed', stock: 2000, movements: 9800 },
  { name: 'Thu', stock: 2780, movements: 3908 },
  { name: 'Fri', stock: 1890, movements: 4800 },
  { name: 'Sat', stock: 2390, movements: 3800 },
  { name: 'Sun', stock: 3490, movements: 4300 },
];

const kpis = [
  { title: "Total Value", value: "$124,500", change: "+14.5%", icon: TrendingUp, color: "text-violet-400", gradient: "from-violet-500/20 to-fuchsia-500/0" },
  { title: "Low Stock Items", value: "12", change: "-2", icon: AlertTriangle, color: "text-rose-400", gradient: "from-rose-500/20 to-orange-500/0" },
  { title: "Pending Receipts", value: "8", change: "+3", icon: PackageSearch, color: "text-amber-400", gradient: "from-amber-500/20 to-yellow-500/0" },
  { title: "Active Transfers", value: "15", change: "Stable", icon: Activity, color: "text-emerald-400", gradient: "from-emerald-500/20 to-teal-500/0" },
];

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-base text-gray-400">Welcome back. Here's what's happening in your warehouses today.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-base font-medium text-gray-400 mb-1">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-base">
              <span className={kpi.change.startsWith('+') ? 'text-emerald-400' : kpi.change.startsWith('-') ? 'text-rose-400' : 'text-gray-400'}>
                {kpi.change}
              </span>
              <span className="text-gray-500 ml-2">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Charts & Map Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6 h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Stock Movement Trend</h2>
            <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-base text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 13, 22, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="stock" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Attention Feed */}
        <div className="h-[400px]">
          <AttentionFeed />
        </div>
      </div>
    </div>
  );
}
