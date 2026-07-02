import {
  ShoppingCart,
  CreditCard,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { data: orderStats } = trpc.order.stats.useQuery();
  const { data: dailyStats } = trpc.order.dailyStats.useQuery({ days: 7 });
  const { data: packagesStats } = trpc.package.getAllStats.useQuery();
  const { data: recentOrders } = trpc.order.list.useQuery();

  const lowStockPackages =
    packagesStats?.filter((s) => s.stats.lowStock) || [];

  const totalCards = packagesStats?.reduce(
    (acc, s) => ({
      total: acc.total + s.stats.total,
      available: acc.available + s.stats.available,
      sold: acc.sold + s.stats.sold,
      reserved: acc.reserved + s.stats.reserved,
    }),
    { total: 0, available: 0, sold: 0, reserved: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المتجر</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الطلبات"
          value={orderStats?.total || 0}
          subtitle={`${orderStats?.completed || 0} مكتمل`}
          icon={ShoppingCart}
          color="#3b82f6"
        />
        <StatCard
          title="الإيرادات"
          value={`${formatCurrency(orderStats?.totalRevenue || 0)} ر.ي`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          title="الكروت المتاحة"
          value={totalCards?.available || 0}
          subtitle={`من ${totalCards?.total || 0} إجمالي`}
          icon={CreditCard}
          color="#f59e0b"
        />
        <StatCard
          title="الباقات النشطة"
          value={packagesStats?.length || 0}
          subtitle={`${lowStockPackages.length} منخفض المخزون`}
          icon={Package}
          color="#8b5cf6"
        />
      </div>

      {/* Low Stock Alerts */}
      {lowStockPackages.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5" />
              تنبيهات المخزون المنخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockPackages.map(({ package: pkg, stats }) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">{pkg.name}</span>
                  </div>
                  <span className="text-sm text-amber-700">
                    متبقي: {stats.available} كرت
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            آخر الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-3">رقم الطلب</th>
                    <th className="text-right py-2 px-3">الباقة</th>
                    <th className="text-right py-2 px-3">المبلغ</th>
                    <th className="text-right py-2 px-3">الحالة</th>
                    <th className="text-right py-2 px-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">
                        {order.orderNumber}
                      </td>
                      <td className="py-2 px-3">{order.package?.name}</td>
                      <td className="py-2 px-3">
                        {formatCurrency(order.amount)} ر.ي
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ar-YE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              لا توجد طلبات بعد
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Chart */}
      {dailyStats && dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أداء آخر 7 أيام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {dailyStats.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="w-full flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{
                        height: `${Math.max(
                          (day.count / Math.max(...dailyStats.map((d) => d.count))) * 150,
                          4
                        )}px`,
                      }}
                      title={`${day.count} طلب`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("ar-YE", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
