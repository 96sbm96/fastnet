import { useState } from "react";
import { Plus, Pencil, Trash2, Package as PackageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/utils";
import type { Package as PackageType } from "@db/schema";

export default function PackagesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PackageType | null>(null);

  const { data: packages, isLoading } = trpc.package.list.useQuery();
  const { data: allStats } = trpc.package.getAllStats.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.package.create.useMutation({
    onSuccess: () => {
      utils.package.list.invalidate();
      utils.package.getAllStats.invalidate();
      setOpen(false);
    },
  });

  const updateMutation = trpc.package.update.useMutation({
    onSuccess: () => {
      utils.package.list.invalidate();
      utils.package.getAllStats.invalidate();
      setEditing(null);
      setOpen(false);
    },
  });

  const deleteMutation = trpc.package.delete.useMutation({
    onSuccess: () => {
      utils.package.list.invalidate();
      utils.package.getAllStats.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      price: parseFloat(formData.get("price") as string),
      speed: (formData.get("speed") as string) || undefined,
      dataLimit: (formData.get("dataLimit") as string) || undefined,
      durationHours: parseInt(formData.get("durationHours") as string),
      color: (formData.get("color") as string) || undefined,
      icon: (formData.get("icon") as string) || undefined,
      lowStockThreshold: parseInt(formData.get("lowStockThreshold") as string) || undefined,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الباقات</h1>
          <p className="text-muted-foreground">إضافة وتعديل باقات الإنترنت</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4 ml-2" />
              باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "تعديل باقة" : "باقة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الباقة</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editing?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (ر.ي)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editing?.price}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationHours">المدة (ساعة)</Label>
                  <Input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    defaultValue={editing?.durationHours}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed">السرعة</Label>
                  <Input
                    id="speed"
                    name="speed"
                    placeholder="مثال: 2 ميجا"
                    defaultValue={editing?.speed || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataLimit">حجم البيانات</Label>
                  <Input
                    id="dataLimit"
                    name="dataLimit"
                    placeholder="مثال: 10 جيجا"
                    defaultValue={editing?.dataLimit || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">اللون</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={editing?.color || "#3b82f6"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">الأيقونة</Label>
                  <Input
                    id="icon"
                    name="icon"
                    defaultValue={editing?.icon || "wifi"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">تنبيه المخزون</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    defaultValue={editing?.lowStockThreshold || 10}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : null}
                {editing ? "تحديث" : "إنشاء"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="w-5 h-5" />
            الباقات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : packages && packages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => {
                  const stats = allStats?.find(
                    (s) => s.package.id === pkg.id
                  );
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pkg.color || "#3b82f6" }}
                          />
                          {pkg.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(pkg.price)} ر.ي
                      </TableCell>
                      <TableCell>{pkg.durationHours} ساعة</TableCell>
                      <TableCell>
                        <span
                          className={
                            stats?.stats.lowStock
                              ? "text-red-600 font-bold"
                              : "text-emerald-600"
                          }
                        >
                          {stats?.stats.available || 0}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {" "}
                          / {stats?.stats.total || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            pkg.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pkg.isActive ? "نشط" : "معطل"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(pkg);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              if (
                                confirm(
                                  "هل أنت متأكد من حذف هذه الباقة؟"
                                )
                              ) {
                                deleteMutation.mutate({ id: pkg.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد باقات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
