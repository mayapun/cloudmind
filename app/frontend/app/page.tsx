"use client";
import "./globals.css";
import { useState } from "react";

export default function Home() {
  const [spec, setSpec] = useState(`{
  "workload_type":"web_api",
  "region":"us-east4",
  "traffic":{"dau":1200},
  "latency":{"p95_ms":280},
  "budget":{"monthly_usd":600},
  "private_only": true,
  "db_type":"postgres"
}`);
  const [result, setResult] = useState<any>(null);

  async function submit() {
    const res = await fetch("http://localhost:8000/plan", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: spec
    });
    setResult(await res.json());
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Cloud AI — Planner</h1>
      <textarea className="w-full h-[400px]  border p-3 font-mono resize-y"
        value={spec} onChange={e=>setSpec(e.target.value)} />
      <button className="mt-3 px-4 py-2 border rounded" onClick={submit}>
        Plan
      </button>
      <pre className="mt-4 p-3 bg-gray-50 border overflow-auto">{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
