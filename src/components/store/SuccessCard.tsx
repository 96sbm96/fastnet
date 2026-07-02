import { useState } from "react";
import { CheckCircle, Copy, Check, Wifi, User, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Order, Package, Card as CardType } from "@db/schema";

interface SuccessCardProps {
  order: Order;
  pkg: Package;
  card: CardType;
  redirectUrl?: string;
  onCopy: (type: "user" | "pass" | "both") => void;
}

export function SuccessCard({
  order,
  pkg,
  card,
  redirectUrl,
  onCopy,
}: SuccessCardProps) {
  const [copied, setCopied] = useState<"user" | "pass" | "both" | null>(null);

  const handleCopy = async (type: "user" | "pass" | "both") => {
    onCopy(type);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogin = () => {
    if (redirectUrl) {
      // Create a form to submit to MikroTik hotspot
      const form = document.createElement("form");
      form.method = "POST";
      form.action = redirectUrl;
      form.style.display = "none";

      const usernameInput = document.createElement("input");
      usernameInput.name = "username";
      usernameInput.value = card.username;

      const passwordInput = document.createElement("input");
      passwordInput.name = "password";
      passwordInput.value = card.password;

      form.appendChild(usernameInput);
      form.appendChild(passwordInput);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto" dir="rtl">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        <CardTitle className="text-2xl text-emerald-600">
          تم الدفع بنجاح!
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          رقم العملية: <span className="font-mono font-bold">{order.orderNumber}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Info */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{pkg.name}</p>
              <p className="text-sm text-muted-foreground">
                {pkg.durationHours} ساعة
              </p>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-primary">
                {formatCurrency(order.amount)}
              </p>
              <p className="text-sm text-muted-foreground">ر.ي</p>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">بيانات تسجيل الدخول</h3>

          <div className="space-y-2">
            {/* Username */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">اسم المستخدم</p>
                <p className="font-mono font-bold text-lg truncate" dir="ltr">
                  {card.username}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("user")}
              >
                {copied === "user" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">كلمة المرور</p>
                <p className="font-mono font-bold text-lg truncate" dir="ltr">
                  {card.password}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("pass")}
              >
                {copied === "pass" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Copy Both */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleCopy("both")}
          >
            {copied === "both" ? (
              <>
                <Check className="w-4 h-4 ml-2 text-emerald-500" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 ml-2" />
                نسخ اسم المستخدم وكلمة المرور
              </>
            )}
          </Button>
        </div>

        {/* Login Button */}
        {redirectUrl && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
          >
            <Wifi className="w-5 h-5 ml-2" />
            تسجيل الدخول للشبكة مباشرة
          </Button>
        )}

        {/* QR Code placeholder */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            امسح الكود للدخول السريع
          </p>
          <div className="inline-block p-3 bg-white rounded-lg">
            <QRCodeSVG
              value={`username:${card.username}|password:${card.password}`}
              size={150}
              level="M"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// QR Code component
import { QRCodeSVG } from "qrcode.react";
