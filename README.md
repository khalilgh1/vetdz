# VetDz Store

VetDz is a bilingual e-commerce platform for Algeria built with Next.js and Prisma. It includes a customer storefront, an order workflow, and a protected admin dashboard for managing catalog content.

## Features

### Customer Storefront

- Homepage with promotional sections and featured products.
- Catalog page with product browsing and filtering.
- Product detail pages with image carousels and variant selection.
- Category and product pages for a structured shopping experience.
- About and contact pages for store information and support.
- Order page for submitting purchases without online payment.
- Shipping-aware checkout that adds the delivery fee to the total.

### Product Experience

- Product filtering by gender and product type.
- Discount display with original price, discounted price, and savings.
- Multiple product images with carousel support.
- Product variations such as size, color, and other attributes.
- Featured product support for homepage and merchandising.

### Admin Dashboard

- Protected admin login and logout flow.
- Admin dashboard at `/admin` for managing store content.
- Product management with image uploads through Cloudinary.
- Product type management.
- Variation and variation value management.
- Testimonial management.
- Authentication-protected API routes for all admin operations.

### Integrations

- Optional email notifications for new orders.
- Optional Google Sheets order logging.
- Prisma-based data access with PostgreSQL.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Cloudinary for image uploads

## Project Structure

- `app/` application routes, pages, and API endpoints.
- `components/` shared UI and admin dashboard components.
- `lib/` business logic, data access, auth, formatting, and integrations.
- `generated/` Prisma client outputs.
- `prisma/` database schema and seed data.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with the required environment variables:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
ADMIN_AUTH_SECRET="your-strong-secret"
```

3. Generate the Prisma client and sync the schema:

```bash
npx prisma generate
npx prisma db push
```

4. Seed the database with sample data:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

## Deployment

1. Push the latest code to GitHub.
2. Add these environment variables in Vercel at minimum:

- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_AUTH_SECRET`

3. Add optional integration variables only if you use them:

- `SMTP_*` or `EMAIL_HOST_*`
- `GOOGLE_*`
- `CLOUDINARY_*`

4. The build process runs Prisma generation automatically before Next.js builds.
5. If you are upgrading an existing deployment, redeploy once with the build cache cleared.

## Optional Integrations

When the SMTP and Google Sheets variables are configured in `.env.local`, new orders sent from `app/api/orders/route.ts` can trigger email notifications and spreadsheet logging automatically.

## Notes

- The admin dashboard is protected and requires authentication before access.
