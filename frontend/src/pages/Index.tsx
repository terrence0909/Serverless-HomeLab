import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Zap, TrendingUp, DollarSign, Database, Loader2, AlertCircle, 
  BarChart3, MousePointer, Link2, Users, Plus, Calendar,
  Download, Filter, Trash2, Edit3
} from "lucide-react";

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
  isCustom?: boolean;
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
  onEdit?: (link: UrlLink) => void;
  onDelete?: (shortUrl: string) => void;
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

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  editingUrl?: UrlLink | null;
}

interface TimeRange {
  label: string;
  value: string;
}

// Create URL Modal Component
const CreateUrlModal = ({ isOpen, onClose, onCreated, editingUrl }: CreateUrlModalProps) => {
  const [shortUrl, setShortUrl] = useState(editingUrl?.shortUrl || "");
  const [longUrl, setLongUrl] = useState(editingUrl?.longUrl || "");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (urlData: { shortUrl: string; longUrl: string }) => {
      const response = await fetch(`${API_URL}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(urlData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create URL");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      setShortUrl("");
      setLongUrl("");
      onCreated();
      onClose();
    },
  });

  const handleCreate = () => {
    if (!shortUrl || !longUrl) return;
    createMutation.mutate({ shortUrl, longUrl });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-xl border border-slate-700/50 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editingUrl ? "Edit Short URL" : "Create Short URL"}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Short Code</label>
            <input
              type="text"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="my-project"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              disabled={!!editingUrl}
            />
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Destination URL</label>
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !shortUrl || !longUrl}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {editingUrl ? "Update" : "Create"}
          </button>
        </div>

        {createMutation.isError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              Error: {createMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// System Status Component
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

// Enhanced UrlShortener with management options
const UrlShortener = ({ links, onEdit, onDelete }: UrlShortenerProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedLinks = showAll ? links : links.slice(0, 6);

  return (
    <div className="glass-card p-6 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
        {links.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${links.length})`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayedLinks.map((link) => (
          <div key={link.shortUrl} className="relative group">
            <a
              href={link.longUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-center text-sm font-medium text-slate-200 transition-colors duration-200"
            >
              {link.title}
              {link.isCustom && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
              )}
            </a>
            {link.isCustom && onEdit && onDelete && (
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(link);
                  }}
                  className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(link.shortUrl);
                  }}
                  className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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
          <div className={`w-2 h-2 rounded-full ${
            service.status === "live" ? "bg-green-400" : "bg-yellow-400"
          }`}></div>
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

// Enhanced AnalyticsDashboard with matching filter style
const AnalyticsDashboard = ({ 
  analyticsData, 
  timeRange, 
  setTimeRange,
  timeRanges 
}: {
  analyticsData?: AnalyticsData;
  timeRange: string;
  setTimeRange: (range: string) => void;
  timeRanges: TimeRange[];
}) => {
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
    .slice(0, 10);

  const handleExport = () => {
    const headers = ["URL", "Clicks", "Last Click", "Percentage"];
    const csvContent = [
      headers.join(","),
      ...topUrls.map(([url, stats]) => [
        url,
        stats.count,
        new Date(stats.last_click).toISOString(),
        `${Math.round((stats.count / analyticsData.total_clicks) * 100)}%`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-slate-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Overview
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Updated Time Range Filter - matches Export button style */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors">
            <Filter className="w-4 h-4" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none text-sm text-blue-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-slate-800 text-white">
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={topUrls.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>
      </div>
      
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

      <div className="bg-slate-800/30 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-4">
          Top Performing URLs ({timeRanges.find(r => r.value === timeRange)?.label})
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topUrls.map(([url, stats]) => (
            <div key={url} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-300 text-sm font-bold">{stats.count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium capitalize truncate">{url}</p>
                  <p className="text-xs text-slate-400">
                    Last click: {new Date(stats.last_click).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-green-400 text-sm font-semibold">{stats.count} clicks</div>
                <div className="text-xs text-slate-400">
                  {Math.round((stats.count / analyticsData.total_clicks) * 100)}%
                </div>
              </div>
            </div>
          ))}
          {topUrls.length === 0 && (
            <p className="text-slate-400 text-center py-4">No analytics data available</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Last updated: {new Date(analyticsData.timestamp).toLocaleString()} • 
          Time range: {timeRanges.find(r => r.value === timeRange)?.label}
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
const HeroHeader = ({ onAddClick }: { onAddClick: () => void }) => (
  <div className="relative mb-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
    
    <div className="relative py-12 text-center">
      <div className="mb-4 inline-block">
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
          ✨ Serverless Cloud Platform
        </div>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
        🚀 Tshepo's Homelab
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 mb-6">
        Personal cloud platform powered by AWS Lambda & DynamoDB
      </p>
      
      <button
        onClick={onAddClick}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        Add New Short URL
      </button>
      
      <div className="text-sm text-slate-500 mt-4">
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlLink | null>(null);
  const [timeRange, setTimeRange] = useState("all");
  const queryClient = useQueryClient();

  const timeRanges: TimeRange[] = [
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

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
    queryKey: ["analytics", timeRange],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/analytics/urls`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Static data
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

  // Transform API data - separate system URLs from custom URLs
  const systemLinks = staticUrlLinks;
  const customLinks = linksData?.available_short_urls 
    ? Object.entries(linksData.available_short_urls)
        .filter(([shortUrl]) => !staticUrlLinks.find(link => link.shortUrl === shortUrl))
        .map(([shortUrl, longUrl]) => ({
          shortUrl,
          longUrl: `${API_URL}/go/${shortUrl}`,
          title: shortUrl.charAt(0).toUpperCase() + shortUrl.slice(1),
          isCustom: true
        }))
    : [];

  const allLinks = [...systemLinks, ...customLinks];

  const handleEditUrl = (link: UrlLink) => {
    setEditingUrl(link);
    setIsCreateModalOpen(true);
  };

  const handleDeleteUrl = async (shortUrl: string) => {
    if (window.confirm(`Are you sure you want to delete ${shortUrl}?`)) {
      // TODO: Implement delete functionality in Lambda
      console.log("Delete URL:", shortUrl);
      // For now, just refetch links
      queryClient.invalidateQueries({ queryKey: ["links"] });
    }
  };

  const handleUrlCreated = () => {
    setEditingUrl(null);
    queryClient.invalidateQueries({ queryKey: ["links"] });
  };

  if (linksLoading || analyticsLoading) {
    return <LoadingState />;
  }

  if (linksError || analyticsError) {
    return <ErrorState error={linksError || analyticsError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeroHeader onAddClick={() => {
          setEditingUrl(null);
          setIsCreateModalOpen(true);
        }} />

        <CreateUrlModal 
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingUrl(null);
          }}
          onCreated={handleUrlCreated}
          editingUrl={editingUrl}
        />

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

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Quick Links
              {customLinks.length > 0 && (
                <span className="text-sm text-slate-400 ml-2">
                  ({systemLinks.length} system, {customLinks.length} custom)
                </span>
              )}
            </h2>
            <UrlShortener 
              links={allLinks} 
              onEdit={handleEditUrl}
              onDelete={handleDeleteUrl}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span> Analytics
            </h2>
            <AnalyticsDashboard 
              analyticsData={analyticsData} 
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              timeRanges={timeRanges}
            />
          </div>

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

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span> API Documentation
            </h2>
            <ApiEndpoints endpoints={staticEndpoints} />
          </div>
        </div>

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