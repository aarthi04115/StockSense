import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { WarehouseMap } from "./pages/WarehouseMap";
import { LedgerTimeline } from "./pages/LedgerTimeline";
import { Products } from "./pages/Products";
import { Receipts } from "./pages/Receipts";
import { Deliveries } from "./pages/Deliveries";
import { Transfers } from "./pages/Transfers";
import { Auth } from "./pages/Auth";
import { AIInsights } from "./pages/AIInsights";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes wrapped in Layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/map" element={<Layout><WarehouseMap /></Layout>} />
        <Route path="/receipts" element={<Layout><Receipts /></Layout>} />
        <Route path="/deliveries" element={<Layout><Deliveries /></Layout>} />
        <Route path="/transfers" element={<Layout><Transfers /></Layout>} />
        <Route path="/ledger" element={<Layout><LedgerTimeline /></Layout>} />
        <Route path="/ai" element={<Layout><AIInsights /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*" element={<Layout><div className="text-white p-4 text-xl">404 - Page Not Found</div></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
