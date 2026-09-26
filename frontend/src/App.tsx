import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
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

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("stocksense_token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Page (Public) */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected workspace routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><WarehouseMap /></ProtectedRoute>} />
        <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
        <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
        <Route path="/ledger" element={<ProtectedRoute><LedgerTimeline /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<ProtectedRoute><div className="text-white p-4 text-xl">404 - Page Not Found</div></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
