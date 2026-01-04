import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title="Settings" description="Configure company preferences" />
      
      <div className="grid gap-8">
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Details that appear on invoices and emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input defaultValue="Wanderlust Travel Co." />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input defaultValue="support@wanderlust.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="123 Travel Lane, Adventure City" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage email alerts and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Booking Alert</Label>
                <p className="text-sm text-muted-foreground">Receive an email when a new booking is created</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Confirmation</Label>
                <p className="text-sm text-muted-foreground">Notify me when a payment is successfully processed</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
