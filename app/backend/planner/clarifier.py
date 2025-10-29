from typing import List, Dict, Any
from app.backend.planner.planner import Spec, estimate_rps  # reuse your models

ALLOWED_REGIONS = {"us-east4","us-central1","europe-west1","asia-south1"}

def clarifying_questions(raw: Dict[str, Any]) -> List[str]:
    qs: List[str] = []

    # Missing or ambiguous traffic
    traffic = raw.get("traffic", {})
    if traffic.get("rps") is None and traffic.get("dau") is None:
        qs.append("About how many requests per second at peak? (A rough guess is fine).")

    # Region outside allowlist (if UI ever lets custom)
    region = raw.get("region")
    if region and region not in ALLOWED_REGIONS:
        qs.append(f"Region '{region}' isn’t in the allowlist. Can we use one of {sorted(ALLOWED_REGIONS)}?")

    # Budget vs HA / DB tension
    db_type = raw.get("db_type", "none")
    budget = (raw.get("budget") or {}).get("monthly_usd", 500)
    ha = raw.get("ha")
    if db_type in {"postgres","mysql"} and budget < 400 and ha is True:
        qs.append("Your budget is tight for HA database. Is single-zone DB acceptable to save cost? (yes/no)")

    # Latency vs cold-start tension
    latency = (raw.get("latency") or {}).get("p95_ms", 500)
    if latency < 300 and raw.get("workload_type") == "web_api":
        qs.append("To meet p95 < 300ms, are you OK keeping 1+ warm instance (slightly higher cost)?")

    # Private-only intent
    if "private_only" not in raw:
        qs.append("Should the service be accessible only inside the network (private-only)? (yes/no)")

    return qs
