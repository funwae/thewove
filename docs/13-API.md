# 13-API.md

## 1. Purpose

The Wove API surface exists for two main reasons:

1. **Let people and tools extend The Wove**  

   – Automations, bots, custom dashboards, external CLIs.

2. **Let AI and external providers integrate cleanly**  

   – BYO AI keys, CI/CD, Git, and other dev infra.

This doc describes:

- API design philosophy.

- Authentication & authorization.

- Core API domains (Projects, Rooms, Pipelines, Events).

- BYO provider integration (especially AI providers).

- Webhooks and bot/agent patterns.

---

## 2. Design Principles

1. **Project-first, Room-aware**  

   Most APIs operate in the context of a Project or a Room; they should feel natural to people who live in the editor.

2. **Least privilege by default**  

   API tokens and BYO keys both use scopes and narrow audiences.

3. **Composable, not monolithic**  

   Each domain (Projects, Rooms, Pipelines, Secrets) has clean, decoupled endpoints.

4. **Safe multi-tenancy**  

   Everything is designed assuming many orgs/users side-by-side; no accidental data bleed.

5. **Transparent, predictable behavior**  

   APIs are boring on purpose: REST/JSON for core, WebSockets for real-time, with well-documented events.

---

## 3. Authentication & Authorization

### 3.1 User Sessions (First-party)

- Web UI uses:

  - OAuth / passwordless login (e.g. email magic link or social login).

  - Short-lived session tokens (HttpOnly cookies).

- Internal APIs validate:

  - Session JWT or session id + CSRF protections for browser calls.

### 3.2 Personal Access Tokens (PATs)

For user-issued automation:

- Each user can create **Personal Access Tokens**:

  - `name`

  - `scopes[]`

  - `expires_at` (optional, recommended)

- Example scopes:

  - `project:read`, `project:write`

  - `remix:write`

  - `room:read`, `room:write`

  - `pipeline:run`

- Tokens are:

  - Shown **once** on creation.

  - Hashed at rest.

  - Revocable by user at any time.

Usage:

```http
Authorization: Bearer <personal_access_token>
```

### 3.3 Org / Team Tokens

For team-level automation (CI, bots):

* Org admins can create **Org API Keys**:

  * Bound to an org.

  * Scoped to:

    * `org:projects:*`

    * `org:rooms:*`

    * `org:pipelines:run`

* Optionally IP or environment restricted:

  * E.g. "only from our CI runners".

---

## 4. Core Domain APIs

This is an outline of the major resource groups; actual routes are conventional REST.

### 4.1 Projects API

**Resource:** `Project`

Key endpoints (high-level):

* `GET /api/projects`

  * List projects visible to the caller.

* `POST /api/projects`

  * Create new project (optionally from template or existing project).

* `GET /api/projects/:id`

  * Get basic metadata + latest state snapshot.

* `GET /api/projects/:id/files`

  * List files (metadata, not contents).

* `GET /api/projects/:id/files/:path`

  * Get file contents.

* `PUT /api/projects/:id/files/:path`

  * Update file contents.

* `POST /api/projects/:id/remix`

  * Create a remix, capturing lineage metadata (see [Remix Culture](./07-REMIX-CULTURE.md)).

Remix-specific:

* `GET /api/projects/:id/lineage`

  * Ancestors, descendants, remix types, impact stats.

* `GET /api/projects/:id/diff/:ancestorId`

  * High-level diff for learning/impact views.

Permissions:

* Per-project ACL:

  * Owner, collaborators, org roles.

* Public/Unlisted/Private flags:

  * Public projects are read-only for world, but remixable.

  * Private projects require explicit access.

---

### 4.2 Rooms API

**Resource:** `Room`

Rooms are collaboration spaces bound to projects or topics.

Key endpoints:

* `GET /api/rooms`

  * Rooms user is a member of (project rooms, community rooms).

* `POST /api/rooms`

  * Create room (project-specific or general).

* `GET /api/rooms/:id`

  * Metadata (topic, project binding, members).

* `GET /api/rooms/:id/messages`

  * Paginated message history.

* `POST /api/rooms/:id/messages`

  * Post a message (text + structured metadata).

* `POST /api/rooms/:id/events`

  * Fire structured events (e.g. "build started", "pipeline run").

Real-time:

* WebSocket/Socket.io channel:

  * `room:<id>` for:

    * Live cursors,

    * Presence,

    * Messages,

    * AI suggestions / bot messages.

---

### 4.3 Pipelines API

**Resource:** `Pipeline`

Pipelines are multi-step AI workflows.

Key endpoints:

* `GET /api/pipelines`

  * List pipelines visible to user/org.

* `POST /api/pipelines`

  * Create new pipeline (graph of steps + routing rules).

* `GET /api/pipelines/:id`

  * Pipeline definition, including:

    * Steps, models, prompts, expected inputs/outputs.

* `POST /api/pipelines/:id/run`

  * Run pipeline on:

    * Project + optional file subset,

    * Specific Room context,

    * Explicit inputs.

* `GET /api/pipeline-runs/:id`

  * Status, logs, outputs, linked diffs.

Permissions:

* Pipeline can be:

  * Personal (only owner).

  * Org-shared.

  * Public template.

---

### 4.4 Secrets & Providers API

**Resource:** `Secret` and `ProviderConnection`

Focused on "BYO keys, securely".

Key endpoints:

* `GET /api/secrets`

  * List metadata for secrets user/ org has access to (names, scopes, provider, **never values**).

