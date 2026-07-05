import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalytics, getRevenueAnalytics } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    { label: "Total Revenue", value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}` },
    { label: "Total Orders", value: analytics?.totalOrders ?? 0 },
    { label: "Total Products", value: analytics?.totalProducts ?? 0 },
    { label: "Total Users", value: analytics?.totalUsers ?? 0 },
  ];

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}