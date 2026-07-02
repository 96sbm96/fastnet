import { useState } from "react";
import { Upload, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

export default function CardsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [bulkInput, setBulkInput] = useState("");

  const { data: packages } = trpc.package.list.useQuery();
  const { data: cards } = trpc.card.list.useQuery();
  const { data: cardStats } = trpc.card.getStats.useQuery({});
  const utils = trpc.useUtils();

  const createMutation = trpc.card.create.useMutation({
    onSuccess: () => {
      utils.card.list.invalidate();
      utils.card.getStats.invalidate();
    },
  });

  const createBatchMutation = trpc.card.createBatch.useMutation({
    onSuccess: () => {
      utils.card.list.invalidate();
      utils.card.getStats.invalidate();
      setBulkInput("");
    },
  });

  const deleteMutation = trpc.card.delete.useMutation({
    onSuccess: () => {
      utils.card.list.invalidate();
      utils.card.getStats.invalidate();
    },
  });

  const cleanupMutation = trpc.card.cleanupExpired.useMutation({
    onSuccess: () => {
      utils.card.list.invalidate();
      utils.card.getStats.invalidate();
    },
  });

  const handleCreateCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      packageId: parseInt(formData.get("packageId") as string),
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      pdfSource: (formData.get("pdfSource") as string) || undefined,
    });
    e.currentTarget.reset();
  };

  const handleBulkImport = () => {
    if (!selectedPackage || !bulkInput.trim()) return;

    const lines = bulkInput.trim().split("\n");
    const cards = lines
      .map((line) => {
        const parts = line.split(/[\s,]+/);
        if (parts.length >= 2) {
          return {
            packageId: parseInt(selectedPackage),
            username: parts[0].trim(),
            password: parts[1].trim(),
          };
        }
        return null;
      })
      .filter(Boolean) as { packageId: number; username: string; password: string }[];

    if (cards.length > 0) {
      createBatchMutation.mutate(cards);
    }
  };

  const filteredCards = selectedPackage
    ? cards?.filter((c) => c.packageId === parseInt(selectedPackage))
    : cards;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الكروت</h1>
          <p className="text-muted-foreground">
            إضافة واستيراد وإدارة كروت الهوتسبوت
          </p>
        </div>
        <Button variant="outline" onClick={() => cleanupMutation.mutate()}>
          <RefreshCw className="w-4 h-4 ml-2" />
          تنظيف المحجوزات
        </Button>
      </div>

      {/* Stats */}
      {cardStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "الإجمالي", value: cardStats.total, color: "text-blue-600" },
            { label: "المتاح", value: cardStats.available, color: "text-emerald-600" },
            { label: "المحجوز", value: cardStats.reserved, color: "text-amber-600" },
            { label: "المباع", value: cardStats.sold, color: "text-purple-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold {stat.color}">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList className="w-full">
          <TabsTrigger value="list">قائمة الكروت</TabsTrigger>
          <TabsTrigger value="add">إضافة كرت</TabsTrigger>
          <TabsTrigger value="bulk">استيراد مجمع</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الكروت</CardTitle>
                <Select
                  value={selectedPackage}
                  onValueChange={setSelectedPackage}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="كل الباقات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">كل الباقات</SelectItem>
                    {packages?.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCards && filteredCards.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الباقة</TableHead>
                        <TableHead>اسم المستخدم</TableHead>
                        <TableHead>كلمة المرور</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCards.slice(0, 100).map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>{card.package?.name}</TableCell>
                          <TableCell
                            className="font-mono"
                            dir="ltr"
                          >
                            {card.username}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            dir="ltr"
                          >
                            {card.password}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                                card.status
                              )}`}
                            >
                              {getStatusLabel(card.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                if (
                                  confirm("هل أنت متأكد من حذف هذا الكرت؟")
                                ) {
                                  deleteMutation.mutate({ id: card.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredCards.length > 100 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      عرض 100 من {filteredCards.length} كرت
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد كروت
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة كرت جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCard} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>الباقة</Label>
                  <Select name="packageId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    name="password"
                    required
                    dir="ltr"
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>استيراد مجمع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الباقة</Label>
                <Select
                  value={selectedPackage}
                  onValueChange={setSelectedPackage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الباقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages?.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>بيانات الكروت</Label>
                <p className="text-sm text-muted-foreground">
                  أدخل كل كرت في سطر منفصل (اسم_المستخدم كلمة_المرور)
                </p>
                <textarea
                  className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="user1 pass1&#10;user2 pass2&#10;user3 pass3"
                  dir="ltr"
                />
              </div>
              <Button
                onClick={handleBulkImport}
                disabled={
                  !selectedPackage ||
                  !bulkInput.trim() ||
                  createBatchMutation.isPending
                }
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
