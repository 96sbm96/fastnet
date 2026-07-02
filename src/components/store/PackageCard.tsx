import { Wifi, Clock, Database, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Package } from "@db/schema";

interface PackageCardProps {
  pkg: Package;
  availableCount: number;
  onSelect: (pkg: Package) => void;
}

export function PackageCard({ pkg, availableCount, onSelect }: PackageCardProps) {
  const isLowStock = pkg.lowStockThreshold ? availableCount <= pkg.lowStockThreshold : false;
  const isOutOfStock = availableCount === 0;

  return (
    <Card
      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/50"
      dir="rtl"
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: pkg.color || "#3b82f6" }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: pkg.color || "#3b82f6" }}
            >
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-3">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(pkg.price)}
          </span>
          <span className="text-sm text-muted-foreground mr-1"> ر.ي</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {pkg.speed && (
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{pkg.speed}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{pkg.durationHours} ساعة</span>
          </div>
          {pkg.dataLimit && (
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
              <Database className="w-4 h-4 text-green-500" />
              <span>{pkg.dataLimit}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            المخزون: {" "}
            <span className={isLowStock ? "text-red-500 font-semibold" : "text-emerald-600 font-semibold"}>
              {availableCount}
            </span>
          </span>
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              مخزون منخفض
            </span>
          )}
        </div>

        <Button
          className="w-full font-semibold"
          size="lg"
          disabled={isOutOfStock}
          onClick={() => onSelect(pkg)}
          style={{
            backgroundColor: isOutOfStock ? undefined : pkg.color || "#3b82f6",
          }}
        >
          {isOutOfStock ? "نفذت الكمية" : "اشترك الآن"}
        </Button>
      </CardContent>
    </Card>
  );
}
