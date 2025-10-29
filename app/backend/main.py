from fastapi import FastAPI, HTTPException
from pydantic import ValidationError
from app.backend.planner.planner import Spec, choose_pattern, derive_settings
from app.backend.planner.clarifier import clarifying_questions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/plan")
def plan(spec_like: dict):
    # ask clarifying questions first
    qs = clarifying_questions(spec_like)
    # if critical fields missing, return questions without planning yet
    if qs and any("requests per second" in q for q in qs):
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
