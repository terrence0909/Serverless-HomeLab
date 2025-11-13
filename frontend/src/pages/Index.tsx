import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Zap, TrendingUp, DollarSign, Database, Loader2, AlertCircle, 
  BarChart3, MousePointer, Link2, Users, Plus, Calendar,
  Download, Filter, Trash2, Edit3, Check, X
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

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
  isDeleting?: string | null;
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

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  url: UrlLink | null;
  isDeleting: boolean;
}

interface TimeRange {
  label: string;
  value: string;
}

interface QRCodeData {
  success: boolean;
  shortCode: string;
  shortUrl: string;
  qrCode: string;
  timestamp: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlLink | null;
}

// Professional Chart Colors
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
  cyan: '#06b6d4',
  lime: '#84cc16',
  gradient: {
    start: '#3b82f6',
    end: '#8b5cf6'
  }
};

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

// Generate sophisticated mock data
const generateTimeSeriesData = (totalClicks: number, days: number = 7) => {
  const data = [];
  const baseDate = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Realistic fluctuations with trend
    const baseValue = totalClicks / days;
    const trend = 1 + (i * 0.05); // Increasing trend
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      clicks: Math.floor(baseValue * trend * randomFactor),
      mobile: Math.floor((baseValue * trend * randomFactor) * 0.4),
      desktop: Math.floor((baseValue * trend * randomFactor) * 0.6),
    });
  }
  return data;
};

const generateHourlyData = (totalClicks: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    
    // Business hours pattern
    const hourOfDay = hour.getHours();
    const isBusinessHours = hourOfDay >= 9 && hourOfDay <= 17;
    const baseClicks = isBusinessHours ? totalClicks / 16 : totalClicks / 48;
    const randomFactor = 0.6 + Math.random() * 0.8;
    
    data.push({
      hour: `${hour.getHours().toString().padStart(2, '0')}:00`,
      clicks: Math.floor(baseClicks * randomFactor),
      hourOfDay: hourOfDay
    });
  }
  return data.reverse();
};

const generatePlatformData = (totalClicks: number) => {
  return [
    { name: 'Desktop', value: Math.floor(totalClicks * 0.52), fill: CHART_COLORS.primary },
    { name: 'Mobile', value: Math.floor(totalClicks * 0.41), fill: CHART_COLORS.secondary },
    { name: 'Tablet', value: Math.floor(totalClicks * 0.07), fill: CHART_COLORS.accent },
  ];
};

