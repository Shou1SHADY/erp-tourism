import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Compass } from "lucide-react";
import { useState } from "react";

import Dashboard from "@/pages/Dashboard";
import Tours from "@/pages/Tours";
import Bookings from "@/pages/Bookings";
import Customers from "@/pages/Customers";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tours" component={Tours} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/customers" component={Customers} />
      <Route path="/payments" component={Payments} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [open, setOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar className="fixed left-0 top-0" />
          </div>

          <main className="flex-1 lg:ml-64 min-w-0">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-display tracking-tight text-foreground">
                  Wanderlust<span className="text-primary">ERP</span>
                </span>
              </div>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar onClose={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            </header>

            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              <Router />
            </div>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
