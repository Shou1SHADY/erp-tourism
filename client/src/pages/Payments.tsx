import { usePayments } from "@/hooks/use-payments";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Payments() {
  const { data: payments, isLoading } = usePayments();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Payments" description="Transaction history and invoices">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading transactions...</TableCell>
                </TableRow>
              ) : payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found</TableCell>
                </TableRow>
              ) : (
                payments?.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors whitespace-nowrap">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{payment.id}</TableCell>
                    <TableCell className="font-medium">Booking #{payment.bookingId}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate!), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="capitalize">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
                        {payment.method.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">${(payment.amount / 100).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        payment.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                          payment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
