import { ArrowUpRight, ArrowDownRight, PackageOpen, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Value" value="$124,500" trend="+2.4%" positive />
        <KPICard title="Active SKUs" value="1,248" trend="+12" positive />
        <KPICard title="Pending Receipts" value="14" />
        <KPICard title="Low Stock Items" value="8" trend="Requires Attention" negative />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention Feed */}
        <div className="lg:col-span-1 glass-panel p-6 bg-white/[0.01]">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Needs Attention Today
          </h3>
          <div className="space-y-4">
            <AttentionItem type="low_stock" title="Widget A approaching stockout" desc="Current: 12 | Reorder Point: 15" time="2h ago" />
            <AttentionItem type="delayed" title="Receipt #RC-102 delayed" desc="Expected yesterday from TechCorp" time="5h ago" />
            <AttentionItem type="anomaly" title="Shrinkage Anomaly Detected" desc="Rack B missing 4 units of Item #409" time="1d ago" />
          </div>
        </div>

        {/* Ledger Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 bg-white/[0.01]">
           <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-violet-400" />
            Live Ledger Timeline
          </h3>
          <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
             <TimelineItem action="Receipt Validated" item="50x Widget B" user="John Doe" time="10 mins ago" badge="badge-low" />
             <TimelineItem action="Internal Transfer" item="20x Gadget C" user="Sarah Smith" time="1 hour ago" badge="badge-medium" />
             <TimelineItem action="Stock Adjustment" item="-4x Cable Pack" user="AI Anomaly Engine" time="3 hours ago" badge="badge-high" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, positive, negative }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
      <div className="text-slate-400 text-sm font-medium mb-2">{title}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {trend && (
        <div className={`text-xs font-semibold flex items-center gap-1 ${positive ? 'text-emerald-400' : negative ? 'text-rose-400' : 'text-slate-400'}`}>
          {positive && <ArrowUpRight className="w-3 h-3" />}
          {negative && <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
}

function AttentionItem({ type, title, desc, time }) {
  const badgeClass = type === 'anomaly' ? 'badge-high' : type === 'low_stock' ? 'badge-medium' : 'badge-low';
  return (
    <div className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer">
      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${type === 'anomaly' ? 'bg-rose-500' : type === 'low_stock' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      <div>
        <div className="text-sm font-semibold mb-1 text-slate-200">{title}</div>
        <div className="text-xs text-slate-400 mb-2">{desc}</div>
        <span className={badgeClass}>{time}</span>
      </div>
    </div>
  );
}

function TimelineItem({ action, item, user, time, badge }) {
  return (
    <div className="relative pl-6">
      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 border border-violet-200/20" />
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-slate-200">{action} <span className="text-slate-400 font-normal">for</span> {item}</div>
          <div className="text-xs text-slate-500 mt-1">by {user}</div>
        </div>
        <span className={badge}>{time}</span>
      </div>
    </div>
  );
}
