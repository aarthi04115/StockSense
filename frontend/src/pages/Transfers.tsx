import { useState, useEffect } from "react";
import { 
  Plus, Search, ArrowRightLeft, ArrowRight, X, 
  CheckCircle2, Clock, 
  ChevronRight, RefreshCw, Send, Trash2, MoveRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductOption {
  id: number;
  name: string;
  sku: string;
  uom: string;
}

interface LocationOption {
  id: number;
  warehouse_id: number;
  code: string;
  type: string;
}

interface WarehouseOption {
  id: number;
  name: string;
  location: string;
}

interface TransferLine {
  id: number;
  product_id: number;
  qty: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    uom: string;
  };
}

interface Transfer {
  id: number;
  from_location_id: number;
  to_location_id: number;
  reason?: string;
  status: "Draft" | "In Transit" | "Done" | string;
  validated_at?: string;
  lines?: TransferLine[];
  from_location?: LocationOption;
  to_location?: LocationOption;
}

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawer States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Transfer Form State
  const [formData, setFormData] = useState({
    from_location_id: 1,
    to_location_id: 2,
    reason: "Replenish Active Picking Bay from Bulk Reserve",
    lines: [{ product_id: 0, qty: 20 }]
  });

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/v1/transfers/");
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
        if (selectedTransfer) {
          const updated = data.find((t: Transfer) => t.id === selectedTransfer.id);
          if (updated) setSelectedTransfer(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [prodRes, locRes, whRes] = await Promise.all([
        fetch("http://localhost:8000/v1/products/"),
        fetch("http://localhost:8000/v1/warehouses/locations"),
        fetch("http://localhost:8000/v1/warehouses/")
      ]);
      
      let prods: ProductOption[] = [];
      let locs: LocationOption[] = [];

      if (prodRes.ok) {
        prods = await prodRes.json();
        setProducts(prods);
      }
      if (locRes.ok) {
        locs = await locRes.json();
        setLocations(locs);
      }
      if (whRes.ok) {
        const whs = await whRes.json();
        setWarehouses(whs);
      }

      // Initialize form defaults if needed
      if (locs.length >= 2 && formData.from_location_id === 1) {
        setFormData(prev => ({
          ...prev,
          from_location_id: locs[0].id,
          to_location_id: locs[1].id,
          lines: [{ product_id: prods[0]?.id || 1, qty: 20 }]
        }));
      }
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchReferenceData();
  }, []);

  const handleAddLine = () => {
    const defaultProdId = products.length > 0 ? products[0].id : 1;
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { product_id: defaultProdId, qty: 10 }]
    }));
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length === 1) return;
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleLineChange = (index: number, field: "product_id" | "qty", value: number) => {
    setFormData(prev => {
      const newLines = [...prev.lines];
      newLines[index] = { ...newLines[index], [field]: value };
      return { ...prev, lines: newLines };
    });
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_location_id === formData.to_location_id) {
      alert("Source and Destination locations cannot be the same.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        from_location_id: Number(formData.from_location_id),
        to_location_id: Number(formData.to_location_id),
        reason: formData.reason,
        lines: formData.lines.map(l => ({
          product_id: Number(l.product_id),
          qty: Number(l.qty)
        }))
      };

      const res = await fetch("http://localhost:8000/v1/transfers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          from_location_id: locations[0]?.id || 1,
          to_location_id: locations[1]?.id || 2,
          reason: "Replenish Active Picking Bay from Bulk Reserve",
          lines: [{ product_id: products[0]?.id || 1, qty: 20 }]
        });
        await fetchTransfers();
      } else {
        const err = await res.json();
        alert(`Error creating transfer: ${err.detail || "Server error"}`);
      }
    } catch (err) {
      console.error("Error creating transfer:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetInTransit = async (transferId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:8000/v1/transfers/${transferId}/transit`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchTransfers();
      } else {
        const err = await res.json();
        alert(`Transit transition failed: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error updating transfer to In Transit:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTransfer = async (transferId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:8000/v1/transfers/${transferId}/validate`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchTransfers();
      } else {
        const err = await res.json();
        alert(`Transfer completion failed: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error completing transfer:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getLocationLabel = (locId: number) => {
    const loc = locations.find(l => l.id === locId);
    if (!loc) return `Location #${locId}`;
    const wh = warehouses.find(w => w.id === loc.warehouse_id);
    return `${loc.code} (${loc.type}) - ${wh ? wh.name : "Warehouse"}`;
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const fromLabel = getLocationLabel(t.from_location_id);
    const toLabel = getLocationLabel(t.to_location_id);
    const matchesSearch = 
      `TRN-${t.id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.reason && t.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      fromLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = transfers.length;
  const draftCount = transfers.filter(t => t.status === "Draft").length;
  const transitCount = transfers.filter(t => t.status === "In Transit").length;
  const doneCount = transfers.filter(t => t.status === "Done").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col relative pb-10">
      {/* Header & New Transfer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3 w-3" /> Internal Movements
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Transfers</h1>
          <p className="text-gray-400 text-sm">Move inventory across warehouse zones, racks, and distribution facilities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="new-transfer-btn"
            onClick={() => setIsCreateOpen(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Internal Transfer
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-xs text-gray-400">Total Transfers</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-xl border border-slate-500/20 text-slate-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-200">{draftCount}</div>
            <div className="text-xs text-gray-400">Draft / Staging</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
            <RefreshCw className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-300">{transitCount}</div>
            <div className="text-xs text-gray-400">In Transit (Moving)</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-300">{doneCount}</div>
            <div className="text-xs text-gray-400">Completed & Stocked</div>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search transfer ID, route, purpose..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "Draft", "In Transit", "Done"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {st === "ALL" ? "All Transfers" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Transfers Table */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3.5">Transfer Ref</th>
                <th className="px-6 py-3.5">Source ➔ Destination Route</th>
                <th className="px-6 py-3.5">Purpose / Reason</th>
                <th className="px-6 py-3.5 text-center">Transfer Qty</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
                    <div>Loading inventory transfers...</div>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <ArrowRightLeft className="h-10 w-10 mx-auto text-gray-600 mb-2" />
                    <p className="text-base text-gray-300 font-medium">No internal transfers found</p>
                    <p className="text-xs text-gray-500 mt-1">Create a new internal transfer to move items between warehouse locations.</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => {
                  const lineCount = transfer.lines?.length || 0;
                  const totalUnits = transfer.lines?.reduce((acc, l) => acc + (l.qty || 0), 0) || 0;

                  return (
                    <motion.tr 
                      key={transfer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedTransfer(transfer)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 text-emerald-400 transition-colors border border-emerald-500/20">
                            <ArrowRightLeft className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white tracking-wide">TRN-{transfer.id}</div>
                            <div className="text-xs text-gray-500">
                              {transfer.validated_at 
                                ? `Completed: ${new Date(transfer.validated_at).toLocaleDateString()}`
                                : "Internal Transfer"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-emerald-300">
                            {getLocationLabel(transfer.from_location_id).split(" - ")[0]}
                          </span>
                          <MoveRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-teal-300">
                            {getLocationLabel(transfer.to_location_id).split(" - ")[0]}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-300 font-medium block truncate max-w-xs">
                          {transfer.reason || "Internal Stock Replenishment"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-white font-semibold">{totalUnits} units</div>
                        <div className="text-xs text-gray-400">{lineCount} SKU{lineCount !== 1 ? "s" : ""}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${
                          transfer.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          transfer.status === "In Transit" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse" :
                          "bg-slate-500/10 text-slate-300 border-slate-500/20"
                        }`}>
                          {transfer.status === "Done" && <CheckCircle2 className="h-3 w-3" />}
                          {transfer.status === "In Transit" && <RefreshCw className="h-3 w-3" />}
                          {transfer.status === "Draft" && <Clock className="h-3 w-3" />}
                          {transfer.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {transfer.status === "Draft" && (
                            <button
                              onClick={(e) => handleSetInTransit(transfer.id, e)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                              title="Mark departed & In-Transit"
                            >
                              <Send className="h-3.5 w-3.5" /> Dispatch In-Transit
                            </button>
                          )}

                          {transfer.status === "In Transit" && (
                            <button
                              onClick={(e) => handleCompleteTransfer(transfer.id, e)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                              title="Receive stock at destination"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Receive & Stock
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedTransfer(transfer)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="View transfer details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER FOR TRANSFER DETAILS */}
      <AnimatePresence>
        {selectedTransfer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-gray-900 border-l border-white/10 h-full p-6 shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Transfer TRN-{selectedTransfer.id}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 mt-1 ${
                      selectedTransfer.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      selectedTransfer.status === "In Transit" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                      "bg-slate-500/10 text-slate-300 border-slate-500/20"
                    }`}>
                      {selectedTransfer.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTransfer(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Transfer Movement Route Visualizer */}
              <div className="my-6 space-y-4">
                <div className="glass-panel p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Movement Route</h3>
                  
                  <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Source Location</span>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">
                        {getLocationLabel(selectedTransfer.from_location_id)}
                      </div>
                    </div>

                    <div className="px-3 flex flex-col items-center">
                      <ArrowRight className="h-5 w-5 text-gray-500" />
                      <span className="text-[10px] font-mono text-gray-400 mt-0.5">
                        {selectedTransfer.status}
                      </span>
                    </div>

                    <div className="text-center flex-1">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Target Location</span>
                      <div className="text-sm font-semibold text-teal-400 mt-1">
                        {getLocationLabel(selectedTransfer.to_location_id)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    <span className="font-semibold text-gray-300">Reason: </span>
                    {selectedTransfer.reason || "Internal Stock Movement"}
                  </div>
                </div>

                {/* Transferred Items Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inventory Items to Transfer</h3>
                  <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/40 text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="p-3">Product SKU / Name</th>
                          <th className="p-3 text-center">Movement Qty</th>
                          <th className="p-3 text-right">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedTransfer.lines && selectedTransfer.lines.length > 0 ? (
                          selectedTransfer.lines.map((line) => (
                            <tr key={line.id} className="hover:bg-white/[0.02]">
                              <td className="p-3 font-medium text-white">
                                <div>{line.product?.name || `Product #${line.product_id}`}</div>
                                <div className="text-[11px] text-gray-500 font-mono">{line.product?.sku || `SKU-${line.product_id}`}</div>
                              </td>
                              <td className="p-3 text-center text-emerald-400 font-bold text-sm">
                                {line.qty}
                              </td>
                              <td className="p-3 text-right text-gray-400 font-medium">
                                {line.product?.uom || "pcs"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500">No items listed for this transfer.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
                {selectedTransfer.status === "Draft" && (
                  <button
                    onClick={() => handleSetInTransit(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-5 w-5" />
                    Dispatch Stock (Mark In-Transit)
                  </button>
                )}

                {selectedTransfer.status === "In Transit" && (
                  <button
                    onClick={() => handleCompleteTransfer(selectedTransfer.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Receive & Stock at Destination Location
                  </button>
                )}

                {selectedTransfer.status === "Done" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> This internal transfer is complete and inventory levels have been balanced.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW TRANSFER MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Create Stock Transfer</h2>
                    <p className="text-xs text-gray-400">Move inventory between locations or facilities</p>
                  </div>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTransfer} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Source Location *</label>
                    <select
                      value={formData.from_location_id}
                      onChange={e => setFormData({...formData, from_location_id: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.id} className="bg-gray-900 text-white">
                          {l.code} ({l.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Destination Location *</label>
                    <select
                      value={formData.to_location_id}
                      onChange={e => setFormData({...formData, to_location_id: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.id} className="bg-gray-900 text-white">
                          {l.code} ({l.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Transfer Purpose / Reason</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Replenish picking bay, Zone balancing, Quarantine"
                    value={formData.reason} 
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Items Selector */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transfer Items</label>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Product
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.lines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex-1">
                          <select
                            value={line.product_id}
                            onChange={e => handleLineChange(idx, "product_id", Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number" min="1" required
                            placeholder="Qty"
                            value={line.qty}
                            onChange={e => handleLineChange(idx, "qty", Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        {formData.lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateOpen(false)} 
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Creating..." : "Create Transfer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
