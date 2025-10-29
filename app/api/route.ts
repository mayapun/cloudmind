import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const spec = await req.json();
  const r = await fetch("http://localhost:8000/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
