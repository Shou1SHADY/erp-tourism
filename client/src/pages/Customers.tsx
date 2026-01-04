import { useState, useMemo } from "react";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Mail, Phone, MapPin, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRandomColor = (id: number) => {
    const colors = [
      "bg-red-100 text-red-700",
      "bg-orange-100 text-orange-700",
      "bg-amber-100 text-amber-700",
      "bg-green-100 text-green-700",
      "bg-emerald-100 text-emerald-700",
      "bg-teal-100 text-teal-700",
      "bg-cyan-100 text-cyan-700",
      "bg-sky-100 text-sky-700",
      "bg-blue-100 text-blue-700",
      "bg-indigo-100 text-indigo-700",
      "bg-violet-100 text-violet-700",
      "bg-purple-100 text-purple-700",
      "bg-fuchsia-100 text-fuchsia-700",
      "bg-pink-100 text-pink-700",
      "bg-rose-100 text-rose-700",
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Customers" description="Manage your client database">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px] sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-card"
            />
          </div>
          <CreateCustomerDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-muted/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
          <Search className="h-10 w-10 mb-4 opacity-20" />
          <p className="text-lg font-medium">No customers found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 stagger-children">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="group relative bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-14 w-14 border-2 border-background shadow-md group-hover:scale-110 transition-transform duration-300">
                  <AvatarFallback className={cn("font-bold text-lg", getRandomColor(customer.id))}>
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                {customer.nationality && (
                  <div className="bg-secondary/80 px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {customer.nationality.substring(0, 3)}
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-display font-bold text-lg leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                  {customer.fullName}
                </h3>
                <p className="text-xs text-muted-foreground">ID: #{customer.id}</p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="truncate text-xs sm:text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateCustomerDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();

  const form = useForm<z.infer<typeof insertCustomerSchema>>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nationality: "",
      notes: ""
    }
  });

  const onSubmit = (data: z.infer<typeof insertCustomerSchema>) => {
    createCustomer.mutate(data, {
      onSuccess: () => {
        toast({ title: "Customer Added", description: "Successfully added to database." });
        onOpenChange(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex-1 sm:flex-none justify-center">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1 234..." {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl><Input placeholder="e.g. American" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Input placeholder="Preferences, allergies..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createCustomer.isPending} className="w-full">
              {createCustomer.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
