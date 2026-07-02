import { useState } from "react";
import { User, Phone, Mail, Router, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Package, PaymentGateway } from "@db/schema";

interface OrderFormProps {
  pkg: Package;
  gateways: PaymentGateway[];
  macAddress?: string;
  ipAddress?: string;
  routerIdentity?: string;
  hotspotInterface?: string;
  redirectUrl?: string;
  onSubmit: (data: {
    packageId: number;
    amount: string;
    gatewayId: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    macAddress?: string;
    ipAddress?: string;
    routerIdentity?: string;
    hotspotInterface?: string;
    redirectUrl?: string;
  }) => void;
  onCancel: () => void;
}

export function OrderForm({
  pkg,
  gateways,
  macAddress,
  ipAddress,
  routerIdentity,
  hotspotInterface,
  redirectUrl,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<number>(
    gateways[0]?.id || 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      packageId: pkg.id,
      amount: pkg.price.toString(),
      gatewayId: selectedGateway,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      macAddress: macAddress || undefined,
      ipAddress: ipAddress || undefined,
      routerIdentity: routerIdentity || undefined,
      hotspotInterface: hotspotInterface || undefined,
      redirectUrl: redirectUrl || undefined,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto" dir="rtl">
      <CardHeader>
        <CardTitle className="text-xl text-center">إتمام الطلب</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Package Summary */}
          <div
            className="p-4 rounded-lg border-2"
            style={{ borderColor: pkg.color || "#3b82f6" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pkg.durationHours} ساعة
                </p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(pkg.price)}
                </p>
                <p className="text-sm text-muted-foreground">ر.ي</p>
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              طريقة الدفع
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {gateways.map((gateway) => (
                <button
                  key={gateway.id}
                  type="button"
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selectedGateway === gateway.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {gateway.displayNameAr}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم
              </Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="اسمك الكريم"
                className="text-right"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="7xxxxxxxx"
                type="tel"
                className="text-right"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
                className="text-right"
                dir="ltr"
              />
            </div>
          </div>

          {/* Router Info (if from hotspot) */}
          {(routerIdentity || macAddress) && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              {routerIdentity && (
                <div className="flex items-center gap-2">
                  <Router className="w-3.5 h-3.5" />
                  <span className="text-muted-foreground">الراوتر:</span>
                  <span>{routerIdentity}</span>
                </div>
              )}
              {macAddress && (
                <div className="flex items-center gap-2" dir="ltr">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-muted-foreground">MAC:</span>
                  <span className="font-mono text-xs">{macAddress}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              إلغاء
            </Button>
            <Button type="submit" className="flex-1" size="lg">
              تأكيد ودفع {formatCurrency(pkg.price)} ر.ي
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
