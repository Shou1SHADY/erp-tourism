import { useTours } from "@/hooks/use-tours";
import { useBookings } from "@/hooks/use-bookings";
import { useCustomers } from "@/hooks/use-customers";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Users, CalendarCheck, Banknote, Map, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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
    { name: 'Mon', total: 1200 },
    { name: 'Tue', total: 2100 },
    { name: 'Wed', total: 1800 },
    { name: 'Thu', total: 2400 },
    { name: 'Fri', total: 3200 },
    { name: 'Sat', total: 4500 },
    { name: 'Sun', total: 3800 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Dashboard" description="Overview of your tourism business">
        <Button onClick={handleExport} className="gap-2">
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </PageHeader>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Revenue Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Recent Bookings</h3>
          </div>
          <div className="space-y-4">
            {bookings?.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    #{booking.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{format(new Date(booking.travelDate), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-muted-foreground truncate">{booking.headCount} Travelers</p>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
            {!bookings?.length && (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent bookings</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
