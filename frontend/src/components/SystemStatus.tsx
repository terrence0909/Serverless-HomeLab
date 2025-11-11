import { Server, DollarSign, Clock } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface SystemStatusProps {
  cost: string;
  uptime: string;
}

export const SystemStatus = ({ cost, uptime }: SystemStatusProps) => {
  return (
    <DashboardCard title="System Status" icon={<Server size={24} />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Monthly Cost</p>
              <p className="text-lg font-semibold text-white">{cost}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Uptime</p>
              <p className="text-lg font-semibold text-white">{uptime}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
