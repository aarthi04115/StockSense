import { useState, useEffect } from "react";
import { Plus, Search, Filter, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category?: string;
  uom: string;
  stock: number; // calculated from stock_levels
  status: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    uom: "pcs",
    reorder_point: 0,
    reorder_qty: 0,
    category_id: 1 // default category
  });

  const fetchProducts = () => {
    fetch("http://localhost:8000/v1/products/")
      .then(res => res.json())
      .then(data => {
        // Map backend data to frontend model
        const formatted = data.map((p: any) => ({
          ...p,
          category: p.category_id ? "Mapped Category" : "Uncategorized",
          stock: p.reorder_qty || 0, // Mocking current stock based on reorder_qty for now
          status: (p.reorder_qty || 0) > 10 ? "Healthy" : ((p.reorder_qty || 0) > 0 ? "Low Stock" : "Out of Stock")
        }));
        setProducts(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("http://localhost:8000/v1/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(res => {
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts(); // Refresh list
        setFormData({ name: "", sku: "", uom: "pcs", reorder_point: 0, reorder_qty: 0, category_id: 1 });
      } else {
        console.error("Failed to create product");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col relative">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New Product</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">SKU</label>
                  <input 
                    type="text" required
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Unit of Measure (UoM)</label>
                    <input 
                      type="text" required
                      value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category ID</label>
                    <input 
                      type="number" required
                      value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Reorder Point</label>
                    <input 
                      type="number" required
                      value={formData.reorder_point} onChange={e => setFormData({...formData, reorder_point: parseFloat(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Reorder Qty</label>
                    <input 
                      type="number" required
                      value={formData.reorder_qty} onChange={e => setFormData({...formData, reorder_qty: parseFloat(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-gray-400">Manage your product catalog, categories, and inventory items.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="relative group w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
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
                <th className="px-6 py-3 rounded-tl-xl">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock Level</th>
                <th className="px-6 py-3 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <motion.tr 
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="p-2 bg-black/40 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                      <Package className="h-4 w-4 text-violet-400" />
                    </div>
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{product.sku}</td>
                  <td className="px-6 py-4 text-gray-400">{product.category}</td>
                  <td className="px-6 py-4 text-white font-medium">{product.stock} units</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      product.status === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      product.status === "Low Stock" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {product.status}
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
