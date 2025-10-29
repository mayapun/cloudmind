import pytest
from app.backend.planner.planner import Spec, choose_pattern, derive_settings

def test_choose_pattern_low_traffic():
    """Should pick P1 for low traffic and moderate latency."""
    spec = Spec(
        workload_type="web_api",
        region="us-east4",
        traffic={"rps": 50},
        latency={"p95_ms": 250},
        budget={"monthly_usd": 600},
        db_type="postgres"
    )
    pattern = choose_pattern(spec)
    assert pattern == "P1"


def test_choose_pattern_high_traffic():
    """Should pick P3 for higher traffic."""
    spec = Spec(
        workload_type="web_api",
        region="us-east4",
        traffic={"rps": 500},
        latency={"p95_ms": 120},
        budget={"monthly_usd": 1000},
        db_type="postgres"
    )
    pattern = choose_pattern(spec)
    assert pattern == "P3"


def test_derive_settings_budget_effect():
    """Budget below $400 should downgrade SQL tier and disable HA."""
    spec = Spec(
        workload_type="web_api",
        region="us-east4",
        traffic={"rps": 100},
        latency={"p95_ms": 200},
        budget={"monthly_usd": 300},
        db_type="postgres"
    )
    settings = derive_settings(spec)
    sql = settings["sql"]
    assert sql["tier"] == "db-custom-1-3840"
    assert sql["ha"] is False
