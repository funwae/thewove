# 07-REMIX-CULTURE.md

## 1. Purpose

Remix Culture is how The Wove turns code into a living, learnable, collaborative medium.

Instead of "forking" and disappearing, we want:

- **Visible transformations** (before/after)

- **Concrete learning artifacts** (what changed, how, and why)

- **Soft but real status** for people who level up others' work

- **Automatic credit chains** so ideas and effort stay traceable

This document defines the concepts, UX flows, and basic data model for remixes in The Wove.

---

## 2. Design Principles

1. **Transformations over snapshots**

   The core object is "how X became Y", not just "Y exists".

2. **Kindness by default**

   Remixes should feel like gifts, not attacks. Critique is framed as "I helped" rather than "you did it wrong".

3. **Attribution that can't be stripped**

   Lineage metadata is immutable and always displayed.

4. **Learning-first**

   Every significant remix can (optionally) double as a teaching artifact.

5. **Low friction, high safety**

   It should be trivial to spin a remix, hard to accidentally misrepresent or harm someone's work.

---

## 3. Core Concepts & Terminology

- **Project**

  A unit of work in The Wove (code + assets + metadata).

- **Remix**

  A project that explicitly declares it was derived from another project (or chain of projects), with tracked diffs and metadata.

- **Lineage Tree**

  A visual representation of how a project has evolved through remixes over time.

- **Level-up**

  A specific remix whose intent is "improve or complete" an existing project (vs "different direction").

- **Remix Type**

  A structured tag describing the remix's intent and affordances (see below).

- **Impact Story**

  A human-readable summary of how a project or remix has influenced others (e.g. "Your layout pattern has been reused 7 times").

---

## 4. Remix Types

Remix type is chosen at creation time (can be adjusted later by the remixer, and in some cases confirmed or re-labeled by the original creator).

### 4.1 🎓 Teaching Remix

**Intent**: Explain how and why the project changed, step by step.

- Includes optional **checkpoints**:

  - Each checkpoint has:

    - Short explanation ("We extracted this function for reuse")

    - Associated diff

  - Checkpoints can be turned into a guided walkthrough.

- Affordances:

  - Eligible to be promoted into a **guided lesson**.

  - Shows up in "Learn" and "Tutorials" discovery views.

  - Can be referenced in onboarding flows.

- Example use:

  - Taking a messy app and turning it into "the maintainable version", annotating decisions for learners.

---

### 4.2 🚀 Feature Add

**Intent**: "I added something meaningful to your project."

- Examples:

  - Add authentication

  - Add dark mode

  - Add mobile responsiveness

  - Add a new game level

- Affordances:

  - Original creator gets a notification with:

    - Natural-language summary of changes

    - Option to **"Accept upstream"** (pull the changes into the original project).

  - If accepted:

    - Remix is marked as "merged upstream".

    - Both the original and remixers are credited.

- Status:

  - High-signal contribution path for builders.

  - Great target for "Official Challenges" (see below).

---

### 4.3 🎨 Vibe Shift

**Intent**: Change the aesthetics and/or UX without major functional changes.

- Examples:

  - Same app, new visual language.

  - Re-layout for mobile-first.

  - Accessibility improvements + better focus states.

- Affordances:

  - Shows up strongly in visual galleries.

  - Can be compared side-by-side with original:

    - Before/after screenshots

    - Theming diffs (Tailwind config, design tokens, etc.).

- Status:

  - Ideal for designers and front-end vibe coders.

  - Encourages collaboration between dev-focused and design-focused users.

---

### 4.4 🔧 Rescue Mission

**Intent**: Take an incomplete or broken project and make it work.

- Examples:

  - Fixing failing builds.

  - Completing a partially implemented feature.

  - Refactoring dangerously brittle code.

- Affordances:

  - Clearly labeled as "Rescue Mission".

  - Highlights:

    - What was broken

    - How it was fixed

  - Optional AI-generated "root cause" explanation.

- Status:

  - Highest prestige remix type.

  - Ideal candidate for surfacing in "Heroes of The Wove" style showcases.

  - Great teaching material ("how to debug X in the real world").

---

## 5. Lineage Tree & Visual Representation

### 5.1 Concept

The lineage tree is a **living evolution diagram** of a project:

- Root: original project.

- Branches: each remix, with a preview thumbnail.

- Node metadata:

  - Remix type icon (🎓 🚀 🎨 🔧)

  - Creator avatar

  - Key tags (stack, difficulty, teaching vs product-focused)

### 5.2 Interactions

- **Hover a node**:

  - Show:

    - Mini preview (screenshot or animated GIF)

    - One-line summary ("Added Supabase auth", "Reskinned for mobile").

- **Click a node**:

  - Open **Remix Diff Viewer**:

    - Tabs:

      - "What changed" (natural language summary)

      - "Files" (file-by-file diff)

      - "Prompts & Pipelines" (AI steps used)

      - "Timeline" (optional playback of edit sequence)

