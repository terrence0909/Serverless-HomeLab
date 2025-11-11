import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DashboardCard = ({ title, icon, children, className }: DashboardCardProps) => {
  return (
    <div className={cn("glass-card rounded-2xl p-6 transition-all duration-300 hover:bg-white/15", className)}>
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-slate-300">{icon}</div>}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
};
