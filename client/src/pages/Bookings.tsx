import { useState, useMemo } from "react";
import { useBookings, useCreateBooking, useUpdateBooking } from "@/hooks/use-bookings";
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
import { Search, Plus, MoreHorizontal, FileDown, CalendarDays, User, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBookingSchema, type Booking } from "@shared/schema";
import { z } from "zod";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { toast } = useToast();
  const updateBooking = useUpdateBooking();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => b.id.toString().includes(search));
  }, [bookings, search]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    updateBooking.mutate({ id: booking.id, status: "cancelled" }, {
      onSuccess: () => {
        toast({ title: "Booking Cancelled", description: `Booking #${booking.id} has been cancelled.` });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleExport = () => {
    window.location.href = "/api/bookings/export";
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Bookings" description="Manage reservations and travel schedules">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleExport} variant="outline" className="gap-2 shadow-sm order-2 sm:order-1 flex-1 sm:flex-none">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <div className="relative flex-1 min-w-[200px] order-1 sm:order-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <CreateBookingDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
      </PageHeader>

      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading bookings...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No bookings found</TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/30 transition-colors whitespace-nowrap" onClick={() => handleViewDetails(booking)}>
                    <TableCell className="font-medium text-muted-foreground">#{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Customer #{booking.customerId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Tour #{booking.tourId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(booking.travelDate), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{booking.headCount}</TableCell>
                    <TableCell className="font-medium">
                      ${(booking.totalAmount / 100).toLocaleString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Badge variant="outline" className={
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            booking.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleCancelBooking(booking)}
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

      <BookingDetailDialog
        booking={selectedBooking}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      {isEditOpen && editingBooking && (
        <EditBookingDialog
          booking={editingBooking}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}

function BookingDetailDialog({ booking, open, onOpenChange }: { booking: Booking | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: tours } = useTours();
  const { data: customers } = useCustomers();

  if (!booking) return null;

  const tour = tours?.find(t => t.id === booking.tourId);
  const customer = customers?.find(c => c.id === booking.customerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-2xl">Booking Details</DialogTitle>
            <Badge variant="outline" className={
              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
            }>
              {booking.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Main Info Card */}
          <div className="p-4 bg-muted/30 rounded-xl space-y-4 border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary font-display">
                  ${(booking.totalAmount / 100).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1">Booking ID</p>
                <p className="font-mono text-sm bg-background px-2 py-1 rounded border">#{booking.id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Travel Date</span>
              </div>
              <p className="font-medium">{format(new Date(booking.travelDate), 'MMMM d, yyyy')}</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Travelers</span>
              </div>
              <p className="font-medium">{booking.headCount} guests</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tour Package</p>
                <p className="font-medium">{tour?.title || `Tour #${booking.tourId}`}</p>
                <p className="text-sm text-muted-foreground">
                  {tour?.durationDays} days • {tour?.currency} {(tour?.basePrice ? tour.basePrice / 100 : 0).toLocaleString()} pp
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                <p className="font-medium">{customer?.fullName || `Customer #${booking.customerId}`}</p>
                <p className="text-sm text-muted-foreground">{customer?.email}</p>
                <p className="text-sm text-muted-foreground">{customer?.phone}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Special Requests</p>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm text-amber-900 leading-relaxed">
                {booking.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditBookingDialog({ booking, open, onOpenChange }: { booking: Booking, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const updateBooking = useUpdateBooking();
  const { data: tours } = useTours();
  const { data: customers } = useCustomers();

  const form = useForm<z.infer<typeof insertBookingSchema>>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      tourId: booking.tourId,
      customerId: booking.customerId,
      travelDate: booking.travelDate,
      headCount: booking.headCount ?? 1,
      totalAmount: booking.totalAmount,
      status: booking.status ?? "pending",
      notes: booking.notes ?? ""
    }
  });

  const onSubmit = (data: z.infer<typeof insertBookingSchema>) => {
    updateBooking.mutate({ id: booking.id, ...data }, {
      onSuccess: () => {
        toast({ title: "Booking Updated", description: "The booking has been successfully updated." });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleTourChange = (tourId: string) => {
    const tour = tours?.find(t => t.id === parseInt(tourId));
    if (tour) {
      const headCount = form.getValues('headCount') || 1;
      form.setValue('totalAmount', tour.basePrice * headCount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Booking #{booking.id}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Tour</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => { field.onChange(parseInt(val)); handleTourChange(val); }}
                    >
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
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      />
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
                    <FormControl>
                      <Input type="number" {...field} onChange={e => {
                        field.onChange(parseInt(e.target.value));
                        const tourId = form.getValues('tourId');
                        const tour = tours?.find(t => t.id === tourId);
                        if (tour) form.setValue('totalAmount', tour.basePrice * parseInt(e.target.value));
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value ?? "pending"} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBooking.isPending}>
                {updateBooking.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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

  const handleTourChange = (tourId: string) => {
    const tour = tours?.find(t => t.id === parseInt(tourId));
    if (tour) {
      const headCount = form.getValues('headCount') || 1;
      form.setValue('totalAmount', tour.basePrice * headCount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 order-3 flex-1 sm:flex-none">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Booking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
