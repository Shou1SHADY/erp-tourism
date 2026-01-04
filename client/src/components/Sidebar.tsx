import { Link, useLocation } from "wouter";
import { LayoutDashboard, Compass, Users, CreditCard, CalendarDays, Settings, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tours', href: '/tours', icon: Compass },
  { name: 'Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const [location] = useLocation();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className={cn(
      "flex h-screen flex-col justify-between w-64 bg-gradient-to-b from-card via-card to-card/95",
      "border-r border-border/40",
      className
    )}>
      <div className="px-5 py-6">
        {/* Logo */}
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-display tracking-tight text-foreground leading-none">
              Wanderlust
            </span>
            <span className="text-xs font-medium text-primary tracking-widest">
              ERP SYSTEM
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {navigation.map((item, index) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                <item.icon className={cn(
                  "h-4.5 w-4.5 transition-colors duration-200",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Dashboard' && (
                  <Sparkles className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    isActive ? "text-white/70" : "text-primary/50"
                  )} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border/30">
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 mb-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Pro Tip:</span> Use keyboard shortcuts for faster navigation.
          </p>
        </div>
        <button className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-sm font-medium group">
          <LogOut className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
