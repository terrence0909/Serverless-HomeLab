import { Code2 } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface ApiEndpoint {
  method: string;
  path: string;
  description?: string;
}

interface ApiEndpointsProps {
  endpoints: ApiEndpoint[];
}

export const ApiEndpoints = ({ endpoints }: ApiEndpointsProps) => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-emerald-400 bg-emerald-500/20";
      case "POST":
        return "text-blue-400 bg-blue-500/20";
      case "PUT":
        return "text-amber-400 bg-amber-500/20";
      case "DELETE":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
    }
  };

  return (
    <DashboardCard title="API Endpoints" icon={<Code2 size={24} />}>
      <div className="space-y-2">
        {endpoints.map((endpoint, index) => (
          <div
            key={index}
            className="p-4 bg-white/5 rounded-xl border border-white/10 transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${getMethodColor(
                  endpoint.method
                )}`}
              >
                {endpoint.method}
              </span>
              <code className="text-sm text-slate-300 font-mono">{endpoint.path}</code>
            </div>
            {endpoint.description && (
              <p className="text-sm text-slate-400 mt-2">{endpoint.description}</p>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};
