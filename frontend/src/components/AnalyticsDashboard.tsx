import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalyticsCards } from "./AnalyticsCards";
import { ClickChart } from "./ClickChart";
import { UrlStats } from "./UrlStats";
import { RecentClicks } from "./RecentClicks";

const API_BASE = "https://r0srse2nv0.execute-api.us-east-1.amazonaws.com";

export interface Click {
  timestamp: string;
  short_url: string;
  user_agent: string;
  referrer?: string;
}

export interface ClicksResponse {
  total_clicks: number;
  clicks: Click[];
}

export interface UrlStatsResponse {
  url_stats: Record<string, { count: number; last_click: string }>;
  total_clicks: number;
  unique_urls: number;
}

export const AnalyticsDashboard = () => {
  const { data: clicksData, isLoading: clicksLoading, error: clicksError } = useQuery<ClicksResponse>({
    queryKey: ["analytics-clicks"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analytics/clicks`);
      if (!response.ok) throw new Error("Failed to fetch clicks");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: urlsData, isLoading: urlsLoading, error: urlsError } = useQuery<UrlStatsResponse>({
    queryKey: ["analytics-urls"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analytics/urls`);
      if (!response.ok) throw new Error("Failed to fetch URL stats");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const isLoading = clicksLoading || urlsLoading;
  const error = clicksError || urlsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
          <p className="text-slate-300 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="glass-card border-red-500/30">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <AlertDescription className="text-slate-300 ml-2">
          Failed to load analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-slate-400">Track your URL shortener performance</p>
      </div>

      <AnalyticsCards clicksData={clicksData} urlsData={urlsData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClickChart clicks={clicksData?.clicks || []} />
        <UrlStats urlStats={urlsData?.url_stats || {}} />
      </div>

      <RecentClicks clicks={clicksData?.clicks || []} />
    </div>
  );
};
