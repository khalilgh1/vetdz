import { NextResponse } from "next/server";
import { Gender } from "@prisma/client";
import { getProductsPage } from "@/lib/store";

function parseGender(value: string | null): Gender | "ALL" {
    if (value === "MALE" || value === "FEMALE" || value === "ALL") {
        return value;
    }

    return "ALL";
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "8");
    const gender = parseGender(url.searchParams.get("gender"));
    const type = url.searchParams.get("type") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;

    const result = await getProductsPage({
        page: Number.isFinite(page) ? page : 1,
        limit: Number.isFinite(limit) ? limit : 8,
        gender,
        productTypeSlug: type,
        search,
    });

    return NextResponse.json(result);
}