import { useState } from 'react';
import { Package, Truck, ArrowRightLeft, Settings, LayoutDashboard, MessageSquare, Map } from 'lucide-react';
import Dashboard from './components/Dashboard';
import WarehouseMap from './components/WarehouseMap';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0D17] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 glass-panel m-4 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gradient from-violet-500 to-magenta-500">StockSense</h1>
          </div>
          <nav className="mt-6 flex flex-col gap-2 px-4">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<Map />} label="Warehouse Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
            <NavItem icon={<Package />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
            <NavItem icon={<Truck />} label="Receipts" active={activeTab === 'receipts'} onClick={() => setActiveTab('receipts')} />
            <NavItem icon={<ArrowRightLeft />} label="Transfers" active={activeTab === 'transfers'} onClick={() => setActiveTab('transfers')} />
          </nav>
        </div>
        <div className="p-4 border-t border-white/5">
          <NavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pl-0">
        <div className="h-full glass-panel overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'map' && <WarehouseMap />}
          {activeTab !== 'dashboard' && activeTab !== 'map' && (
            <div className="flex items-center justify-center h-full text-slate-400">
              Module under construction
            </div>
          )}
        </div>
      </div>

      {/* Global AI Chat Panel Toggle */}
      <button 
        onClick={() => setIsAiChatOpen(!isAiChatOpen)}
        className="fixed bottom-6 right-6 p-4 bg-violet-600 hover:bg-violet-500 rounded-full shadow-lg shadow-violet-500/20 transition-all z-50 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="w-0 overflow-hidden group-hover:w-16 transition-all duration-300 font-medium text-sm whitespace-nowrap">Ask AI</span>
      </button>

      {/* AI Chat Panel */}
      {isAiChatOpen && (
        <div className="fixed top-4 bottom-4 right-4 w-96 glass-panel z-40 flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-white/5 font-semibold text-lg flex justify-between items-center">
            <span>StockSense AI</span>
            <button onClick={() => setIsAiChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-slate-300 text-sm">
            <div className="bg-white/5 p-3 rounded-xl rounded-tl-sm w-3/4 mb-4 border border-white/5">
              Hello! Ask me anything about the live inventory state.
            </div>
          </div>
          <div className="p-4 border-t border-white/5">
            <input type="text" placeholder="e.g., What's pending in Warehouse 2?" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
        active 
          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20 shadow-inner' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default App;
