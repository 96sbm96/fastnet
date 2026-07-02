# فاست نت - FastNet Smart Card Store

نظام متكامل لبيع كروت الهوتسبوت الخاصة بشبكات MikroTik، مصمم للعمل مع صفحات تسجيل الدخول Captive Portal.

## المميزات الرئيسية

- **واجهة عميل خفيفة**: متوافقة مع جميع المتصفحات المصغرة للهواتف (Captive Portals)
- **لوحة إدارة فاخرة**: رسوم بيانية، إحصائيات، وتقارير مفصلة
- **نظام بيع آلي**: حجز الكروت تلقائياً وإطلاقها عند انتهاء المهلة
- **بوابات دفع متعددة**: دعم محافظ فلوسك، جيب، كريمي، جوالي
- **حماية متكاملة**: CSRF, XSS, Rate Limiting, Webhook Signature Verification
- **استيراد الكروت**: دعم ملفات PDF, CSV, TXT
- **RTL بالكامل**: واجهة عربية 100%

## المتطلبات

- Node.js 20+
- MySQL 8+
- Redis 7+

## التثبيت والتشغيل

### 1. استنساخ المستودع

```bash
git clone https://github.com/yourusername/fastnet.git
cd fastnet
```

### 2. تثبيت الاعتمادات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل متغير DATABASE_URL في .env
# DATABASE_URL=mysql://user:password@localhost:3306/fastnet

# مزامنة قاعدة البيانات
npm run db:push
```

### 4. التشغيل في بيئة التطوير

```bash
npm run dev
```

يفتح التطبيق على: http://localhost:3000

### 5. البناء للإنتاج

```bash
npm run build
npm start
```

## النشر باستخدام Docker

### النشر السريع

```bash
# نسخ ملف البيئة
.cp .env.example .env

# تعديل متغيرات البيئة حسب الحاجة
# ثم تشغيل الحاويات
docker-compose up -d
```

### إعادة البناء

```bash
docker-compose down
docker-compose up -d --build
```

### عرض السجلات

```bash
docker-compose logs -f app
```

## هيكل المشروع

```
fastnet/
├── api/                    # Backend (tRPC + Hono)
│   ├── queries/           # Database queries
│   ├── lib/               # Framework utilities
│   ├── kimi/              # OAuth authentication
│   ├── router.ts          # tRPC router
│   ├── middleware.ts      # tRPC procedures
│   └── boot.ts            # Server entry
├── db/                     # Database schema
│   ├── schema.ts          # Table definitions
│   └── relations.ts       # Table relations
├── contracts/              # Shared types
├── src/                    # Frontend (React)
│   ├── pages/             # Route pages
│   │   ├── store/         # Store pages
│   │   └── admin/         # Admin pages
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks
│   └── providers/         # Context providers
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## الاستخدام مع MikroTik Hotspot

### إعداد صفحة الهوتسبوت

1. ارفع ملفات `login.html` و `alogin.html` إلى الراوتر
2. قم بتوجيه صفحة الدخول إلى:

```
http://your-server/store?mac=$(mac)&ip=$(ip)&router=$(identity)&interface=$(interface-name)&redirect=$(link-redirect)
```

### إعدادات Walled Garden

```bash
/ip hotspot walled-garden add dst-host=your-server-ip
/ip hotspot walled-garden add dst-host=*.your-domain.com
```

## API Endpoints

### الباقات
- `package.list` - قائمة الباقات النشطة
- `package.getById` - تفاصيل باقة
- `package.create` - إنشاء باقة (Admin)
- `package.update` - تحديث باقة (Admin)
- `package.delete` - حذف باقة (Admin)

### الكروت
- `card.list` - قائمة الكروت (Admin)
- `card.create` - إضافة كرت (Admin)
- `card.createBatch` - استيراد مجمع (Admin)
- `card.cleanupExpired` - تنظيف المحجوزات (Admin)

### الطلبات
- `order.create` - إنشاء طلب
- `order.confirmPayment` - تأكيد الدفع
- `order.cancel` - إلغاء طلب
- `order.list` - قائمة الطلبات (Admin)

### بوابات الدفع
- `payment.activeGateways` - البوابات النشطة
- `payment.createGateway` - إضافة بوابة (Admin)
- `payment.updateGateway` - تحديث بوابة (Admin)

## الأمان

- **CSRF Protection**: مدمج في tRPC
- **XSS Protection**: Sanitization للمدخلات
- **Rate Limiting**: مدمج في Hono
- **Webhook Signature Verification**: HMAC-SHA256
- **Idempotency Keys**: منع المعالجة المكررة
- **Pessimistic Locking**: `lockForUpdate()` عند حجز الكروت

## الترخيص

MIT License - حقوق النشر محفوظة.
