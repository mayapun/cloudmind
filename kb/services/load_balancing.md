---
id: load_balancing
type: service
last_reviewed: 2025-10-28
tags: [gcp, networking, lb]
---

# Load Balancing — TL;DR
Choose **External HTTPS LB** for public traffic, **Internal HTTPS LB** for private.

## When to use
- Internal: corporate-only, service-to-service
- External: internet-facing apps (use Cloud Armor)

## Defaults / knobs
- Serverless NEG for Cloud Run
- Health checks tuned to app startup time

## Limits / gotchas
- Wrong NEG type breaks routing
- SSL cert provisioning delays

## Checklist
- [ ] Right LB type (internal vs external)
- [ ] Cloud Armor for external
- [ ] Health checks aligned with app readiness
