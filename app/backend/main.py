from fastapi import FastAPI, HTTPException, Query
from pydantic import ValidationError
from app.backend.planner.planner import Spec, choose_pattern, derive_settings
from app.backend.planner.clarifier import clarifying_questions
from fastapi.middleware.cors import CORSMiddleware
from app.backend.search import kb_search

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search(q: str = Query(..., min_length=3), k: int = 5):
    try:
        hits = kb_search(q, k=k)
        return {"q": q, "hits": hits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/plan")
def plan(spec_like: dict):
    # ask clarifying questions first
    qs = clarifying_questions(spec_like)
    # if critical fields missing, return questions without planning yet
    if qs and any("requests per second" in str(q) for q in qs):
        return {"status": "needs_clarification", "clarifying_questions": qs}

    # validate and normalize via Pydantic
    try:
        spec = Spec(**spec_like)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())

    pattern = choose_pattern(spec)
    settings = derive_settings(spec)
    return {
        "status": "ok",
        "pattern": pattern,
        "settings": settings,
        "clarifying_questions": qs  # may still include optional questions
    }


@app.post("/plan_explain")
def plan_explain(spec_like: dict):
    """
    Same as /plan but also returns KB citations explaining WHY this pattern/settings
    were chosen (Cloud Run, VPC connector, Cloud SQL, etc.).
    """
    # 1) Clarifying questions first (reuse same logic as /plan)
    qs = clarifying_questions(spec_like)
    if qs and any("requests per second" in str(q) for q in qs):
        return {"status": "needs_clarification", "clarifying_questions": qs}

    # 2) Validate spec
    try:
        spec = Spec(**spec_like)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())

    # 3) Run planner
    pattern = choose_pattern(spec)
    settings = derive_settings(spec)

    # 4) Build a few KB search queries based on the pattern + spec
    queries: list[str] = []

    # General query for the chosen pattern
    queries.append(f"Pattern {pattern} cloud architecture overview")

    # If using SQL, pull Cloud SQL + private IP notes
    if getattr(spec, "db_type", None) in {"postgres", "mysql"}:
        queries.append("Cloud SQL Private IP best practices")
        queries.append("Cloud Run to Cloud SQL Private IP via Serverless VPC Access")

    # If web API on Cloud Run
    if getattr(spec, "workload_type", None) == "web_api":
        queries.append("Cloud Run private internal HTTPS load balancer pattern")

    # Private-only networking
    if getattr(spec, "private_only", False):
        queries.append("internal HTTPS load balancer private only VPC")

    # 5) Run KB search and collect unique citations
    citations = []
    seen_keys = set()

    for q_text in queries:
        try:
            hits = kb_search(q_text, k=2)
        except Exception as e:
            # Don't kill the whole request if KB search fails
            continue

        for h in hits:
            key = (h.get("path"), h.get("ord"))
            if key in seen_keys:
                continue
            seen_keys.add(key)
            citations.append({
                "query": q_text,
                "title": h.get("title"),
                "path": h.get("path"),
                "excerpt": h.get("content"),
                "score": h.get("score"),
            })

    return {
        "status": "ok",
        "pattern": pattern,
        "settings": settings,
        "clarifying_questions": qs,
        "citations": citations,
    }
