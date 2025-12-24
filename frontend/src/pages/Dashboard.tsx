import DashboardSidebar from "@/components/DashboardSidebar";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import ActivityFeed from "@/components/ActivityFeed";
import QuickActions from "@/components/QuickActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
    gradient: "gradient-card-blue",
    iconColor: "hsl(221, 83%, 53%)",
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+15.3%",
    trend: "up" as const,
    icon: Users,
    gradient: "gradient-card-purple",
    iconColor: "hsl(262, 83%, 58%)",
  },
  {
    title: "Total Orders",
    value: "12,234",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
    gradient: "gradient-card-green",
    iconColor: "hsl(142, 76%, 36%)",
  },
  {
    title: "Conversion",
    value: "3.24%",
    change: "-2.4%",
    trend: "down" as const,
    icon: Activity,
    gradient: "gradient-card-orange",
    iconColor: "hsl(38, 92%, 50%)",
  },
];

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 glass sticky top-0 z-10">
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                className="pl-10 bg-secondary/50 border-transparent focus:border-primary/20 focus:bg-background transition-colors"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* User */}
              <button className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-secondary transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Alex Morgan</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    AM
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Welcome */}
          <div className="animate-fade-in">
            <h1 className="text-2xl font-display font-bold">
              Good morning, Alex 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                {...stat}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Charts and Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityFeed />
            
            {/* Top Products */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Top Products</h3>
              <p className="text-sm text-muted-foreground mb-4">Best performing items this month</p>
              
              <div className="space-y-4">
                {[
                  { name: "Premium Plan", sales: 1234, revenue: "$24,500", growth: 12 },
                  { name: "Enterprise Suite", sales: 856, revenue: "$42,800", growth: 8 },
                  { name: "Starter Pack", sales: 2341, revenue: "$11,705", growth: -3 },
                  { name: "Pro Features", sales: 543, revenue: "$16,290", growth: 24 },
                ].map((product, i) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 75}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center font-display font-bold text-sm text-primary">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.revenue}</p>
                      <p className={`text-xs ${product.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {product.growth > 0 ? '+' : ''}{product.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
