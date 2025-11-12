import { MousePointerClick, TrendingUp, Link2, Award } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { ClicksResponse, UrlStatsResponse } from "./AnalyticsDashboard";

interface AnalyticsCardsProps {
  clicksData?: ClicksResponse;
  urlsData?: UrlStatsResponse;
}

export const AnalyticsCards = ({ clicksData, urlsData }: AnalyticsCardsProps) => {
  const totalClicks = clicksData?.total_clicks || 0;
  
  const todayClicks = clicksData?.clicks.filter((click) => {
    const clickDate = new Date(click.timestamp);
    const today = new Date();
    return clickDate.toDateString() === today.toDateString();
  }).length || 0;

  const uniqueUrls = urlsData?.unique_urls || 0;

  const mostPopularUrl = urlsData?.url_stats
    ? Object.entries(urlsData.url_stats).sort(([, a], [, b]) => b.count - a.count)[0]
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard title="Total Clicks" icon={<MousePointerClick className="w-5 h-5" />}>
        <div className="text-4xl font-bold text-white">{totalClicks.toLocaleString()}</div>
        <p className="text-slate-400 text-sm mt-1">All-time clicks</p>
      </DashboardCard>

      <DashboardCard title="Today's Clicks" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="text-4xl font-bold text-blue-400">{todayClicks.toLocaleString()}</div>
        <p className="text-slate-400 text-sm mt-1">Last 24 hours</p>
      </DashboardCard>

      <DashboardCard title="Unique URLs" icon={<Link2 className="w-5 h-5" />}>
        <div className="text-4xl font-bold text-green-400">{uniqueUrls}</div>
        <p className="text-slate-400 text-sm mt-1">Active short links</p>
      </DashboardCard>

      <DashboardCard title="Most Popular" icon={<Award className="w-5 h-5" />}>
        {mostPopularUrl ? (
          <>
            <div className="text-2xl font-bold text-purple-400 truncate">
              /{mostPopularUrl[0]}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {mostPopularUrl[1].count} clicks
            </p>
          </>
        ) : (
          <p className="text-slate-400">No data</p>
        )}
      </DashboardCard>
    </div>
  );
};