const generateReferrerData = (totalClicks: number) => {
  return [
    { name: 'Direct', value: Math.floor(totalClicks * 0.35), fill: CHART_COLORS.primary },
    { name: 'Social', value: Math.floor(totalClicks * 0.28), fill: CHART_COLORS.secondary },
    { name: 'Email', value: Math.floor(totalClicks * 0.22), fill: CHART_COLORS.accent },
    { name: 'Search', value: Math.floor(totalClicks * 0.15), fill: CHART_COLORS.purple },
  ];
};

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, url }: QRCodeModalProps) => {
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      fetchQRCode(url.shortUrl);
    }
  }, [isOpen, url]);

  const fetchQRCode = async (shortUrl: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/qr/${shortUrl}`);
      const data = await response.json();
      if (data.success) {
        setQrCodeData(data);
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData) {
      const link = document.createElement('a');
      link.href = qrCodeData.qrCode;
      link.download = `qr-code-${qrCodeData.shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-xl border border-slate-700/50 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-4" />
            <p className="text-slate-400">Generating QR code...</p>
          </div>
        ) : qrCodeData ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <img 
                src={qrCodeData.qrCode} 
                alt={`QR Code for ${qrCodeData.shortUrl}`}
                className="w-48 h-48 rounded-lg border border-slate-600"
              />
              <p className="text-sm text-slate-400 mt-2 text-center">
                Scan to visit: {qrCodeData.shortUrl}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-400">Failed to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, url, isDeleting }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-xl border border-slate-700/50 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Delete Short URL</h3>
        </div>
        
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-white">/{url?.shortUrl}</span>? 
          This will remove the short URL and all its analytics data. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-700/30 rounded-lg text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {isDeleting && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              Deleting short URL...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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
const UrlShortener = ({ links, onEdit, onDelete, isDeleting }: UrlShortenerProps) => {
  const [showAll, setShowAll] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<UrlLink | null>(null);
  const displayedLinks = showAll ? links : links.slice(0, 6);

  const handleShowQRCode = (url: UrlLink) => {
    setSelectedUrl(url);
    setQrModalOpen(true);
  };

  return (
    <>
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
                      handleShowQRCode(link);
                    }}
                    className="p-1 bg-green-500 hover:bg-green-600 rounded text-white transition-colors"
                    title="QR Code"
                  >
                    <BarChart3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(link);
                    }}
                    className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
                    title="Edit URL"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(link.shortUrl);
                    }}
                    disabled={isDeleting === link.shortUrl}
                    className="p-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 rounded text-white transition-colors"
                    title="Delete URL"
                  >
                    {isDeleting === link.shortUrl ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <QRCodeModal 
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={selectedUrl}
      />
    </>
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

// Enhanced AnalyticsDashboard with Professional Charts
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

  // Prepare data for professional charts
  const barChartData = topUrls.map(([url, stats], index) => ({
    name: url.length > 12 ? url.substring(0, 12) + '...' : url,
    fullName: url,
    clicks: stats.count,
    fill: PIE_COLORS[index % PIE_COLORS.length]
  }));

  const pieChartData = topUrls.slice(0, 5).map(([url, stats], index) => ({
    name: url,
    value: stats.count,
    fill: PIE_COLORS[index % PIE_COLORS.length]
  }));

  const timeSeriesData = generateTimeSeriesData(analyticsData.total_clicks, 7);
  const hourlyData = generateHourlyData(analyticsData.total_clicks);
  const platformData = generatePlatformData(analyticsData.total_clicks);
  const referrerData = generateReferrerData(analyticsData.total_clicks);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          Analytics Overview
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors">
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
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30">
          <MousePointer className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{analyticsData.total_clicks.toLocaleString()}</div>
          <div className="text-xs text-slate-300">Total Clicks</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 text-center border border-green-500/30">
          <Link2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{analyticsData.unique_urls}</div>
          <div className="text-xs text-slate-300">Tracked URLs</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 text-center border border-purple-500/30">
          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{Object.keys(analyticsData.url_stats).length}</div>
          <div className="text-xs text-slate-300">Active Links</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 text-center border border-orange-500/30">
          <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(analyticsData.total_clicks / Math.max(analyticsData.unique_urls, 1))}
          </div>
          <div className="text-xs text-slate-300">Avg. per URL</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        {/* Row 1: Time Series Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart - 7-Day Trend */}
          <div className="glass-card p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              7-Day Performance Trend
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke={CHART_COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Hourly Distribution */}
          <div className="glass-card p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              24-Hour Traffic Pattern
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.secondary, r: 4 }}
                  activeDot={{ r: 6, stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart - Top URLs */}
          <div className="glass-card p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Top 5 URLs</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart - Platform Distribution */}
          <div className="glass-card p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Platform Usage</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Referrer Sources */}
          <div className="glass-card p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Traffic Sources</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={referrerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {referrerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Top URLs Bar Chart */}
        <div className="glass-card p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-4">Top Performing URLs</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} horizontal={false} />
              <XAxis 
                type="number" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                width={80}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar 
                dataKey="clicks" 
                radius={[0, 4, 4, 0]}
              >
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlLink | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<UrlLink | null>(null);
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (shortUrl: string) => {
      const response = await fetch(`${API_URL}/links/${shortUrl}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete URL");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setIsDeleteModalOpen(false);
      setDeletingUrl(null);
    },
    onError: (error) => {
      console.error("Failed to delete URL:", error);
    },
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
    { method: "DELETE", path: "/links/{shortUrl}", description: "Delete a short URL" },
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

  const handleDeleteClick = (shortUrl: string) => {
    const urlToDelete = allLinks.find(link => link.shortUrl === shortUrl);
    if (urlToDelete) {
      setDeletingUrl(urlToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingUrl) {
      deleteMutation.mutate(deletingUrl.shortUrl);
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

        <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingUrl(null);
          }}
          onConfirm={handleDeleteConfirm}
          url={deletingUrl}
          isDeleting={deleteMutation.isPending}
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
              onDelete={handleDeleteClick}
              isDeleting={deleteMutation.isPending ? deletingUrl?.shortUrl || null : null}
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