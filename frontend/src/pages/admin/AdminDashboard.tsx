import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, ShoppingBag, Package, Users } from "lucide-react";
import { getAnalytics, getRevenueAnalytics } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import type { AdminAnalytics, RevenuePoint } from "@/types";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getRevenueAnalytics()])
      .then(([analyticsRes, revenueRes]) => {
        setAnalytics(analyticsRes.data.analytics ?? analyticsRes.data);

        const revenuePayload = revenueRes.data.revenue ?? revenueRes.data;
        setRevenue(Array.isArray(revenuePayload) ? revenuePayload : []);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner fullScreen />;

  const cards = [
    {
      label: "Total Revenue",
      value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    { label: "Total Orders", value: analytics?.totalOrders ?? 0, icon: ShoppingBag },
    { label: "Total Products", value: analytics?.totalProducts ?? 0, icon: Package },
    { label: "Total Users", value: analytics?.totalUsers ?? 0, icon: Users },
  ];

  return (
    <div className="container py-8">
      <AdminPageHeader title="Admin Dashboard" description="Store performance at a glance" />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No revenue data available yet.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 8px 24px rgba(17,24,39,0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}