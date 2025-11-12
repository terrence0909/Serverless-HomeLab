import { DashboardCard } from "./DashboardCard";
import { Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UrlStatsProps {
  urlStats: Record<string, { count: number; last_click: string }>;
}

export const UrlStats = ({ urlStats }: UrlStatsProps) => {
  const sortedUrls = Object.entries(urlStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  return (
    <DashboardCard title="Top URLs" icon={<Link2 className="w-5 h-5" />}>
      <ScrollArea className="h-[250px] pr-4">
        <div className="space-y-3">
          {sortedUrls.length > 0 ? (
            sortedUrls.map(([url, stats], index) => (
              <div
                key={url}
                className="p-3 bg-white/5 rounded-lg border border-white/10 transition-all hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-400">
                        #{index + 1}
                      </span>
                      <code className="text-sm text-white font-mono truncate">
                        /{url}
                      </code>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Last click: {formatDistanceToNow(new Date(stats.last_click), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-green-400">
                      {stats.count}
                    </div>
                    <p className="text-xs text-slate-400">clicks</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No URL data available</p>
          )}
        </div>
      </ScrollArea>
    </DashboardCard>
  );
};
