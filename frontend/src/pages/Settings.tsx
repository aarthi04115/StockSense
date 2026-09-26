import { useState } from "react";
import { Settings as SettingsIcon, Warehouse, Bell, Shield, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Settings() {
  const [activeTab, setActiveTab] = useState("warehouse");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateReport = () => {
    // Mocking report generation
    showNotification("Full Inventory Report generated successfully!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 right-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings & Reports</h1>
          <p className="text-gray-400">Configure your workspace and generate system reports.</p>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab("warehouse")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'warehouse' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Warehouse className={`h-5 w-5 ${activeTab === 'warehouse' ? 'text-violet-400' : 'text-gray-400'}`} />
            Warehouses
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'reports' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className={`h-5 w-5 ${activeTab === 'reports' ? 'text-violet-400' : 'text-gray-400'}`} />
            Generate Reports
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'notifications' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-violet-400' : 'text-gray-400'}`} />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'security' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Shield className={`h-5 w-5 ${activeTab === 'security' ? 'text-violet-400' : 'text-gray-400'}`} />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "warehouse" && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Warehouse Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Primary Warehouse</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                    <option>Warehouse A (Main HQ)</option>
                    <option>Warehouse B (Overflow)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Low Stock Alert Threshold</label>
                  <input 
                    type="number" 
                    defaultValue={10}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <button 
                  onClick={() => showNotification("Warehouse settings saved!")}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors mt-4"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Export Data & Reports</h2>
              <p className="text-gray-400 text-sm mb-6">Download your inventory snapshot and ledger history as CSV or PDF files.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h3 className="text-white font-medium">Full Inventory Snapshot</h3>
                    <p className="text-xs text-gray-400">Current stock levels across all warehouses.</p>
                  </div>
                  <button onClick={handleGenerateReport} className="text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors">
                    Download CSV
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h3 className="text-white font-medium">Ledger History (Last 30 Days)</h3>
                    <p className="text-xs text-gray-400">All receipts, deliveries, and adjustments.</p>
                  </div>
                  <button onClick={handleGenerateReport} className="text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors">
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {(activeTab === "notifications" || activeTab === "security") && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-6 flex items-center justify-center h-48">
              <p className="text-gray-500">Settings available in production build.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
