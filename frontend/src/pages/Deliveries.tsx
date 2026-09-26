import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Truck, CheckCircle2, Clock, 
  MapPin, Building2, PackageCheck, ChevronRight,
  User, Send, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductOption {
  id: number;
  name: string;
  sku: string;
  uom: string;
}

interface WarehouseOption {
  id: number;
  name: string;
  location: string;
}

interface DeliveryLine {
  id: number;
  product_id: number;
  qty_ordered: number;
  qty_picked: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    uom: string;
  };
}

interface Delivery {
  id: number;
  customer_id: number;
  customer_name?: string;
  shipping_address?: string;
  carrier?: string;
  status: "Draft" | "Picked" | "Done" | "Cancelled" | string;
  warehouse_id: number;
  validated_at?: string;
  lines?: DeliveryLine[];
}

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Delivery Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    shipping_address: "",
    carrier: "FedEx Ground Priority",
    warehouse_id: 1,
    lines: [{ product_id: 0, qty_ordered: 10 }]
  });

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/v1/deliveries/");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
        if (selectedDelivery) {
          const updated = data.find((d: Delivery) => d.id === selectedDelivery.id);
          if (updated) setSelectedDelivery(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [prodRes, whRes] = await Promise.all([
        fetch("http://localhost:8000/v1/products/"),
        fetch("http://localhost:8000/v1/warehouses/")
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
        if (prodData.length > 0 && formData.lines[0].product_id === 0) {
          setFormData(prev => ({
            ...prev,
            lines: [{ product_id: prodData[0].id, qty_ordered: 10 }]
          }));
        }
      }
      if (whRes.ok) {
        const whData = await whRes.json();
        setWarehouses(whData);
        if (whData.length > 0) {
          setFormData(prev => ({ ...prev, warehouse_id: whData[0].id }));
        }
      }
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchReferenceData();
  }, []);

  const handleAddLine = () => {
    const defaultProdId = products.length > 0 ? products[0].id : 1;
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { product_id: defaultProdId, qty_ordered: 5 }]
    }));
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length === 1) return;
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleLineChange = (index: number, field: "product_id" | "qty_ordered", value: number) => {
    setFormData(prev => {
      const newLines = [...prev.lines];
      newLines[index] = { ...newLines[index], [field]: value };
      return { ...prev, lines: newLines };
    });
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      alert("Please enter a customer name");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        customer_id: 101,
        customer_name: formData.customer_name,
        shipping_address: formData.shipping_address || "Standard Freight Hub, Dock 4",
        carrier: formData.carrier,
        warehouse_id: Number(formData.warehouse_id),
        lines: formData.lines.map(l => ({
          product_id: Number(l.product_id),
          qty_ordered: Number(l.qty_ordered)
        }))
      };

      const res = await fetch("http://localhost:8000/v1/deliveries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          customer_name: "",
          shipping_address: "",
          carrier: "FedEx Ground Priority",
          warehouse_id: warehouses[0]?.id || 1,
          lines: [{ product_id: products[0]?.id || 1, qty_ordered: 10 }]
        });
        await fetchDeliveries();
      } else {
        const err = await res.json();
        alert(`Error creating delivery: ${err.detail || "Server error"}`);
      }
    } catch (err) {
      console.error("Error creating delivery:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickDelivery = async (deliveryId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:8000/v1/deliveries/${deliveryId}/pick`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchDeliveries();
      } else {
        const err = await res.json();
        alert(`Pick failed: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error picking delivery:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipDelivery = async (deliveryId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:8000/v1/deliveries/${deliveryId}/validate`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchDeliveries();
      } else {
        const err = await res.json();
        alert(`Shipping validation failed: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error shipping delivery:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDelivery = async (deliveryId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this delivery order?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:8000/v1/deliveries/${deliveryId}/cancel`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchDeliveries();
      }
    } catch (err) {
      console.error("Error cancelling delivery:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered deliveries
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = 
      `DEL-${d.id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.customer_name && d.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.shipping_address && d.shipping_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.carrier && d.carrier.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = deliveries.length;
  const draftCount = deliveries.filter(d => d.status === "Draft").length;
  const pickedCount = deliveries.filter(d => d.status === "Picked").length;
  const doneCount = deliveries.filter(d => d.status === "Done").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col relative pb-10">
      {/* Header & New Delivery Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1.5">
              <Truck className="h-3 w-3" /> Outbound Logistics
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Customer Deliveries</h1>
          <p className="text-gray-400 text-sm">Fulfill sales orders, pick warehouse stock, and dispatch customer shipments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="new-delivery-btn"
            onClick={() => setIsCreateOpen(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Delivery Order
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-xs text-gray-400">Total Shipments</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-xl border border-slate-500/20 text-slate-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-200">{draftCount}</div>
            <div className="text-xs text-gray-400">Draft / Awaiting Pick</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-300">{pickedCount}</div>
            <div className="text-xs text-gray-400">Picked & Ready to Ship</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-300">{doneCount}</div>
            <div className="text-xs text-gray-400">Shipped & Delivered</div>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400" />
          <input 
            type="text" 
            placeholder="Search delivery, customer, address..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "Draft", "Picked", "Done", "Cancelled"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st 
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {st === "ALL" ? "All Orders" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Deliveries Table */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3.5">Delivery Order</th>
                <th className="px-6 py-3.5">Customer & Destination</th>
                <th className="px-6 py-3.5">Warehouse</th>
                <th className="px-6 py-3.5">Carrier / Method</th>
                <th className="px-6 py-3.5 text-center">Items Ordered</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-2"></div>
                    <div>Loading customer deliveries...</div>
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Truck className="h-10 w-10 mx-auto text-gray-600 mb-2" />
                    <p className="text-base text-gray-300 font-medium">No deliveries found</p>
                    <p className="text-xs text-gray-500 mt-1">Create a new delivery order to initiate picking and shipping.</p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const lineCount = delivery.lines?.length || 0;
                  const totalUnits = delivery.lines?.reduce((acc, l) => acc + (l.qty_ordered || 0), 0) || 0;
                  const wh = warehouses.find(w => w.id === delivery.warehouse_id);

                  return (
                    <motion.tr 
                      key={delivery.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedDelivery(delivery)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 text-violet-400 transition-colors border border-violet-500/20">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white tracking-wide">DEL-{delivery.id}</div>
                            <div className="text-xs text-gray-500">
                              {delivery.validated_at 
                                ? `Shipped: ${new Date(delivery.validated_at).toLocaleDateString()}`
                                : "Pending Dispatch"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-200">{delivery.customer_name || `Customer #${delivery.customer_id}`}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="h-3 w-3 text-gray-500 shrink-0" />
                          {delivery.shipping_address || "Main Distribution Address"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-300 text-xs flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {wh?.name || `Warehouse #${delivery.warehouse_id}`}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">
                          {delivery.carrier || "Standard Freight"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-white font-semibold">{totalUnits} units</div>
                        <div className="text-xs text-gray-400">{lineCount} SKU{lineCount !== 1 ? "s" : ""}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${
                          delivery.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          delivery.status === "Picked" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          delivery.status === "Cancelled" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-slate-500/10 text-slate-300 border-slate-500/20"
                        }`}>
                          {delivery.status === "Done" && <CheckCircle2 className="h-3 w-3" />}
                          {delivery.status === "Picked" && <PackageCheck className="h-3 w-3" />}
                          {delivery.status === "Draft" && <Clock className="h-3 w-3" />}
                          {delivery.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {delivery.status === "Draft" && (
                            <button
                              onClick={(e) => handlePickDelivery(delivery.id, e)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                              title="Pick all items in warehouse"
                            >
                              <PackageCheck className="h-3.5 w-3.5" /> Pick Items
                            </button>
                          )}

                          {delivery.status === "Picked" && (
                            <button
                              onClick={(e) => handleShipDelivery(delivery.id, e)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                              title="Validate stock and dispatch to carrier"
                            >
                              <Send className="h-3.5 w-3.5" /> Ship Order
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="View order details"
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

      {/* SLIDE-OVER DRAWER FOR DELIVERY DETAILS */}
      <AnimatePresence>
        {selectedDelivery && (
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
                  <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Delivery DEL-{selectedDelivery.id}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 mt-1 ${
                      selectedDelivery.status === "Done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      selectedDelivery.status === "Picked" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      selectedDelivery.status === "Cancelled" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-slate-500/10 text-slate-300 border-slate-500/20"
                    }`}>
                      {selectedDelivery.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Delivery Meta Information */}
              <div className="my-6 space-y-4">
                <div className="glass-panel p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Customer & Dispatch Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">Customer Account</span>
                      <span className="text-white font-medium flex items-center gap-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-violet-400" />
                        {selectedDelivery.customer_name || `Customer #${selectedDelivery.customer_id}`}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Carrier & Service</span>
                      <span className="text-white font-medium font-mono text-xs mt-0.5 block">
                        {selectedDelivery.carrier || "FedEx Priority"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-xs text-gray-500 block">Shipping Destination</span>
                      <span className="text-gray-300 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        {selectedDelivery.shipping_address || "Standard Freight Hub, Suite 400"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Shipment Item Lines</h3>
                  <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/40 text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="p-3">Product SKU / Name</th>
                          <th className="p-3 text-center">Ordered</th>
                          <th className="p-3 text-center">Picked</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedDelivery.lines && selectedDelivery.lines.length > 0 ? (
                          selectedDelivery.lines.map((line) => {
                            const isPicked = line.qty_picked >= line.qty_ordered;
                            return (
                              <tr key={line.id} className="hover:bg-white/[0.02]">
                                <td className="p-3 font-medium text-white">
                                  <div>{line.product?.name || `Product #${line.product_id}`}</div>
                                  <div className="text-[11px] text-gray-500 font-mono">{line.product?.sku || `SKU-${line.product_id}`}</div>
                                </td>
                                <td className="p-3 text-center text-gray-200 font-semibold">{line.qty_ordered} {line.product?.uom || "pcs"}</td>
                                <td className="p-3 text-center text-amber-400 font-semibold">{line.qty_picked} {line.product?.uom || "pcs"}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    isPicked ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-300"
                                  }`}>
                                    {isPicked ? "Ready" : "Pending"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-500">No item lines in this order.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
                {selectedDelivery.status === "Draft" && (
                  <button
                    onClick={() => handlePickDelivery(selectedDelivery.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PackageCheck className="h-5 w-5" />
                    Pick All Items (Stage for Dispatch)
                  </button>
                )}

                {selectedDelivery.status === "Picked" && (
                  <button
                    onClick={() => handleShipDelivery(selectedDelivery.id)}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-5 w-5" />
                    Validate Inventory & Ship Delivery
                  </button>
                )}

                {selectedDelivery.status === "Done" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> This delivery was successfully dispatched and deducted from warehouse stock.
                  </div>
                )}

                {selectedDelivery.status !== "Done" && selectedDelivery.status !== "Cancelled" && (
                  <button
                    onClick={() => handleCancelDelivery(selectedDelivery.id)}
                    disabled={actionLoading}
                    className="w-full text-rose-400 hover:bg-rose-500/10 py-2 rounded-xl text-xs font-semibold transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
                  >
                    Cancel Delivery Order
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW DELIVERY MODAL */}
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
                  <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Create Customer Delivery</h2>
                    <p className="text-xs text-gray-400">Create outbound sales order & stage picking</p>
                  </div>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateDelivery} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Customer / Client Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Apex Retail Logistics Corp"
                    value={formData.customer_name} 
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Source Warehouse</label>
                    <select
                      value={formData.warehouse_id}
                      onChange={e => setFormData({...formData, warehouse_id: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id} className="bg-gray-900 text-white">
                          {w.name} ({w.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Carrier / Shipping Method</label>
                    <select
                      value={formData.carrier}
                      onChange={e => setFormData({...formData, carrier: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    >
                      <option value="FedEx Ground Priority" className="bg-gray-900 text-white">FedEx Ground Priority</option>
                      <option value="UPS Next Day Air" className="bg-gray-900 text-white">UPS Next Day Air</option>
                      <option value="DHL Express International" className="bg-gray-900 text-white">DHL Express International</option>
                      <option value="Standard Freight Lines" className="bg-gray-900 text-white">Standard Freight Lines</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Delivery Destination Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. 742 Industrial Blvd, Suite 200, Austin, TX"
                    value={formData.shipping_address} 
                    onChange={e => setFormData({...formData, shipping_address: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>

                {/* Items Selector */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order Items</label>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
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
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
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
                            value={line.qty_ordered}
                            onChange={e => handleLineChange(idx, "qty_ordered", Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-violet-500/50"
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
                    className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Creating..." : "Create Delivery"}
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
