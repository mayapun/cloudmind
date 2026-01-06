import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const k = parseInt(searchParams.get("k") || "5", 10);

  // Forward the search query to your backend search API
  const r = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(q)}&k=${k}`);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
