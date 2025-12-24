import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Lock, BarChart3, Users, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Header */}
      <header className="relative z-10 h-16 border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Nexus</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              Trusted by 10,000+ teams worldwide
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight">
              Your business,
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                beautifully managed
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform to track performance, manage teams, and grow your business with powerful analytics and beautiful dashboards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="gradient-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all gap-2 px-8 h-14 text-base rounded-xl"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-8 h-14 text-base rounded-xl border-border/50 hover:bg-secondary"
              >
                Watch demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 pt-8 text-muted-foreground">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-accent/20"
                  />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">1,200+</span> teams onboarded this month
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Real-time updates and instant insights with sub-second response times.",
                gradient: "from-primary/10 to-primary/5",
                iconColor: "text-primary",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade encryption and compliance with SOC2, GDPR, and HIPAA.",
                gradient: "from-accent/10 to-accent/5",
                iconColor: "text-accent",
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description: "AI-powered insights that help you make better decisions faster.",
                gradient: "from-success/10 to-success/5",
                iconColor: "text-success",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-8 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 animate-fade-in cursor-pointer`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Nexus</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Nexus Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
