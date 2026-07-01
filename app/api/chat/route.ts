import { NextRequest, NextResponse } from "next/server";

const FLASK_URL = process.env.FLASK_URL ?? "http://127.0.0.1:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.query || typeof body.query !== "string" || !body.query.trim()) {
      return NextResponse.json(
        { error: "حقل 'query' مطلوب." },
        { status: 400 }
      );
    }

    const flaskRes = await fetch(`${FLASK_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: body.query.trim() }),
      // Give the RAG pipeline up to 60s to respond
      signal: AbortSignal.timeout(60_000),
    });

    const data = await flaskRes.json();

    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "خطأ من الخادم الخلفي." },
        { status: flaskRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[/api/chat proxy] error:", err);

    const isTimeout =
      err instanceof Error && err.name === "TimeoutError";

    return NextResponse.json(
      {
        error: isTimeout
          ? "انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى."
          : "تعذّر الاتصال بالخادم الخلفي. تأكد من تشغيل backend.",
      },
      { status: 503 }
    );
  }
}
