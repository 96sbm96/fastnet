import { useState } from "react";
import { Settings, Save, DollarSign, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";

export default function SettingsPage() {
  const { data: settings } = trpc.settings.list.useQuery();
  const utils = trpc.useUtils();

  const setMutation = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.list.invalidate();
    },
  });

  const handleSave = (key: string, value: string) => {
    setMutation.mutate({ key, value });
  };

  const getValue = (key: string, defaultValue: string = "") => {
    return settings?.find((s) => s.key === key)?.value || defaultValue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إعدادات النظام</h1>
        <p className="text-muted-foreground">
          تكوين إعدادات المتجر والنظام
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="store">المتجر</TabsTrigger>
          <TabsTrigger value="hotspot">الهوتسبوت</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                الإعدادات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingItem
                label="اسم المتجر"
                description="الاسم المعروض في رأس الصفحة"
                defaultValue={getValue("store_name", "فاست نت")}
                onSave={(value) => handleSave("store_name", value)}
              />
              <SettingItem
                label="العملة"
                description="رمز العملة المعروض"
                defaultValue={getValue("currency", "ر.ي")}
                onSave={(value) => handleSave("currency", value)}
              />
              <SettingItem
                label="رقم الهاتف للدعم"
                description="رقم التواصل مع العملاء"
                defaultValue={getValue("support_phone", "")}
                onSave={(value) => handleSave("support_phone", value)}
              />
              <SettingItem
                label="البريد الإلكتروني"
                description="بريد الدعم الفني"
                defaultValue={getValue("support_email", "")}
                onSave={(value) => handleSave("support_email", value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                إعدادات المتجر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingItem
                label="مدة حجز الكرت (دقائق)"
                description="المدة التي يحجز فيها الكرت أثناء الدفع"
                defaultValue={getValue("reservation_minutes", "10")}
                type="number"
                onSave={(value) => handleSave("reservation_minutes", value)}
              />
              <SettingItem
                label="الحد الأدنى للتنبيه"
                description="عدد الكروت التي يتم عندها تنبيه المخزون المنخفض"
                defaultValue={getValue("low_stock_default", "10")}
                type="number"
                onSave={(value) => handleSave("low_stock_default", value)}
              />
              <div className="flex items-center justify-between">
                <div>
                  <Label>تفعيل المتجر</Label>
                  <p className="text-sm text-muted-foreground">
                    إظهار المتجر للعملاء
                  </p>
                </div>
                <Switch
                  defaultChecked={
                    getValue("store_enabled", "true") === "true"
                  }
                  onCheckedChange={(checked) =>
                    handleSave("store_enabled", checked.toString())
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotspot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                إعدادات الهوتسبوت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingItem
                label="عنوان MikroTik"
                description="IP أو نطاق الراوتر"
                defaultValue={getValue("mikrotik_address", "")}
                onSave={(value) => handleSave("mikrotik_address", value)}
              />
              <SettingItem
                label="اسم المستخدم MikroTik"
                description=""
                defaultValue={getValue("mikrotik_username", "")}
                onSave={(value) => handleSave("mikrotik_username", value)}
              />
              <SettingItem
                label="كلمة المرور MikroTik"
                description=""
                type="password"
                defaultValue={getValue("mikrotik_password", "")}
                onSave={(value) => handleSave("mikrotik_password", value)}
              />
              <SettingItem
                label="صفحة الدخول الافتراضية"
                description="الرابط الذي يتم إعادة التوجيه إليه"
                defaultValue={getValue("default_login_page", "")}
                onSave={(value) => handleSave("default_login_page", value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingItem({
  label,
  description,
  defaultValue,
  type = "text",
  onSave,
}: {
  label: string;
  description: string;
  defaultValue: string;
  type?: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSave(value)}
        >
          <Save className="w-4 h-4 ml-1" />
          حفظ
        </Button>
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="max-w-md"
      />
    </div>
  );
}
