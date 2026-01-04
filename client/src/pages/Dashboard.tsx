import { useTours } from "@/hooks/use-tours";
import { useBookings } from "@/hooks/use-bookings";
import { useCustomers } from "@/hooks/use-customers";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Users, CalendarCheck, Banknote, Map, FileDown, ArrowRight, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: tours } = useTours();
  const { data: bookings } = useBookings();
  const { data: customers } = useCustomers();

  const handleExport = () => {
    window.location.href = "/api/bookings/export";
  };

  const totalRevenue = bookings?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const activeBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;

  const chartData = [
    { name: 'Mon', total: 1200, bookings: 4 },
    { name: 'Tue', total: 2100, bookings: 7 },
    { name: 'Wed', total: 1800, bookings: 5 },
    { name: 'Thu', total: 2400, bookings: 8 },
    { name: 'Fri', total: 3200, bookings: 11 },
    { name: 'Sat', total: 4500, bookings: 15 },
    { name: 'Sun', total: 3800, bookings: 12 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Dashboard" description="Overview of your tourism business">
        <Button onClick={handleExport} className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Total Revenue"
          value={`$${(totalRevenue / 100).toLocaleString()}`}
          icon={Banknote}
          trend={{ value: 12.5, isPositive: true }}
          description="Total earnings this month"
        />
        <StatCard
          title="Active Bookings"
          value={String(activeBookings)}
          icon={CalendarCheck}
          trend={{ value: 4.2, isPositive: true }}
          description="Confirmed upcoming trips"
        />
        <StatCard
          title="Total Customers"
          value={String(customers?.length || 0)}
          icon={Users}
          trend={{ value: 8.1, isPositive: true }}
          description="Registered clients"
        />
        <StatCard
          title="Active Tours"
          value={String(tours?.filter(t => t.isActive).length || 0)}
          icon={Map}
          trend={{ value: 2.4, isPositive: false }}
          description="Tours currently available"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Revenue Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-semibold text-lg font-display">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Weekly performance metrics</p>
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last 7 days
            </Badge>
          </div>
          <div className="h-[280px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={50}
                />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-3 rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-lg font-display">Recent Bookings</h3>
              <p className="text-sm text-muted-foreground">Latest reservations</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary gap-1">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2">
            {bookings?.slice(0, 5).map((booking, index) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 transition-all duration-200 gap-3 group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    #{booking.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {format(new Date(booking.travelDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.headCount} Travelers • ${(booking.totalAmount / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] sm:text-xs font-medium ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
            {!bookings?.length && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarCheck className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent bookings</p>
                <p className="text-xs">Bookings will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
