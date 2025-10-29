---
id: serverless_vpc_access
type: service
last_reviewed: 2025-10-28
tags: [gcp, networking, vpc]
---

# Serverless VPC Access — TL;DR
Lets Cloud Run reach resources on a VPC (e.g., Cloud SQL Private IP).

## When to use
- Cloud Run → private databases or internal LBs
- Egress without public IP

## Defaults / knobs
- connector region = app region
- throughput sizing: start small; scale if 5xx/timeouts occur
- one connector per VPC/region per env is typical

## Limits / gotchas
- Mis-sized connector causes latency/timeouts
- Needs correctly routed subnets/NAT for egress

## Checklist
- [ ] Place connector in same region
- [ ] Ensure NAT for internet egress if needed
- [ ] Test with low RPS; scale as needed
