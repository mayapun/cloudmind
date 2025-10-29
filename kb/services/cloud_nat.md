---
id: cloud_nat
type: service
last_reviewed: 2025-10-28
tags: [gcp, networking, nat]
---

# Cloud NAT — TL;DR
Outbound internet for private workloads without public VM IPs.

## When to use
- Private services (Run via VPC, GKE) need egress to APIs/repos

## Defaults / knobs
- Auto IP allocation OK for small envs
- Region = VPC subnets’ region
- Consider logging for troubleshooting

## Limits / gotchas
- Idle timeouts may break long-lived conns
- SNAT port exhaustion at very high scale

## Checklist
- [ ] NAT on relevant subnets
- [ ] Logs enabled (at least error)
