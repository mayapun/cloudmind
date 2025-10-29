---
id: P3
type: pattern
last_reviewed: 2025-10-28
tags: [pattern, gke, private]
---

# P3 — GKE Autopilot (Private) + ILB + Cloud SQL (Private IP)

## Use when
- rps > ~200, strict latency (<150ms), sidecars/custom runtime

## Outputs
- Private GKE cluster, Workload Identity
- ILB + NEG
- Cloud NAT
- Cloud SQL (HA)
- Namespace-level policies

## Trade-offs
- ✅ Flexibility & performance
- ❗ More ops & networking complexity
