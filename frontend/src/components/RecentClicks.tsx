import { DashboardCard } from "./DashboardCard";
import { Clock, Monitor, Smartphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Click } from "./AnalyticsDashboard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentClicksProps {
  clicks: Click[];
}

const getDeviceIcon = (userAgent: string) => {
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent.toLowerCase());
  return isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
};

const getBrowserName = (userAgent: string) => {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown";
};

const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export const RecentClicks = ({ clicks }: RecentClicksProps) => {
  const recentClicks = [...clicks]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <DashboardCard title="Recent Clicks" icon={<Clock className="w-5 h-5" />}>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {recentClicks.length > 0 ? (
            recentClicks.map((click, index) => (
              <div
                key={`${click.timestamp}-${index}`}
                className="p-3 bg-white/5 rounded-lg border border-white/10 transition-all hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-slate-400 flex-shrink-0">
                      {getDeviceIcon(click.user_agent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm text-white font-mono block truncate">
                        /{click.short_url}
                      </code>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {getBrowserName(click.user_agent)}
                        </span>
                        {click.referrer && isValidUrl(click.referrer) && (
                          <span className="text-xs text-slate-500">
                            • from {new URL(click.referrer).hostname}
                          </span>
                        )}
                        {click.referrer && !isValidUrl(click.referrer) && (
                          <span className="text-xs text-slate-500">
                            • {click.referrer}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(click.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No recent clicks</p>
          )}
        </div>
      </ScrollArea>
    </DashboardCard>
  );
};
