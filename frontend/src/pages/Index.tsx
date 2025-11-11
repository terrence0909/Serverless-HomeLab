import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { SystemStatus } from "@/components/SystemStatus";
import { UrlShortener } from "@/components/UrlShortener";
import { ServiceStatus } from "@/components/ServiceStatus";
import { ApiEndpoints } from "@/components/ApiEndpoints";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Update this URL to your new API Gateway endpoint
const API_URL = "https://r0srse2nv0.execute-api.us-east-1.amazonaws.com";

const Index = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
          <p className="text-slate-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="glass-card border-red-500/30 max-w-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-slate-300 ml-2">
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Transform your API response to match your component expectations
  const systemStatus = {
    cost: data?.architecture?.cost || "$2-5/month",
    uptime: data?.performance?.availability || "99.95%",
  };

  // Transform short URLs to match your UrlShortener component
  const urlLinks = data?.available_short_urls 
    ? Object.entries(data.available_short_urls).map(([shortUrl, longUrl]) => ({
        shortUrl: shortUrl,
        longUrl: `${API_URL}/go/${shortUrl}`,
        title: shortUrl.charAt(0).toUpperCase() + shortUrl.slice(1) // "github" -> "GitHub"
      }))
    : [
        { shortUrl: "github", longUrl: "https://github.com", title: "GitHub" },
        { shortUrl: "linkedin", longUrl: "https://linkedin.com", title: "LinkedIn" },
      ];

  // Transform services data
  const services = data?.homelab_services 
    ? data.homelab_services.map(service => ({
        name: service.name.replace(/[🔗📊🗄️📧📁]/g, '').trim(), // Remove emojis
        status: service.status.includes("🟢") ? "live" : 
                service.status.includes("🟡") ? "planned" : "down",
        description: service.description
      }))
    : [
        { name: "URL Shortener", status: "live", description: "Personal link management" },
        { name: "System Monitor", status: "live", description: "Real-time homelab metrics" },
        { name: "DynamoDB Analytics", status: "live", description: "Click tracking & analytics" },
      ];

  // Transform endpoints
  const endpoints = data?.endpoints
    ? Object.entries(data.endpoints).map(([methodPath, description]) => {
        const [method, path] = methodPath.split(" ");
        return {
          method: method,
          path: path,
          description: description as string,
        };
      })
    : [
        { method: "GET", path: "/", description: "API information" },
        { method: "GET", path: "/status", description: "System status & metrics" },
        { method: "GET", path: "/links", description: "All available short URLs" },
        { method: "GET", path: "/tools", description: "Available homelab tools" },
        { method: "GET", path: "/test-dynamodb", description: "Test DynamoDB connection" },
      ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Updated to use your API data */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            {data?.message || "Homelab Dashboard"}
          </h1>
          <p className="text-slate-400 text-lg">
            {data?.description || "Monitor your infrastructure at a glance"}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SystemStatus 
            cost={systemStatus.cost} 
            uptime={systemStatus.uptime} 
          />
          <UrlShortener links={urlLinks} />
          <ServiceStatus services={services} />
          <ApiEndpoints endpoints={endpoints} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;