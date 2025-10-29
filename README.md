# cloudmind
### 1) Map Schema → Pattern (Deterministic Rules)

Start with **3 simple patterns:**

---

#### 🟢 **P1: Private Cloud Run + Cloud SQL (Private IP) + ILB**
**Use when:**
- `workload_type = web_api`
- `rps ≤ 200` and `latency.p95_ms ≥ 150`
- `db_type ∈ {postgres, mysql}`

**Why:** Cheapest managed, good-enough latency, low operational overhead.

---

#### 🟡 **P2: Public Cloud Run + Cloud SQL**
**Use when:**
- Same as **P1**, but **public ingress** is acceptable and no **internal-only** requirement.

---

#### 🔵 **P3: GKE Autopilot (Private) + ILB + Cloud SQL**
**Use when:**
- `rps > 200` or needs **custom runtimes**, **sidecars**, or **long-running** workloads
- **Stricter latency** < `150ms` or **complex networking** requirements

---

**Later add:**
- `db_type = none` → **Cloud Run + Cloud Storage**  
- `event_consumer` → **Pub/Sub + Cloud Run**



### 🔧2) For Each Chosen Pattern, Compute:

---

#### 🌐 **Networking**
- Create **VPC** + 2–3 **subnets** (region `Z1/Z2/Z3`)
- Add **Cloud NAT**
- **P1/P2:** Use **Serverless VPC Access Connector** sized from `rps`

---

#### 💻 **Compute**
- **Cloud Run:**  
  Set `min_instances` based on latency target  
  → e.g., `min_instances = 1` if `p95 < 300ms`; else `0`
- **Concurrency estimate:** start at `80`; reduce if **CPU-heavy**

---

#### 🗄️ **Database**
- If `db_type ∈ {postgres, mysql}`:
  - Use **Single-zone** if `budget < $400`, else **HA**
  - Start with **20–50GB** storage
  - Use **Private IP** connections

---

#### ⚖️ **Load Balancing**
- **P1/P3:** Internal HTTPS LB (`serverless NEG` or `ILB + NEG`)
- **P2:** External HTTPS LB + **Cloud Armor** (basic rules)

---

#### 💰 **Cost Rough-Cut**
- Use simple tables:
  - Serverless request cost  
  - CPU/memory seconds  
  - SQL tier pricing
- If `cost > budget × 1.3` →  
  → **Downgrade HA**, **reduce min instances**, or **switch tiers** and **re-try**
