import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, TrendingUp, DollarSign, Database, Loader2, AlertCircle, BarChart3, MousePointer, Link2, Users } from "lucide-react";

const API_URL = "https://r0srse2nv0.execute-api.us-east-1.amazonaws.com";

// Type definitions
interface Service {
  name: string;
  status: "live" | "planned";
  description: string;
}

interface UrlLink {
  shortUrl: string;
  longUrl: string;
  title: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
}

interface SystemStatusProps {
  cost: string;
  uptime: string;
}

interface UrlShortenerProps {
  links: UrlLink[];
}

interface ServiceStatusProps {
  services: Service[];
}

interface ApiEndpointsProps {
  endpoints: Endpoint[];
}

interface MetricCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
}

interface AnalyticsData {
  success: boolean;
  url_stats: {
    [key: string]: {
      count: number;
      last_click: string;
    };
  };
  total_clicks: number;
  unique_urls: number;
  timestamp: string;
}

// Mock component placeholders (replace with real components)
const SystemStatus = ({ cost, uptime }: SystemStatusProps) => (
  <div className="glass-card p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-slate-400">Uptime:</span>
        <span className="text-green-400 font-semibold">{uptime}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">Monthly Cost:</span>
        <span className="text-blue-400 font-semibold">{cost}</span>
      </div>
    </div>
  </div>
);

const UrlShortener = ({ links }: UrlShortenerProps) => (
  <div className="glass-card p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {links.slice(0, 6).map((link) => (
        <a
          key={link.shortUrl}
          href={link.longUrl}
          className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-center text-sm font-medium text-slate-200 transition-colors duration-200"
        >
          {link.title}
        </a>
      ))}
    </div>
  </div>
);

