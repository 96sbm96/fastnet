import { useState } from "react";
import { ShoppingCart, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const { data: orders, isLoading } = trpc.order.list.useQuery();
  const { data: orderDetail } = trpc.order.getById.useQuery(
    { id: selectedOrder! },
    { enabled: !!selectedOrder }
  );
  const utils = trpc.useUtils();

  const cancelMutation = trpc.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
    },
  });

  const filteredOrders = statusFilter
    ? orders?.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground">متابعة وإدارة طلبات العملاء</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              الطلبات
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="reserved">محجوز</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="failed">فاشل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>الباقة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.package?.name}</TableCell>
                      <TableCell>
                        {formatCurrency(order.amount)} ر.ي
                      </TableCell>
                      <TableCell>
                        {order.customerName || "-"}
                        {order.customerPhone && (
                          <div className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>
                                  تفاصيل الطلب {order.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              {orderDetail && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        الباقة
                                      </p>
                                      <p className="font-medium">
                                        {orderDetail.package?.name}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        المبلغ
                                      </p>
                                      <p className="font-medium">
                                        {formatCurrency(orderDetail.amount)} ر.ي
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        الحالة
                                      </p>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                                          orderDetail.status
                                        )}`}
                                      >
                                        {getStatusLabel(orderDetail.status)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        بوابة الدفع
                                      </p>
                                      <p className="font-medium">
                                        {orderDetail.gateway?.displayNameAr ||
                                          "-"}
                                      </p>
                                    </div>
                                  </div>

                                  {orderDetail.card && (
                                    <div className="bg-muted rounded-lg p-3">
                                      <p className="text-sm text-muted-foreground mb-2">
                                        بيانات الكرت
                                      </p>
                                      <div className="space-y-1">
                                        <p
                                          className="font-mono text-sm"
                                          dir="ltr"
                                        >
                                          <span className="text-muted-foreground">
                                            اسم المستخدم:{" "}
                                          </span>
                                          <span className="font-bold">
                                            {(orderDetail.card as any).username}
                                          </span>
                                        </p>
                                        <p
                                          className="font-mono text-sm"
                                          dir="ltr"
                                        >
                                          <span className="text-muted-foreground">
                                            كلمة المرور:{" "}
                                          </span>
                                          <span className="font-bold">
                                            {(orderDetail.card as any).password}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {(orderDetail.customerName ||
                                    orderDetail.customerPhone) && (
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        بيانات العميل
                                      </p>
                                      <p>{orderDetail.customerName}</p>
                                      <p>{orderDetail.customerPhone}</p>
                                    </div>
                                  )}

                                  {(orderDetail.macAddress ||
                                    orderDetail.routerIdentity) && (
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        معلومات الهوتسبوت
                                      </p>
                                      <p
                                        className="font-mono text-xs"
                                        dir="ltr"
                                      >
                                        MAC: {orderDetail.macAddress}
                                      </p>
                                      <p className="text-xs">
                                        Router: {orderDetail.routerIdentity}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {(order.status === "pending" ||
                            order.status === "reserved") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                if (
                                  confirm("هل أنت متأكد من إلغاء هذا الطلب؟")
                                ) {
                                  cancelMutation.mutate({
                                    orderNumber: order.orderNumber,
                                  });
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد طلبات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
