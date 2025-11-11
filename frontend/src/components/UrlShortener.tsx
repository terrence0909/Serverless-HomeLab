import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "./ui/button";

interface UrlLink {
  shortUrl: string;
  longUrl: string;
  title?: string;
}

interface UrlShortenerProps {
  links: UrlLink[];
}

export const UrlShortener = ({ links }: UrlShortenerProps) => {
  return (
    <DashboardCard title="URL Shortener" icon={<LinkIcon size={24} />}>
      <div className="space-y-3">
        {links.map((link, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            onClick={() => window.open(link.longUrl, '_blank')}
          >
            <div className="flex flex-col items-start gap-1 flex-1">
              <span className="text-white font-medium">{link.title || link.shortUrl}</span>
              <span className="text-xs text-slate-400 truncate max-w-full">{link.longUrl}</span>
            </div>
            <ExternalLink size={16} className="text-slate-400 ml-2 flex-shrink-0" />
          </Button>
        ))}
      </div>
    </DashboardCard>
  );
};
