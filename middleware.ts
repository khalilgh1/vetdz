import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignore API routes, admin routes, Next.js internal files, favicon and public files
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/products") ||
        pathname.includes(".") // static files: images, css, favicon.ico, etc.
    ) {
        return NextResponse.next();
    }

    // Check if pathname already has a supported locale
    const pathnameHasLocale = LOCALES.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Redirect to default locale preserving search params
    const search = request.nextUrl.search;
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    if (search) {
        url.search = search;
    }

    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - /api routes
         * - /admin routes
         * - /_next (Next.js internals)
         * - static files (images, icons, etc.)
         */
        "/((?!api|admin|_next/static|_next/image|favicon.ico).*)",
    ],
};
