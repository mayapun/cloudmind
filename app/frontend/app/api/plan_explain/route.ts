import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const spec = await req.json();
  const r = await fetch(`${API_BASE}/plan_explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
