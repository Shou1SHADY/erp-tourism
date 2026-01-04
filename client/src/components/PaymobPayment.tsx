import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PaymobPaymentProps {
  amountCents: number;
  currency: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function PaymobPayment({ amountCents, currency, customer }: PaymobPaymentProps) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/paymob/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, currency, customer }),
      });
      
      if (!response.ok) throw new Error("Failed to initialize payment");
      
      const data = await response.json();
      setIframeUrl(data.iframeUrl);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (iframeUrl) {
    return (
      <div className="w-full h-[600px] border rounded-lg overflow-hidden">
        <iframe
          src={iframeUrl}
          className="w-full h-full"
          title="Paymob Payment"
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with Paymob</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total Amount: {(amountCents / 100).toFixed(2)} {currency}
          </p>
          <Button 
            onClick={handlePay} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
