"use client";

import { useMemo, useState } from "react";

type PlanResult =
  | {
      status: "needs_clarification";
      clarifying_questions: string[];
    }
  | {
      status: "ok";
      pattern: string;
      settings: any;
      clarifying_questions?: string[];
      citations?: Array<{
        title: string;
        path: string;
        excerpt: string;
        score: number;
        query?: string;
      }>;
    }
  | any;

function safeJsonParse(text: string): { ok: true; value: any } | { ok: false; error: string } {
  try {
    const v = JSON.parse(text);
    return { ok: true, value: v };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function prettyJson(v: any) {
  return JSON.stringify(v, null, 2);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-10 text-center">
      <div>
        <div className="mx-auto mb-3 h-10 w-10 rounded-2xl bg-slate-100" />
        <p className="text-sm font-medium text-slate-700">Your architecture plan will appear here.</p>
        <p className="mt-1 text-sm text-slate-500">
          Fill the workload spec and click <span className="font-medium">Plan Infrastructure</span>.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [specText, setSpecText] = useState(
    `{
  "workload_type": "web_api",
  "region": "us-east4",
  "traffic": { "dau": 1200 },
  "latency": { "p95_ms": 280 },
  "budget": { "monthly_usd": 600 },
  "private_only": true,
  "db_type": "postgres"
}`
  );

  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isPlanning, setIsPlanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const parsed = useMemo(() => safeJsonParse(specText), [specText]);

  function formatJson() {
    const res = safeJsonParse(specText);
    if (!res.ok) {
      setJsonError(res.error);
      return;
    }
    setJsonError(null);
    setSpecText(prettyJson(res.value));
  }

  async function runPlan() {
    setApiError(null);

    const res = safeJsonParse(specText);
    if (!res.ok) {
      setJsonError(res.error);
      return;
    }
    setJsonError(null);

    setIsPlanning(true);
    try {
      // ✅ Use your Next.js proxy route (recommended)
      // If you don't have it yet, see section #2 below.
      const r = await fetch("/api/plan_explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res.value),
      });

      const data = await r.json().catch(() => ({}));
      setRawResponse(data);

      if (!r.ok) {
        setApiError(data?.detail ? JSON.stringify(data.detail) : "Request failed");
        setPlan(null);
        return;
      }

      setPlan(data);
    } catch (e: any) {
      setApiError(e?.message || "Network error");
      setPlan(null);
    } finally {
      setIsPlanning(false);
    }
  }

  async function generateTfvars() {
    setApiError(null);

    const res = safeJsonParse(specText);
    if (!res.ok) {
      setJsonError(res.error);
      return;
    }
    setJsonError(null);

    setIsGenerating(true);
    try {
      const r = await fetch("/api/generate_tfvars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res.value),
      });
      const data = await r.json().catch(() => ({}));
      setRawResponse((prev: any) => ({ ...(prev || {}), generate: data }));

      if (!r.ok) {
        setApiError(data?.detail ? JSON.stringify(data.detail) : "Generate failed");
        return;
      }

      // Keep plan visible; just annotate success
      setApiError(null);
      alert(`✅ Generated: ${data?.path || "infra/envs/dev/generated.auto.tfvars"}`);
    } catch (e: any) {
      setApiError(e?.message || "Network error");
    } finally {
      setIsGenerating(false);
    }
  }

  // Helpers to render summary from plan
  const summary = useMemo(() => {
    if (!plan || plan.status !== "ok") return null;
    const settings = plan.settings || {};
    const cr = settings.cloud_run || {};
    const sql = settings.sql || {};
    return {
      pattern: plan.pattern,
      region: safeJsonParse(specText).ok ? safeJsonParse(specText).value.region : undefined,
      cloudRun: {
        minInstances: cr.min_instances,
        concurrency: cr.concurrency,
      },
      sql: {
        enabled: sql.enabled,
        engine: sql.engine,
        tier: sql.tier,
        ha: sql.ha,
      },
    };
  }, [plan, specText]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              CloudMind <span className="text-slate-400">— Planner</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Describe your workload and generate a cloud architecture plan.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge>Grey/Navy</Badge>
            <Badge>Deterministic Planner</Badge>
            <Badge>Terraform Ready</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Top alerts */}
        {jsonError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-medium">JSON issue:</span> {jsonError}
          </div>
        ) : null}

        {apiError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <span className="font-medium">API issue:</span> {apiError}
          </div>
        ) : null}

        {/* Two columns */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Spec */}
          <Card
            title="Workload Specification"
            subtitle="Fill the JSON requirements (v0.1)."
            right={
              <button
                onClick={formatJson}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                type="button"
              >
                Format JSON
              </button>
            }
          >
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              spellCheck={false}
              className="h-[420px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {parsed.ok ? "✓ JSON looks valid" : "⚠ Invalid JSON"}
              </div>

              <button
                onClick={runPlan}
                disabled={isPlanning}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                type="button"
              >
                {isPlanning ? "Planning..." : "Plan Infrastructure"}
              </button>
            </div>
          </Card>

          {/* Right: Result */}
          <div className="space-y-6">
            {!plan ? (
              <EmptyState />
            ) : plan.status === "needs_clarification" ? (
              <Card
                title="Clarifying Questions"
                subtitle="We need a bit more info before producing a plan."
                right={<Badge>Action needed</Badge>}
              >
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-amber-900">
                    {(plan.clarifying_questions || []).map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Update the JSON on the left (e.g., add traffic RPS/DAU) and click <b>Plan</b> again.
                </p>
              </Card>
            ) : plan.status === "ok" ? (
              <>
                <Card
                  title="Recommended Architecture"
                  subtitle="High-level decision summary (human readable)."
                  right={<Badge>{summary?.pattern || plan.pattern}</Badge>}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-medium text-slate-500">Compute</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">Cloud Run</div>
                        <div className="mt-2 text-xs text-slate-600">
                          min instances: <b>{summary?.cloudRun?.minInstances ?? "-"}</b> · concurrency:{" "}
                          <b>{summary?.cloudRun?.concurrency ?? "-"}</b>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-medium text-slate-500">Database</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {summary?.sql?.enabled ? `Cloud SQL (${summary?.sql?.engine})` : "None"}
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          tier: <b>{summary?.sql?.tier ?? "-"}</b> · HA: <b>{String(summary?.sql?.ha ?? "-")}</b>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>Region: {summary?.region || "—"}</Badge>
                        <Badge>Pattern: {summary?.pattern || plan.pattern}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        This summary is derived from the planner’s deterministic rules + settings.
                      </p>
                    </div>

                    {plan.clarifying_questions?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-medium text-slate-500">Optional follow-ups</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {plan.clarifying_questions.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </Card>

                <Card
                  title="Generate Infrastructure"
                  subtitle="Write Terraform variables from this plan (P1 v0.1)."
                  right={<Badge>tfvars</Badge>}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      This will call <code className="rounded bg-slate-100 px-1 py-0.5">/generate_tfvars</code> and
                      write <code className="rounded bg-slate-100 px-1 py-0.5">generated.auto.tfvars</code>.
                    </p>
                    <button
                      onClick={generateTfvars}
                      disabled={isGenerating}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                      type="button"
                    >
                      {isGenerating ? "Generating..." : "Generate tfvars"}
                    </button>
                  </div>
                </Card>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        {/* Bottom: Raw Output */}
        <Card
          title="Planner Output"
          subtitle="Raw JSON response (debug/advanced)."
          right={<Badge>JSON</Badge>}
        >
          <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-900">
            {prettyJson(rawResponse ?? plan ?? { hint: "Click Plan Infrastructure to see output." })}
          </pre>
        </Card>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-500">
          Built for focused infrastructure planning · v0.1
        </div>
      </footer>
    </div>
  );
}
