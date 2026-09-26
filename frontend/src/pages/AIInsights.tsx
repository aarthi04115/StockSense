import { Bot, Sparkles, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function AIInsights() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            AI Insights <Sparkles className="h-6 w-6 text-fuchsia-400" />
          </h1>
          <p className="text-gray-400">Demand forecasting and anomaly detection powered by your ledger data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Forecasts Panel */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Demand Forecasting</h2>
          </div>
          <div className="space-y-4 flex-1 overflow-auto pr-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">Premium Widgets (SKU-100{i})</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">85% Confidence</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">Predicted stockout in <strong className="text-amber-400">{14 + i * 3} days</strong> based on recent consumption trends.</p>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                  Review Suggested Reorder →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies Panel */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Anomaly Detection</h2>
          </div>
          <div className="space-y-4 flex-1 overflow-auto pr-2">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">Suspicious Adjustment</h3>
                <span className="text-xs font-medium px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full">High Severity</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Unusually large negative adjustment (-50 units) on <strong>Ergonomic Office Chair</strong> by Warehouse Staff.</p>
              <div className="flex gap-3 mt-3">
                <button className="text-sm bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg transition-colors">Investigate</button>
                <button className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Dismiss</button>
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">Repetitive Shrinkage</h3>
                <span className="text-xs font-medium px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">Medium Severity</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Pattern of repeated minor losses marked as "damaged" for <strong>USB-C Hub adapter</strong> over the last 30 days.</p>
              <div className="flex gap-3 mt-3">
                <button className="text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors">Investigate</button>
                <button className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
