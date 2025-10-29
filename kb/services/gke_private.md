---
id: gke_private
type: service
last_reviewed: 2025-10-28
tags: [gcp, gke, networking]
---

# GKE Autopilot (Private) — TL;DR
Use when rps is high, custom runtimes/sidecars, or strict latency.

## When to use
- Complex workloads beyond Cloud Run
- Need pod-level networking or sidecars

## Defaults / knobs
- Private cluster, master authorized networks
- ILB for internal traffic
- Workload Identity for SA mapping

## Limits / gotchas
- Operational surface > Cloud Run
- Network policy & DNS tuning required

## Checklist
- [ ] Private cluster
- [ ] Workload Identity
- [ ] ILB + health checks
