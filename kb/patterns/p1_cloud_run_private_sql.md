---
id: P1
type: pattern
last_reviewed: 2025-10-28
tags: [pattern, serverless, private]
---

# P1 — Private Cloud Run + Serverless VPC Access + Cloud SQL (Private IP) + ILB

## Use when
- `workload_type=web_api`, `rps ≤ ~200`, `p95 ≥ ~150ms`, `db_type ∈ {postgres, mysql}`, private-only

## Outputs (what the generator should produce)
- VPC (/16) + 2× /24 subnets
- Cloud NAT
- Serverless VPC Access connector
- Cloud Run service (min_instances per latency)
- Cloud SQL (tier from budget; HA optional)
- Internal HTTPS LB (serverless NEG)

## Trade-offs
- ✅ Low ops, cost effective
- ❗ Connector throughput sizing needed
- ❗ DB connections can spike; use pooling

## Checklist
- [ ] Secrets in Secret Manager
- [ ] CMEK if policy requires
- [ ] Health check tuned
