import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Truck, ArrowRightLeft, Settings, Bot, Map, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Warehouse Map", href: "/map", icon: Map },
  { name: "Receipts", href: "/receipts", icon: Truck },
  { name: "Deliveries", href: "/deliveries", icon: Truck },
  { name: "Transfers", href: "/transfers", icon: ArrowRightLeft },
  { name: "Ledger", href: "/ledger", icon: ArrowRightLeft },
  { name: "AI Insights", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load user profile from localStorage
  const savedUserStr = localStorage.getItem("stocksense_user");
  const user = savedUserStr ? JSON.parse(savedUserStr) : { name: "Alex Rivera", role: "Inventory Manager" };

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AR";

  const handleLogout = () => {
    localStorage.removeItem("stocksense_token");
    localStorage.removeItem("stocksense_user");
    navigate("/auth");
  };
  
  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 glass-panel border-r-white/10 border-r border-t-0 border-b-0 border-l-0 rounded-none h-full flex flex-col z-10"
    >
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            S
          </div>
          <span className="font-bold text-lg tracking-tight text-white">StockSense</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? "text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" 
                  />
                )}
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-300 relative z-10", 
                  isActive ? "text-violet-400" : "group-hover:text-violet-300"
                )} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white leading-tight truncate">{user.name}</p>
              <p className="text-[10px] text-violet-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
