# VetDz Storefront

متجر إلكتروني عربي (RTL) مبني بـ Next.js + Prisma لعرض المنتجات واستقبال الطلبات داخل الجزائر.

## Features

- صفحات كاملة: الرئيسية، تفاصيل المنتج، من نحن، تواصل معنا، الطلبات.
- فلترة المنتجات حسب الجنس والنوع.
- عرض التخفيضات: السعر القديم مشطوب + السعر الجديد + نسبة الخصم.
- صور متعددة للمنتج (Carousel).
- اختيار المتغيرات (مقاس، لون...) حسب المنتج.
- نموذج طلب بدون دفع إلكتروني.
- حفظ الطلب في قاعدة البيانات عبر Prisma.
- دعم اختياري لإرسال إشعار بريد إلكتروني وإضافة صف إلى Google Sheets.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma ORM + SQLite
- TypeScript

## Local Setup

1. تثبيت الاعتمادات:

```bash
npm install
```

2. نسخ ملف البيئة:

```bash
copy .env.example .env
```

3. إنشاء قاعدة البيانات وتوليد Prisma Client:

```bash
npx prisma generate
npx prisma db push
```

4. تعبئة بيانات تجريبية:

```bash
npm run db:seed
```

5. تشغيل المشروع:

```bash
npm run dev
```

## Optional Integrations

عند تعبئة متغيرات SMTP و Google Sheets في `.env` سيتم تنفيذها تلقائيًا عند إرسال الطلب من `app/api/orders/route.ts`.
