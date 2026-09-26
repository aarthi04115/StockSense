import { Settings as SettingsIcon, Warehouse, Users, Bell, Shield } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-gray-400">Configure your workspace and user preferences.</p>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium transition-colors">
            <Warehouse className="h-5 w-5 text-violet-400" />
            Warehouses
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Users className="h-5 w-5 text-gray-400" />
            Team Members
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Bell className="h-5 w-5 text-gray-400" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Shield className="h-5 w-5 text-gray-400" />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
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
              <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors mt-4">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
