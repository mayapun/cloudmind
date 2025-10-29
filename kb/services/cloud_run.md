---
id: cloud_run
type: service
last_reviewed: 2025-10-28
tags: [gcp, serverless, web_api]
---

# Cloud Run — TL;DR
**Use for:** stateless HTTP APIs with spiky traffic, low ops.

## When to use
- Web APIs with ≤ ~200 rps and p95 ≥ ~150 ms (cold starts acceptable)
- Simple container runtime, scale-to-zero desired

## Defaults / knobs
- min_instances: 0 (set 1+ if p95 target < 300 ms)
- concurrency: 80 (reduce if CPU-heavy)
- ingress: internal for private, external for public

## Limits / gotchas
- Cold starts if min_instances=0
- Private DB access needs **Serverless VPC Access** connector
- Per-request timeout/cpu/mem limits

## Checklist
- [ ] Secret Manager for creds
- [ ] VPC connector sized for throughput
- [ ] Auth (IAP/JWT) if internal
