from pydantic import BaseModel, Field
from typing import Optional, Literal

class Traffic(BaseModel):
    rps: Optional[int] = None
    dau: Optional[int] = None

class Latency(BaseModel):
    p95_ms: int = 500

class Budget(BaseModel):
    monthly_usd: int = 500

class Spec(BaseModel):
    workload_type: Literal["web_api","batch_job","event_consumer","data_pipeline"]
    region: Literal["us-east4","us-central1","europe-west1","asia-south1"]
    traffic: Traffic
    latency: Latency = Latency()
    budget: Budget = Budget()
    db_type: Literal["none","postgres","mysql","firestore","bigtable","redis"] = "none"

def estimate_rps(t: Traffic) -> int:
    if t.rps is not None: return t.rps
    if t.dau is not None:
        return max(1, round(t.dau/86400*10))
    return 5

def choose_pattern(spec: Spec) -> str:
    rps = estimate_rps(spec.traffic)
    if spec.workload_type == "web_api":
        if rps <= 200 and spec.latency.p95_ms >= 150 and spec.db_type in {"postgres","mysql","none"}:
            return "P1"  # Private Cloud Run (+ SQL if needed)
        else:
            return "P3"  # GKE Autopilot private
    # Extend for other workload_types...
    return "P2"

def derive_settings(spec: Spec) -> dict:
    rps = estimate_rps(spec.traffic)
    min_instances = 1 if spec.latency.p95_ms < 300 else 0
    sql_tier = "db-custom-1-3840" if spec.budget.monthly_usd < 400 else "db-custom-2-7680"
    ha = False if spec.budget.monthly_usd < 400 else True
    return {
        "rps": rps,
        "cloud_run": {"min_instances": min_instances, "concurrency": 80},
        "sql": {"enabled": spec.db_type in {"postgres","mysql"},
                "engine": spec.db_type, "tier": sql_tier, "ha": ha}
    }

if __name__ == "__main__":
    spec = Spec(
        workload_type="web_api",
        region="us-east4",
        traffic={"dau": 1200},
        latency={"p95_ms": 280},
        budget={"monthly_usd": 600},
        db_type="postgres"
    )
    print("Pattern:", choose_pattern(spec))
    print("Settings:", derive_settings(spec))
