import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, UserPlus, ShoppingCart, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    user: "Sarah Chen",
    action: "completed project milestone",
    time: "2 min ago",
    icon: CheckCircle2,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    id: 2,
    user: "Marcus Johnson",
    action: "added new team member",
    time: "15 min ago",
    icon: UserPlus,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "created invoice #1234",
    time: "1 hour ago",
    icon: FileText,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    id: 4,
    user: "Alex Thompson",
    action: "processed new order",
    time: "2 hours ago",
    icon: ShoppingCart,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    id: 5,
    user: "Jordan Lee",
    action: "sent client message",
    time: "3 hours ago",
    icon: MessageSquare,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
];

const ActivityFeed = () => {
  return (
    <Card className="shadow-card border-border/50 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </div>
          <button className="text-sm text-primary hover:underline font-medium">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer animate-fade-in"
            )}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                  {activity.user.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 p-1 rounded-full",
                  activity.iconBg
                )}
              >
                <activity.icon className={cn("w-2.5 h-2.5", activity.iconColor)} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
