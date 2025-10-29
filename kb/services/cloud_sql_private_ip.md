---
id: cloud_sql_private_ip
type: service
last_reviewed: 2025-10-28
tags: [gcp, database, private_ip]
---

# Cloud SQL (Private IP) — TL;DR
Use Private IP to keep DB off the public internet.

## When to use
- App needs Postgres/MySQL with minimal ops
- Security requires no public IP

## Defaults / knobs
- HA: **off** if budget < $400, **on** otherwise
- Disk: start 20–50 GB, auto-grow enabled
- Auth: use Secret Manager for creds
- CMEK if policy requires

## Limits / gotchas
- Connection count limits (Cloud Run spikes)
- Cross-region latency if app & DB differ

## Checklist
- [ ] Private IP enabled
- [ ] Same region (or low-latency pairing)
- [ ] HA choice matches budget
- [ ] Backups + PITR as needed
