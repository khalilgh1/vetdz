# VetDz Storefront

متجر إلكتروني عربي (RTL) مبني بـ Next.js + Prisma لعرض المنتجات واستقبال الطلبات داخل الجزائر.

## Features

- صفحات كاملة: الرئيسية، تفاصيل المنتج، من نحن، تواصل معنا، الطلبات.
- فلترة المنتجات حسب الجنس والنوع.
- عرض التخفيضات: السعر القديم مشطوب + السعر الجديد + نسبة الخصم.
- صور متعددة للمنتج (Carousel).
- اختيار المتغيرات (مقاس، لون...) حسب المنتج.
- نموذج طلب بدون دفع إلكتروني.
- إرسال الطلب مباشرة إلى التكاملات (البريد/Google Sheets) بدون حفظه في قاعدة البيانات.
- دعم اختياري لإرسال إشعار بريد إلكتروني وإضافة صف إلى Google Sheets.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma ORM + PostgreSQL (Neon)
- TypeScript

## Local Setup

1. تثبيت الاعتمادات:

```bash
npm install
```

2. إعداد متغيرات البيئة داخل `.env.local`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
ADMIN_AUTH_SECRET="your-strong-secret"
```

3. توليد Prisma Client ومزامنة المخطط:

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

## Deployment (Vercel)

1. ادفع آخر نسخة من الكود إلى GitHub.
2. داخل Vercel أضف متغيرات البيئة التالية على الأقل:
	- `DATABASE_URL`
	- `DIRECT_URL`
	- `ADMIN_AUTH_SECRET`
3. متغيرات التكاملات اختيارية حسب الاستخدام (`SMTP_*`, `GOOGLE_*`, `CLOUDINARY_*`).
4. أمر البناء في المشروع يشغل Prisma تلقائيًا (`prisma generate && next build`).
5. إذا كان لديك Deploy قديم، نفذ إعادة نشر مع مسح Build Cache مرة واحدة.

## Optional Integrations

عند تعبئة متغيرات SMTP و Google Sheets في `.env.local` سيتم تنفيذها تلقائيًا عند إرسال الطلب من `app/api/orders/route.ts`.
