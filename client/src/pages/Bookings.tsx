import { useState } from "react";
import { useBookings, useCreateBooking } from "@/hooks/use-bookings";
import { useTours } from "@/hooks/use-tours";
import { useCustomers } from "@/hooks/use-customers";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreHorizontal, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredBookings = bookings?.filter(b => 
    b.id.toString().includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Bookings" description="Manage reservations and travel schedules">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9" 
            />
          </div>
          <CreateBookingDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Tour ID</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading bookings...</TableCell>
              </TableRow>
            ) : filteredBookings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No bookings found</TableCell>
              </TableRow>
            ) : (
              filteredBookings?.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell className="text-primary font-medium">#{booking.tourId}</TableCell>
                  <TableCell>#{booking.customerId}</TableCell>
                  <TableCell>{format(new Date(booking.travelDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{booking.headCount || 0}</TableCell>
                  <TableCell>${(booking.totalAmount / 100).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 no-default-hover-elevate">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          toast({ title: "View Booking", description: `Viewing details for booking #${booking.id}` });
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast({ title: "Edit Booking", description: "Edit functionality coming soon" });
                        }}>
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            toast({ title: "Status Update", description: "Booking status updated to Cancelled" });
                          }}
                        >
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateBookingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: tours } = useTours();
  const { data: customers } = useCustomers();

  const form = useForm<z.infer<typeof insertBookingSchema>>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      headCount: 1,
      totalAmount: 0,
      status: "pending",
      notes: ""
    }
  });

  const onSubmit = (data: z.infer<typeof insertBookingSchema>) => {
    createBooking.mutate(data, {
      onSuccess: () => {
        toast({ title: "Booking Created", description: "The reservation has been confirmed." });
        onOpenChange(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  // Auto-calculate price when tour or headcount changes
  const handleTourChange = (tourId: string) => {
    const tour = tours?.find(t => t.id === parseInt(tourId));
    if (tour) {
      const headCount = form.getValues('headCount');
      form.setValue('totalAmount', tour.basePrice * headCount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Booking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Tour</FormLabel>
                    <Select onValueChange={(val) => { field.onChange(parseInt(val)); handleTourChange(val); }}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tour" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tours?.map(tour => (
                          <SelectItem key={tour.id} value={tour.id.toString()}>{tour.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travelers</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => {
                      field.onChange(parseInt(e.target.value));
                      // Recalc total
                      const tourId = form.getValues('tourId');
                      const tour = tours?.find(t => t.id === tourId);
                      if (tour) form.setValue('totalAmount', tour.basePrice * parseInt(e.target.value));
                    }} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (Cents)</FormLabel>
                  <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createBooking.isPending} className="w-full">
              {createBooking.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