const ServiceStatus = ({ services }: ServiceStatusProps) => (
  <div className="glass-card p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
    <div className="space-y-3">
      {services.map((service) => (
        <div key={service.name} className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{service.name}</p>
            <p className="text-xs text-slate-400">{service.description}</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

const ApiEndpoints = ({ endpoints }: ApiEndpointsProps) => (
  <div className="glass-card p-6 rounded-xl border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">API Docs</h3>
    <div className="space-y-2">
      {endpoints.slice(0, 5).map((endpoint) => (
        <div key={endpoint.path} className="flex items-start gap-3">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-mono rounded">
            {endpoint.method}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-mono text-sm truncate">{endpoint.path}</p>
            <p className="text-xs text-slate-400">{endpoint.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Updated AnalyticsDashboard with real data
const AnalyticsDashboard = ({ analyticsData }: { analyticsData?: AnalyticsData }) => {
  if (!analyticsData) {
    return (
      <div className="glass-card p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
        <p className="text-slate-400 text-sm">Loading analytics data...</p>
      </div>
    );
  }

  const topUrls = Object.entries(analyticsData.url_stats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="glass-card p-6 rounded-xl border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Analytics Overview
      </h3>
      
      {/* Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <MousePointer className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{analyticsData.total_clicks}</div>
          <div className="text-xs text-slate-400">Total Clicks</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Link2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{analyticsData.unique_urls}</div>
          <div className="text-xs text-slate-400">Tracked URLs</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{Object.keys(analyticsData.url_stats).length}</div>
          <div className="text-xs text-slate-400">Active Links</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(analyticsData.total_clicks / Math.max(analyticsData.unique_urls, 1))}
          </div>
          <div className="text-xs text-slate-400">Avg. per URL</div>
        </div>
      </div>

      {/* Top Performing URLs */}
      <div>
        <h4 className="text-md font-semibold text-white mb-4">Top Performing Links</h4>
        <div className="space-y-3">
          {topUrls.map(([url, stats]) => (
            <div key={url} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-300 text-sm font-bold">{stats.count}</span>
                </div>
                <div>
                  <p className="text-white font-medium capitalize">{url}</p>
                  <p className="text-xs text-slate-400">
                    Last click: {new Date(stats.last_click).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 text-sm font-semibold">{stats.count} clicks</div>
                <div className="text-xs text-slate-400">
                  {Math.round((stats.count / analyticsData.total_clicks) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Last updated: {new Date(analyticsData.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, color }: MetricCardProps) => (
  <div className="glass-card p-4 rounded-lg border border-slate-700/50 flex items-center gap-4 hover:border-slate-600/50 transition-colors">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// Hero Header Component
const HeroHeader = () => (
  <div className="relative mb-12 overflow-hidden">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
    
    {/* Content */}
    <div className="relative py-12 text-center">
      <div className="mb-4 inline-block">
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
          ✨ Serverless Cloud Platform
        </div>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
        🚀 Tshepo's Homelab
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 mb-2">
        Personal cloud platform powered by AWS Lambda & DynamoDB
      </p>
      
      <div className="text-sm text-slate-500">
        Running since Nov 2025 • Uptime monitoring active
      </div>
    </div>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
      <p className="text-slate-300 text-lg">Loading dashboard...</p>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="glass-card border-red-500/30 max-w-lg p-6 rounded-xl border">
      <AlertCircle className="h-5 w-5 text-red-400 inline mr-2" />
      <span className="text-slate-300">
        Failed to load dashboard data. Please try again later.
      </span>
    </div>
  </div>
);

// Main Component
const Index = () => {
  const { data: linksData, isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/links`);
      if (!response.ok) throw new Error("Failed to fetch links");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/analytics/urls`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    refetchInterval: 15000, // Refresh analytics more frequently
  });

  // Static data (fallbacks)
  const staticSystemStatus = {
    cost: "$2-5/month",
    uptime: "99.95%",
  };

  const staticServices: Service[] = [
    { name: "URL Shortener", status: "live", description: "Personal link management" },
    { name: "System Monitor", status: "live", description: "Real-time homelab metrics" },
    { name: "DynamoDB Analytics", status: "live", description: "Click tracking & analytics" },
  ];

  const staticEndpoints: Endpoint[] = [
    { method: "GET", path: "/", description: "API information" },
    { method: "GET", path: "/status", description: "System status & metrics" },
    { method: "GET", path: "/links", description: "All available short URLs" },
    { method: "GET", path: "/test-dynamodb", description: "Test DynamoDB connection" },
    { method: "GET", path: "/analytics/clicks", description: "Get click analytics" },
  ];

  const staticUrlLinks: UrlLink[] = [
    { shortUrl: "github", longUrl: `${API_URL}/go/github`, title: "GitHub" },
    { shortUrl: "linkedin", longUrl: `${API_URL}/go/linkedin`, title: "LinkedIn" },
    { shortUrl: "twitter", longUrl: `${API_URL}/go/twitter`, title: "Twitter" },
    { shortUrl: "email", longUrl: `${API_URL}/go/email`, title: "Email Me" },
    { shortUrl: "resume", longUrl: `${API_URL}/go/resume`, title: "Resume" },
    { shortUrl: "portfolio", longUrl: `${API_URL}/go/portfolio`, title: "Portfolio" },
  ];

  // Transform API data
  const urlLinks = linksData?.available_short_urls 
    ? Object.entries(linksData.available_short_urls).map(([shortUrl, longUrl]) => ({
        shortUrl,
        longUrl: `${API_URL}/go/${shortUrl}`,
        title: shortUrl.charAt(0).toUpperCase() + shortUrl.slice(1)
      }))
    : staticUrlLinks;

  if (linksLoading || analyticsLoading) {
    return <LoadingState />;
  }

  if (linksError || analyticsError) {
    return <ErrorState error={linksError || analyticsError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <HeroHeader />

        {/* Top Metrics Bar - Updated with real analytics data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <MetricCard 
            icon={Zap} 
            label="Uptime" 
            value="99.95%" 
            color="bg-green-500/20 text-green-400"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Total Clicks" 
            value={analyticsData?.total_clicks?.toString() || "0"} 
            color="bg-blue-500/20 text-blue-400"
          />
          <MetricCard 
            icon={DollarSign} 
            label="Monthly Cost" 
            value="$2-5" 
            color="bg-purple-500/20 text-purple-400"
          />
          <MetricCard 
            icon={Database} 
            label="Tracked URLs" 
            value={analyticsData?.unique_urls?.toString() || "0"} 
            color="bg-pink-500/20 text-pink-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="space-y-8">
          {/* URL Shortener - Full Width */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Quick Links
            </h2>
            <UrlShortener links={urlLinks} />
          </div>

          {/* Analytics Dashboard - Now with real data */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span> Analytics
            </h2>
            <AnalyticsDashboard analyticsData={analyticsData} />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Monitoring
              </h2>
              <SystemStatus cost={staticSystemStatus.cost} uptime={staticSystemStatus.uptime} />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Services
              </h2>
              <ServiceStatus services={staticServices} />
            </div>
          </div>

          {/* API Documentation */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span> API Documentation
            </h2>
            <ApiEndpoints endpoints={staticEndpoints} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-slate-800/50 pt-8">
          <p className="text-slate-500 text-sm">
            Last updated: {new Date().toLocaleTimeString()} • Built with AWS Lambda, API Gateway & DynamoDB
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;