- **Filter tree** by:

  - Remix type

  - Teaching only

  - Stack (React, Svelte, etc.)

  - Difficulty (auto-estimated via code complexity + AI tagging)

- **Time slider**:

  - Scrub through "generations" to see how the project evolved over time.

---

## 6. Remix Creation Flow

### 6.1 Starting a Remix

Entry points:

- From any project card: **"Remix this"** button.

- From the editor: **"Start remix"** snapshot of the current state.

- From onboarding: pre-selected "beginner-friendly remix targets".

Remix dialog:

1. Choose **Remix Type** (Teaching, Feature Add, Vibe Shift, Rescue Mission, or "Just exploring").

2. Optional: add a short intention note (what you plan to do).

3. The Wove:

   - Creates a linked project with lineage metadata.

   - Optionally suggests a checklist based on type:

     - Teaching: "Add at least 2 checkpoints."

     - Rescue: "Describe what was broken."

     - Vibe Shift: "Capture a before screenshot."

### 6.2 Finishing & Publishing a Remix

On publish:

- AI generates:

  - Natural-language "What changed" summary.

  - Tags (stack, difficulty, focus area).

- User can edit that summary.

- Original creator is notified:

  - See summary + diffs.

  - Can mark as:

    - Helpful

    - Teaching exemplar

    - Candidate for upstream merge (Feature Add only)

---

## 7. Credit & Impact

### 7.1 Immutable Attribution

Each project stores:

- `ancestors`: list of ancestor project IDs, with depth.

- `direct_parent`: the project it was directly remixed from.

UI always shows:

> "Built on ideas from [A] → [B] → [C]

> Leveled up by [You]."

This cannot be removed, only augmented.

### 7.2 Gratitude Mechanic

Instead of public "likes", we have **Thank You** notes:

- On any project/remix:

  - "Send a Thank You" opens a short note composer:

    - "This helped me because…"

- Notes are:

  - Delivered privately (by default).

  - Optionally allowed to be quoted anonymously in public ("This project helped 12 people.")

### 7.3 Impact Stories

Surface **non-gamified metrics** like:

- "Your layout pattern has been remixed 7 times."

- "3 people used your teaching remix to learn Next.js routing."

- "1 rescue mission of yours unblocked a production deployment."

These appear in:

- User's profile under "Impact".

- Occasional "you made someone's day" notifications.

---

## 8. Official Challenges

### 8.1 Concept

"Official Challenges" are time-bound prompts curated by The Wove team (or later, community curators) to generate focused remix activity.

Examples:

- "Rescue this broken project."

- "Make this boring dashboard beautiful."

- "Take this minimal API and build 3 wildly different UIs."

### 8.2 Mechanics

- A challenge defines:

  - Starter project(s).

  - Recommended remix types.

  - Suggested learning goals (e.g. accessibility, animation, auth).

- Participants:

  - Click "Join challenge" → auto-remix the starter project.

  - Their remixes are tagged with the challenge ID.

- Showcases:

  - At the end, we highlight:

    - Best teaching remix.

    - Best rescue mission.

    - Most surprising vibe shift.

    - Community-voted "most delightful".

Challenges are ideal content for:

- Onboarding paths.

- Marketing.

- "Come back this week" emails / notifications.

---

## 9. Data Model (High Level)

**Project**

- `id`

- `owner_id`

- `title`

- `description`

- `stack_tags[]`

- `created_at`

- `updated_at`

- `is_remix: boolean`

- `direct_parent_id: Project.id | null`

- `ancestor_ids[]: Project.id[]`

- `remix_type: enum | null` (TEACHING | FEATURE_ADD | VIBE_SHIFT | RESCUE | EXPERIMENT)

- `challenge_ids[]: Challenge.id[]`

- `ai_summary: text` (what changed / what this is)

- `impact_stats` (denormalized view)

**ThankYou**

- `id`

- `from_user_id`

- `to_user_id`

- `project_id`

- `message`

- `is_public_quote: boolean`

- `created_at`

**Challenge**

- `id`

- `title`

- `description`

- `start_at`, `end_at`

- `starter_project_ids[]`

- `tags[]`

---

## 10. Success Metrics

We know Remix Culture is working if we see:

- High % of projects with at least one remix.

- Meaningful number of **rescue missions** and **feature-add remixes**, not just clones.

- Repeat behavior:

  - Users who do a remix come back and do more.

- Learning outcomes:

  - Session replays of teaching remixes are watched and lead to follow-up activity.

- Positive social signals:

  - High ratio of Thank You notes to moderation incidents.

  - Qualitative feedback: "I learned X from remixes" stories.

Remix Culture should make The Wove feel like an evolving tapestry, not a static gallery.
