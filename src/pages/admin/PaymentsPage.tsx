import { useState } from "react";
import { Plus, Pencil, Trash2, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: gateways, isLoading } = trpc.payment.gatewayList.useQuery();
  const { data: transactions } = trpc.payment.transactionList.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.payment.createGateway.useMutation({
    onSuccess: () => {
      utils.payment.gatewayList.invalidate();
      setOpen(false);
    },
  });

  const updateMutation = trpc.payment.updateGateway.useMutation({
    onSuccess: () => {
      utils.payment.gatewayList.invalidate();
      setEditing(null);
      setOpen(false);
    },
  });

  const deleteMutation = trpc.payment.deleteGateway.useMutation({
    onSuccess: () => {
      utils.payment.gatewayList.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      displayNameAr: formData.get("displayNameAr") as string,
      isActive: formData.get("isActive") === "on",
      isSandbox: formData.get("isSandbox") === "on",
      apiKey: (formData.get("apiKey") as string) || undefined,
      apiSecret: (formData.get("apiSecret") as string) || undefined,
      merchantId: (formData.get("merchantId") as string) || undefined,
      baseUrl: (formData.get("baseUrl") as string) || undefined,
      sandboxUrl: (formData.get("sandboxUrl") as string) || undefined,
      webhookSecret: (formData.get("webhookSecret") as string) || undefined,
      sortOrder: parseInt((formData.get("sortOrder") as string) || "0"),
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
          <h1 className="text-2xl font-bold">بوابات الدفع</h1>
          <p className="text-muted-foreground">
            إدارة بوابات الدفع والمعاملات
          </p>
        </div>
      </div>

      <Tabs defaultValue="gateways">
        <TabsList className="w-full">
          <TabsTrigger value="gateways">البوابات</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)}>
                  <Plus className="w-4 h-4 ml-2" />
                  بوابة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "تعديل بوابة" : "بوابة دفع جديدة"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editing?.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">الكود</Label>
                      <Input
                        id="code"
                        name="code"
                        defaultValue={editing?.code}
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayNameAr">الاسم المعروض (عربي)</Label>
                    <Input
                      id="displayNameAr"
                      name="displayNameAr"
                      defaultValue={editing?.displayNameAr}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        name="apiKey"
                        defaultValue={editing?.apiKey || ""}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiSecret">API Secret</Label>
                      <Input
                        id="apiSecret"
                        name="apiSecret"
                        type="password"
                        defaultValue={editing?.apiSecret || ""}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input
                      id="merchantId"
                      name="merchantId"
                      defaultValue={editing?.merchantId || ""}
                      dir="ltr"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">Production URL</Label>
                      <Input
                        id="baseUrl"
                        name="baseUrl"
                        defaultValue={editing?.baseUrl || ""}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sandboxUrl">Sandbox URL</Label>
                      <Input
                        id="sandboxUrl"
                        name="sandboxUrl"
                        defaultValue={editing?.sandboxUrl || ""}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      name="webhookSecret"
                      type="password"
                      defaultValue={editing?.webhookSecret || ""}
                      dir="ltr"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isActive"
                        name="isActive"
                        defaultChecked={
                          editing ? editing.isActive : true
                        }
                      />
                      <Label htmlFor="isActive">نشط</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isSandbox"
                        name="isSandbox"
                        defaultChecked={
                          editing ? editing.isSandbox : true
                        }
                      />
                      <Label htmlFor="isSandbox">Sandbox</Label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editing ? "تحديث" : "إنشاء"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : gateways && gateways.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>البيئة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gateways.map((gateway) => (
                      <TableRow key={gateway.id}>
                        <TableCell className="font-medium">
                          {gateway.displayNameAr}
                        </TableCell>
                        <TableCell className="font-mono" dir="ltr">
                          {gateway.code}
                        </TableCell>
                        <TableCell>
                          {gateway.isSandbox ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                              Sandbox
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
                              Production
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {gateway.isActive ? (
                            <ToggleRight className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(gateway);
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
                                    "هل أنت متأكد من حذف هذه البوابة؟"
                                  )
                                ) {
                                  deleteMutation.mutate({ id: gateway.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بوابات دفع
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                المعاملات المالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطلب</TableHead>
                        <TableHead>البوابة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="font-mono">
                            {txn.order?.orderNumber || "-"}
                          </TableCell>
                          <TableCell>
                            {txn.gateway?.displayNameAr}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(txn.amount)} ر.ي
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                                txn.status
                              )}`}
                            >
                              {getStatusLabel(txn.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(txn.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد معاملات
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
