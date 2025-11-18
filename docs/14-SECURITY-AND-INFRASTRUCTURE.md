# 14-SECURITY-AND-INFRASTRUCTURE.md

## 1. Purpose

This doc defines The Wove's security and infrastructure posture, with special focus on:

- Safe multi-tenancy.

- Secure BYO keys and secrets management.

- Opinionated but approachable deployment defaults.

---

## 2. Threat Model (High Level)

We assume:

- Multi-tenant SaaS environment (many users/orgs sharing infra).

- Attackers may be:

  - Malicious users (trying to exfiltrate others' data or secrets).

  - External actors (credential stuffing, token theft, bot attacks).

  - Accidental misconfiguration by legitimate users.

We design to mitigate:

- Cross-tenant data leakage.

- Secrets exfiltration (esp. BYO provider keys).

- Credential/session theft.

- Unsafe deployment defaults.

---

## 3. Authentication & Sessions

- Primary login:

  - Passwordless email magic links and/or OAuth (GitHub, Google, etc.).

- Sessions:

  - HttpOnly, Secure cookies.

  - Short access lifetime, longer refresh tokens where needed.

- Optional:

  - 2FA for org admins.

  - SSO for enterprise (OIDC/SAML).

Session hardening:

- Device/session list with revoke buttons.

- Automatic invalidation on:

  - Passwordless token reuse.

  - Changes to critical account details.

---

## 4. Authorization & Multi-Tenancy

### 4.1 Org & Project Boundaries

- Every resource (Project, Room, Pipeline, Secret) is owned by:

  - An org, or

  - A user (personal space).

- Authorization checks:

  - Backend enforces:

    - Scope-based checks (user roles).

    - Org membership checks.

    - Project-specific ACLs.

- We avoid trusting only:

  - Frontend state.

  - "Org id in the URL". Everything is server-enforced.

### 4.2 Row-Level Security

Where reasonable:

- Use row-level security policies at database level (Postgres):

  - Ensure user/org can only see rows they own or are invited to.

  - Defense-in-depth for application bugs.

---

## 5. Data Protection

### 5.1 At Rest

- Databases (Postgres, Redis snapshots) and object storage:

  - Encrypted at rest using cloud provider primitives.

- Secrets (API keys, tokens):

  - Encrypted with a dedicated KMS key / secret manager.

  - Stored in a `secrets` table with:

    - `ciphertext` (never plaintext).

    - `key_id` (if using custom KMS key per org).

    - Metadata only (name, provider, scope, env, created_at).

### 5.2 In Transit

- All client ↔ server and server ↔ server communications:

  - TLS enforced.

- Internal services:

  - mTLS or network policy restrictions where feasible.

---

## 6. Secrets & BYO Provider Keys

This is the critical area.

### 6.1 Secret Scopes

Secrets support multiple scopes:

- **User-scoped**  

  – Personal experiments and pipelines.

- **Project-scoped**  

  – API keys used only inside a specific project (good for third-party APIs).

- **Org-scoped**  

  – Shared provider keys (e.g. AI keys, Git deploy keys).

And environment:

- `dev`, `preview`, `prod` – enabling different keys per stage.

### 6.2 Secret Lifecycle

**Create**

- Performed via:

  - Web UI (masked input).

  - `POST /api/secrets` (backend-only).

- On creation:

  - Plaintext key is immediately encrypted server-side.

  - Only a **one-time tail** of the key may be shown (e.g. last 4 chars) for confirmation.

**Read**

- Plaintext secrets are **never returned** via API.

- Only metadata and last few characters are displayed to owners, e.g.:

  - `sk-live-************abcd`

**Update / Rotation**

- To rotate:

  - Create a new secret (or update existing via controlled flow).

  - Update pipelines or project env config to use new secret id.

- Keys support:

  - `rotated_from_secret_id` for lineage.

**Delete**

- Deleting a secret:

  - Marks as inactive (soft delete).

  - Calls to providers using that secret will fail fast with a clear error.

  - User is prompted to:

    - Update pipelines/projects that referenced it.

### 6.3 Access Patterns & Permissions

- Only backend services handling provider calls can:

  - Decrypt secrets.

  - Use them to call external APIs.

- No direct client-side access:

  - Frontend cannot call `GET /api/secrets/:id/value`.

  - No GraphQL "resolver" or custom route returns plaintext.

- Logging:

  - Logs never include:

    - Full Authorization headers.

    - Full keys or tokens.

  - Use redaction middleware.

### 6.4 Using BYO AI Keys

The AI Routing Layer:

1. Receives a pipeline step + `provider_ref`.

2. Resolves to a secret id by:

   - Checking project-level override.

   - Falling back to org-level default.

   - Optionally user-level fallback.

3. Fetches encrypted secret from DB.

4. Decrypts only in memory in the AI router service.

5. Calls provider API with this key.

6. Immediately discards plaintext when request completes or fails.

Key safety measures:

- In-memory lifetime minimized.

- No serialization of secret in:

  - Queue payloads,

  - Logs,

  - Error messages.

- Rate limits applied per secret to:

  - Avoid abuse.

  - Honor user/org budgets.

### 6.5 Provider Policies

We treat BYO keys with the following assumptions:

- They may have:

  - Legal / ToS restrictions (e.g. no proxying for third parties).

- Per-provider configuration:

  - May enforce rules:

    - "This key can only be used for this org's traffic."

    - "This key cannot be reused by sub-tenants."

- Wove-hosted keys (if used) are:

  - Clearly separated from BYO keys.

### 6.6 Secrets in User Projects

Project code may itself need secrets at runtime (e.g. deployed apps).

We provide:

- A **parameterized environment** for deployed apps:

  - `PROJECT_SECRET_<NAME>` mapping.

- UI for binding project secrets:

  - "Inject this secret into the runtime environment for dev/preview/prod."

- Protections:

  - Apps built via The Wove **never leak** these env values back into:

    - Build logs,

    - Client-visible pages,

    - Public exports.

  - We provide static analysis and runtime warnings for:

    - Accidental inclusion of secrets in client bundles.

---

## 7. Infrastructure Overview

### 7.1 Core Components

- **Frontend**:

  - React/Vite app.

  - Served via CDN (e.g. Cloudflare Pages).

- **Backend API**:

  - Fastify (TypeScript).

  - Runs as:

    - Containerized services (Kubernetes, Fly, etc.) or

    - Serverless functions (where appropriate).

  - Exposes:

    - REST/JSON.

    - WebSockets (for Rooms, multiplayer).

- **State & Storage**:

  - Postgres: core data (orgs, projects, remixes, pipelines).

  - Redis:

    - Caching,

    - Pub/Sub for real-time updates.

  - Object Storage (S3-compatible / R2):

    - Project assets,

    - Build artifacts,

    - Session recordings (if enabled).

- **Deploy Target for User Apps**:

  - Cloudflare Workers/Pages or equivalent edge runtime.

### 7.2 Network Segmentation

Where possible:

- Public-facing edge receives traffic.

- Internal services:

  - Behind private networks or VPCs.

  - Restricted by security groups/network policies.

---

## 8. Build & Deploy Pipeline

### 8.1 Internal Application

- CI/CD:

  - Runs tests, lint, type check.

  - Security checks:

    - Dependency scanning (SCA).

    - Static analysis on critical paths.

- Deployment:

  - Blue/green or rolling rollout.

  - Health checks on API endpoints.

### 8.2 User Projects

Default deployment path for a user project:

1. Build:

   - Run builds in isolated workers / containers.

   - Limited resource and time.

2. Scan:

   - Basic static checks for:

     - Well-known secret patterns in committed code.

3. Deploy:

   - To edge environment.

   - With environment-specific secrets injected.

Security considerations:

- Builds happen in a sandbox:

  - No direct DB access.

  - Limited filesystem.

- Artifacts:

  - Only static assets and edge scripts deployed.

  - No arbitrary long-lived servers started by user code (unless explicitly supported).

---

## 9. Logging, Monitoring, and Audit

### 9.1 Application Logging

- Structured logs:

  - Correlation ids per request.

  - Severity levels.

- Redaction:

  - Request/response bodies inspected; secrets scrubbed.

  - Headers like `Authorization` redacted.

### 9.2 Metrics & Health

- Metrics for:

  - API latency/error rates.

  - Pipeline success/failure.

  - Real-time system health (rooms, presence).

### 9.3 Audit Logs

For sensitive actions:

- Secret creation/rotation/deletion.

- Role changes (admin, steward, room host).

- Org membership changes.

- Moderation actions.

We record:

- Who performed action.

- When.

- What changed.

- Origin (IP/device).

Audit logs:

- Visible (read-only) to:

  - Org admins (for org-scoped events).

  - Security/ops team (for global events).

---

## 10. Abuse Prevention & Rate Limiting

- Per-IP and per-user/org rate limits for:

  - Authentication endpoints.

  - Projects API.

  - Pipeline runs.

- Bot detection:

  - Captcha or equivalent for:

    - Suspicious signup patterns.

    - Repeated failed logins.

For BYO keys:

- Per-secret guardrails:

  - Max concurrent calls.

  - Max tokens/day (approximate).

  - Hard "kill switch" if abuse is detected.

---

## 11. Privacy & Data Retention

- Configurable retention policies for:

  - Logs,

  - Room histories,

  - Session recordings (if implemented).

- Users/orgs can:

  - Request deletion of:

    - Projects,

    - Pipelines,

    - Associated runtime data (within legal and technical limits).

---

## 12. Future Hardening

Future directions (non-MVP but on path):

- Independent security review and penetration testing.

- Bug bounty program.

- SOC2/ISO-style compliance baseline.

- Fine-grained data residency controls for larger customers.

---

Security and infra aren't just back-office details here—they're what make **Remix Culture + BYO keys + AI-native pipelines** trustworthy in a multi-tenant universe.

