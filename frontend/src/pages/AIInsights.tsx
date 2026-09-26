import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, TrendingUp } from "lucide-react";

export function AIInsights() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/v1/ai/forecasts")
      .then(res => res.json())
      .then(data => setForecasts(data))
      .catch(console.error);

    fetch("http://localhost:8000/v1/ai/anomalies")
      .then(res => res.json())
      .then(data => setAnomalies(data))
      .catch(console.error);
  }, []);

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
            {forecasts.map((f, i) => (
              <div key={f.id || i} className="bg-black/20 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">{f.product_name} ({f.sku})</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{(f.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">Predicted stockout on <strong className="text-amber-400">{new Date(f.predicted_stockout_date).toLocaleDateString()}</strong> based on recent consumption trends.</p>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                  Review Suggested Reorder ({f.suggested_reorder_qty} pcs) →
                </button>
              </div>
            ))}
            {forecasts.length === 0 && <p className="text-gray-500">No forecasts available.</p>}
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
            {anomalies.map((a, i) => (
              <div key={a.id || i} className={`border rounded-xl p-4 ${a.anomaly_score > 0.9 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">Suspicious Adjustment</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.anomaly_score > 0.9 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    Score: {a.anomaly_score.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{a.reason} <strong>{a.product_name}</strong>.</p>
                <div className="flex gap-3 mt-3">
                  <button className={`text-sm text-white px-3 py-1.5 rounded-lg transition-colors ${a.anomaly_score > 0.9 ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                    Investigate
                  </button>
                  <button className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Dismiss</button>
                </div>
              </div>
            ))}
            {anomalies.length === 0 && <p className="text-gray-500">No anomalies detected.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
