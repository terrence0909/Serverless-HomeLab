import { Boxes } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Badge } from "./ui/badge";

interface Service {
  name: string;
  status: "live" | "planned";
  description?: string;
}

interface ServicesStatusProps {
  services: Service[];
}

export const ServiceStatus = ({ services }: ServicesStatusProps) => {
  return (
    <DashboardCard title="Tools & Services" icon={<Boxes size={24} />}>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-all hover:bg-white/10"
          >
            <div className="flex-1">
              <p className="text-white font-medium">{service.name}</p>
              {service.description && (
                <p className="text-sm text-slate-400 mt-1">{service.description}</p>
              )}
            </div>
            <Badge
              variant={service.status === "live" ? "default" : "secondary"}
              className={
                service.status === "live"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
              }
            >
              {service.status}
            </Badge>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};
