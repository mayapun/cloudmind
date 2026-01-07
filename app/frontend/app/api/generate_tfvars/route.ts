import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch("http://localhost:8000/generate_tfvars", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
