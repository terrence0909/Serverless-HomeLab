import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardCard } from "./DashboardCard";
import { BarChart3 } from "lucide-react";
import { Click } from "./AnalyticsDashboard";

interface ClickChartProps {
  clicks: Click[];
}

export const ClickChart = ({ clicks }: ClickChartProps) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
    
    const clicksInHour = clicks.filter((click) => {
      const clickDate = new Date(click.timestamp);
      return (
        clickDate.getHours() === hour.getHours() &&
        clickDate.toDateString() === hour.toDateString()
      );
    }).length;

    return {
      hour: hour.getHours(),
      clicks: clicksInHour,
      label: `${hour.getHours()}:00`,
    };
  });

  return (
    <DashboardCard title="Clicks by Hour" icon={<BarChart3 className="w-5 h-5" />}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="label" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#f1f5f9',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="clicks" fill="#60a5fa" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};
