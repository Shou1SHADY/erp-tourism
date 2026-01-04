import { useState, useMemo, memo, useEffect } from "react";
import { useTours, useCreateTour, useUpdateTour } from "@/hooks/use-tours";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, Users, Search, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertTourSchema, type Tour } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const TourCard = memo(({ tour, onEdit }: { tour: Tour; onEdit: (tour: Tour) => void }) => {
  const imageUrl = tour.images?.[0] || `https://images.unsplash.com/photo-1500622240331-50e5884ba956?auto=format&fit=crop&q=80&w=800`;

  return (
    <div className="group flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
      {/* Image Container */}
      <div className="h-44 sm:h-48 bg-muted relative overflow-hidden">
        <img
          src={imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
            tour.isActive
              ? "bg-emerald-500/90 text-white"
              : "bg-slate-500/90 text-white"
          )}>
            {tour.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-bold text-white font-display line-clamp-2 leading-tight drop-shadow-lg">
            {tour.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 rounded-full">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{tour.durationDays} Days</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 rounded-full">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Max {tour.capacity}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {tour.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">From</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl sm:text-2xl font-bold text-primary font-display">
                ${(tour.basePrice / 100).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/person</span>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            onClick={() => onEdit(tour)}
          >
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  );
});


TourCard.displayName = "TourCard";

export default function Tours() {
  const { data: tours, isLoading } = useTours();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [search, setSearch] = useState("");

  const filteredTours = useMemo(() => {
    if (!tours) return [];
    return tours.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [tours, search]);

  const handleCreate = () => {
    setEditingTour(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Tours" description="Manage your travel packages and destinations">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px] sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={handleCreate} className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Tour</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[300px] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {isDialogOpen && (
        <TourDialog
          tour={editingTour}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}

function TourDialog({ tour, open, onOpenChange }: { tour: Tour | null; open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createTour = useCreateTour();
  const updateTour = useUpdateTour();
  const [newImageUrl, setNewImageUrl] = useState("");

  const form = useForm<z.infer<typeof insertTourSchema>>({
    resolver: zodResolver(insertTourSchema),
    defaultValues: tour ? {
      title: tour.title,
      description: tour.description,
      basePrice: tour.basePrice,
      durationDays: tour.durationDays,
      capacity: tour.capacity,
      currency: tour.currency,
      isActive: tour.isActive ?? true,
      images: tour.images || []
    } : {
      title: "",
      description: "",
      basePrice: 0,
      durationDays: 1,
      capacity: 10,
      currency: "USD",
      isActive: true,
      images: []
    }
  });

  const images = form.watch("images") || [];

  const onSubmit = (data: z.infer<typeof insertTourSchema>) => {
    const action = tour ? updateTour.mutateAsync({ id: tour.id, data }) : createTour.mutateAsync(data);

    action.then(() => {
      toast({
        title: tour ? "Tour Updated" : "Tour Created",
        description: `Successfully ${tour ? 'updated' : 'added'} the tour.`
      });
      onOpenChange(false);
    }).catch((err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    });
  };

  const addImage = () => {
    if (!newImageUrl) return;
    const currentImages = form.getValues("images") || [];
    if (!currentImages.includes(newImageUrl)) {
      form.setValue("images", [...currentImages, newImageUrl]);
    }
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{tour ? 'Edit Tour' : 'Create New Tour'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Bali Paradise Escape" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (Cents)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl><Input {...field} readOnly className="bg-muted" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed itinerary..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Tour Images</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                />
                <Button type="button" variant="secondary" onClick={addImage}>Add</Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No images added</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={createTour.isPending || updateTour.isPending} className="flex-1 sm:flex-none">
                {tour ? 'Update Tour' : 'Create Tour'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
