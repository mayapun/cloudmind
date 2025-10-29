---
id: cloud_armor
type: service
last_reviewed: 2025-10-28
tags: [gcp, security, waf]
---

# Cloud Armor — TL;DR
WAF/DDoS protection for external HTTP(S) LBs.

## When to use
- Public apps; basic OWASP protection

## Defaults / knobs
- Start with managed protection rule set
- Rate limit abusive IPs

## Limits / gotchas
- Overly strict rules can block legit traffic

## Checklist
- [ ] Managed rules on
- [ ] Rate limiting as needed
- [ ] Monitor and tune
