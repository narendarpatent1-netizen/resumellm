import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Send, Calendar, FileText, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "New Project",
    description: "Start fresh",
    icon: Plus,
    gradient: "from-primary to-primary/80",
  },
  {
    label: "Upload Files",
    description: "Add documents",
    icon: Upload,
    gradient: "from-accent to-accent/80",
  },
  {
    label: "Send Invoice",
    description: "Bill clients",
    icon: Send,
    gradient: "from-success to-success/80",
  },
  {
    label: "Schedule",
    description: "Set meetings",
    icon: Calendar,
    gradient: "from-warning to-warning/80",
  },
];

const QuickActions = () => {
  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={action.label}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:shadow-soft animate-fade-in",
                "bg-gradient-to-br",
                action.gradient
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <action.icon className="w-6 h-6 text-white mb-3" />
              <p className="font-semibold text-white text-sm">{action.label}</p>
              <p className="text-white/70 text-xs mt-0.5">{action.description}</p>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
