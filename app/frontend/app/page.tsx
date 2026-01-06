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
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[]>([]);

  async function submit() {
    const res = await fetch("/api/plan_explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: spec,
    });
    const data = await res.json();
    setResult(data);
  }

  async function runSearch() {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&k=5`);
    const data = await r.json();
    setHits(data.hits || []);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Search UI */}
      <div className="flex gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Search KB: try 'Serverless VPC Access'"
               value={q} onChange={e=>setQ(e.target.value)} />
        <button className="px-3 py-2 border rounded" onClick={runSearch}>Search</button>
      </div>
      <ul className="space-y-3">
        {hits.map((h, i) => (
          <li key={i} className="border p-3">
            <div className="text-sm text-gray-500">{h.path} · score {h.score.toFixed(3)}</div>
            <div className="font-medium">{h.title} (#{h.ord})</div>
            <pre className="whitespace-pre-wrap text-sm">{h.content}</pre>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl font-semibold mb-4">Cloud AI — Planner</h1>
      <textarea className="w-full h-[400px]  border p-3 font-mono resize-y"
        value={spec} onChange={e=>setSpec(e.target.value)} />
      <button className="mt-3 px-4 py-2 border rounded" onClick={submit}>
        Plan
      </button>
      <pre className="mt-4 p-3 bg-gray-50 border overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      {result?.citations && result.citations.length > 0 && (
      <div className="mt-4 space-y-3">
        <h2 className="font-semibold">KB citations (why this design)</h2>
        {result.citations.map((c: any, i: number) => (
          <div key={i} className="border p-3 rounded bg-white">
            <div className="text-sm text-gray-500">
              {c.path} · from query: <code>{c.query}</code>
            </div>
            <div className="font-medium">{c.title}</div>
            <pre className="whitespace-pre-wrap text-sm mt-1">
              {c.excerpt}
            </pre>
            <div className="text-xs text-gray-400 mt-1">
              score: {c.score.toFixed(3)}
            </div>
          </div>
        ))}
      </div>
    )}

    </main>
  );
}