* `POST /api/secrets`

  * Create a new secret:

    * `name` (human-readable, unique per scope)

    * `provider` (e.g. `openai`, `anthropic`, `custom-http`)

    * `scope` (`user`, `project`, `org`)

    * `env` (`dev`, `preview`, `prod`)

    * `value` (API key or token)

* `DELETE /api/secrets/:id`

  * Revoke secret (soft delete + rotation advice).

Provider connection metadata:

* `POST /api/providers/:providerId/connect`

  * For OAuth-style providers (e.g. GitHub, GitLab).

* `GET /api/providers`

  * Which providers are connected; what capabilities they expose.

**Security Notes (see [Security & Infrastructure](./14-SECURITY-AND-INFRASTRUCTURE.md) for details):**

* `value` field is:

  * Encrypted server-side before storage.

  * Never echoed back.

* BYO secrets are only:

  * Decrypted in backend workers.

  * Injected into calls to the relevant provider.

  * Never sent to the frontend or to other tenants.

---

## 5. Webhooks & Events

### 5.1 Outbound Webhooks

Users/orgs can register webhook endpoints to receive events:

* `project.created`, `project.updated`, `project.remixed`

* `pipeline.run.started`, `pipeline.run.completed`

* `deploy.succeeded`, `deploy.failed`

* `room.message.created`

Webhook config:

* `endpoint_url`

* `secret` (for HMAC signatures)

* `event_types[]`

* `max_retries`, `backoff_strategy`

### 5.2 Event Format

Standard envelope:

```json
{
  "id": "evt_...",
  "type": "project.remixed",
  "created_at": "2025-01-01T00:00:00Z",
  "data": { /* event-specific payload */ },
  "signature": "hmac-sha256=..."
}
```

---

## 6. Bots & Agents

Bots are specialized actors that can:

* Join Rooms,

* Listen to events,

* Read & write Projects (within scope),

* Trigger Pipelines.

### 6.1 Registration

* `POST /api/bots`

  * `name`, `description`

  * `scopes` (room/project/pipeline)

  * `callback_url` or event subscriptions

* Bots authenticate with an **API key** scoped to:

  * Certain Rooms,

  * Certain Projects.

### 6.2 Interaction Pattern

* Bot subscribes to:

  * `room:<id>` events (via WebSocket or webhook).

* Responds by:

  * Posting messages,

  * Triggering pipelines (e.g. rescue, refactor),

  * Proposing diffs.

Examples:

* "Rescue Bot":

  * Watches for failing builds.

  * Suggests rescue pipelines.

* "Teaching Bot":

  * Notices patterns in questions.

  * Suggests relevant Teaching Remixes.

---

## 7. BYO AI Provider Integration

This is the key point: **users and orgs can use their own AI keys without those keys leaking.**

### 7.1 Conceptual Model

* Wove provides an **AI Routing Layer**:

  * Knows about providers (OpenAI, Anthropic, etc.).

  * Knows which secret to use for each call.

* Users/orgs can supply **their own keys** as Secrets (via Secrets API).

* Pipelines reference:

  * Logical providers (`"provider": "openai:org-default"`) instead of raw keys.

### 7.2 How Pipelines Reference Secrets

Example pipeline step:

```json
{
  "id": "summarize-project",
  "type": "llm-call",
  "provider_ref": "openai:org-default", 
  "model": "gpt-4.1-mini",
  "input_template": "Summarize this project: {{project_summary}}"
}
```

`provider_ref` resolves to:

* A **secret id** in the org's secret store, with:

  * `provider = openai`

  * `scope = org`

  * `env = current_env`

Resolution logic respects:

* Precedence:

  * Project-specific > Org-default > User-specific fallback.

* Environment:

  * Different keys for dev/preview/prod.

### 7.3 Call Flow with BYO Keys

1. Pipeline step triggers an LLM call.

2. AI Router service:

   * Looks up which secret to use (per org/project env).

   * Decrypts key in backend.

3. Router calls provider API server-side:

   * Key is never sent to the browser.

   * Key is never logged in plaintext.

4. Response is:

   * Sanitized if needed.

   * Logged with redacted headers.

   * Returned to pipeline engine.

### 7.4 Client Control & Transparency

Users/orgs can:

* See:

  * Which provider/plan a pipeline step uses.

  * Estimated token usage (if supported).

* Configure:

  * Limits and budgets per provider:

    * Max tokens/month,

    * Max cost/month (inferred),

    * Hard/soft caps.

In case of limit breach:

* Pipelines fail gracefully:

  * "We hit your provider limit."

* Suggest:

  * Switching to Wove-hosted provider plan (if available).

  * Providing a different key.

---

## 8. Rate Limiting & Abuse Prevention

* Per-user and per-org rate limits:

  * On REST APIs.

  * On pipeline runs.

* Specific LLM/AI usage limits:

  * Enforced per secret.

* Burst control:

  * On webhooks and events.

Additionally:

* Abuse signatures (like scraping other orgs' data) are mitigated by:

  * Strict authorization checks.

  * No cross-tenant project/file access via API.

---

## 9. Versioning & Stability

* API base path includes version:

  * `/api/v1/...`

* Changes may be:

  * Additive where possible.

  * Breaking changes:

    * Batched and announced via RFC + migration guides.

* Long-lived PATs and automations:

  * Should be tested against new versions in preview environments.

---

## 10. Developer Experience

* Interactive API docs:

  * OpenAPI/Swagger or similar.

* Example clients:

  * TypeScript SDK (first-class).

  * Minimal examples for:

    * Node CLI integrations.

    * CI pipelines (GitHub Actions, etc.).

* "API Playground":

  * In-browser client for:

    * Trying routes with current user/context.

    * Exploring webhooks and bots.
