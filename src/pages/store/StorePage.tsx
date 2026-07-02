import { useState } from "react";
import { useSearchParams } from "react-router";
import { Wifi, Signal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PackageCard } from "@/components/store/PackageCard";
import { OrderForm } from "@/components/store/OrderForm";
import { SuccessCard } from "@/components/store/SuccessCard";
import { trpc } from "@/providers/trpc";
import { copyToClipboard } from "@/lib/utils";
import type { Package, Order } from "@db/schema";

type PageState = "listing" | "checkout" | "success";

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>("listing");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [orderResult, setOrderResult] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hotspot params
  const macAddress = searchParams.get("mac") || undefined;
  const ipAddress = searchParams.get("ip") || undefined;
  const routerIdentity = searchParams.get("router") || undefined;
  const hotspotInterface = searchParams.get("interface") || undefined;
  const redirectUrl = searchParams.get("redirect") || undefined;

  const { data: packages, isLoading: packagesLoading } =
    trpc.package.list.useQuery();

  const { data: gateways, isLoading: gatewaysLoading } =
    trpc.payment.activeGateways.useQuery();

  const { data: allStats } = trpc.package.getAllStats.useQuery();

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        setOrderResult(data);
        setPageState("success");
        setError(null);
      }
    },
    onError: (err) => {
      setError(err.message || "حدث خطأ أثناء إنشاء الطلب");
    },
  });

  // const confirmOrder = trpc.order.confirmPayment.useMutation();

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPageState("checkout");
    setError(null);
  };

  const handleSubmitOrder = (data: {
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
  }) => {
    createOrder.mutate(data);
  };

  const handleCopy = async (type: "user" | "pass" | "both") => {
    const card = (orderResult as any)?.card;
    if (!card) return;
    if (type === "user") {
      await copyToClipboard(card.username || "");
    } else if (type === "pass") {
      await copyToClipboard(card.password || "");
    } else {
      await copyToClipboard(
        `اسم المستخدم: ${card.username || ""}\nكلمة المرور: ${card.password || ""}`
      );
    }
  };

  const handleCancel = () => {
    setSelectedPackage(null);
    setPageState("listing");
    setError(null);
  };

  const isLoading = packagesLoading || gatewaysLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-8">
            <Skeleton className="h-12 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Signal className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">فاست نت</h1>
              <p className="text-xs opacity-80">متجر الكروت الذكي</p>
            </div>
          </div>
          <div className="text-left text-sm">
            <div className="flex items-center gap-1">
              <Wifi className="w-4 h-4" />
              <span>متصل</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pageState === "listing" && (
          <>
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold mb-2">اختر باقتك</h2>
              <p className="text-muted-foreground">
                باقات إنترنت سريعة بأسعار مميزة
              </p>
            </div>

            {packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => {
                  const stats = allStats?.find(
                    (s) => s.package.id === pkg.id
                  );
                  return (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      availableCount={stats?.stats.available || 0}
                      onSelect={handleSelectPackage}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wifi className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  لا توجد باقات متاحة حالياً
                </p>
              </div>
            )}
          </>
        )}

        {pageState === "checkout" && selectedPackage && gateways && (
          <div className="py-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={handleCancel}
            >
              ← العودة للباقات
            </Button>
            <OrderForm
              pkg={selectedPackage}
              gateways={gateways}
              macAddress={macAddress}
              ipAddress={ipAddress}
              routerIdentity={routerIdentity}
              hotspotInterface={hotspotInterface}
              redirectUrl={redirectUrl}
              onSubmit={handleSubmitOrder}
              onCancel={handleCancel}
            />
          </div>
        )}

        {pageState === "success" && orderResult && selectedPackage && (
          <div className="py-4">
            <SuccessCard
              order={orderResult}
              pkg={selectedPackage}
              card={(orderResult as any).card}
              redirectUrl={redirectUrl}
              onCopy={handleCopy}
            />
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setPageState("listing");
                  setOrderResult(null);
                  setSelectedPackage(null);
                }}
              >
                شراء باقة أخرى
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-4 text-center text-sm text-muted-foreground">
        <p>فاست نت - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
