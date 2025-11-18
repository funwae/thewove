# SIGNATURE-LOOPS.md

## 1. Purpose

Signature loops are the **short, repeatable cycles of behavior** that define how people actually use The Wove day-to-day.

If we get these right:

- The product feels obvious and inviting.

- Learning is a side effect of doing real work.

- Collaboration and kindness are built into the default flow.

This doc describes the core loops for our four primary personas:

- Experimenter

- Builder

- Teacher

- Innovator

---

## 2. Shared Foundations

Across all personas, The Wove's loops share three properties:

1. **Remix-first**

   Almost every loop includes either:

   - Leveling up someone else's project, or

   - Preparing your own work so others can level it up.

2. **AI-native, not AI-bolted-on**

   The AI is:

   - Present in the editor and the room,

   - Aware of project context and lineage,

   - Treated as a collaborator, not a separate tool.

3. **Structural kindness**

   Every loop contains at least one of:

   - Giving or receiving a Thank You.

   - Seeing visible credit for others' contributions.

   - Encountering tone-checked, de-escalated interactions.

---

## 3. Experimenter Loop

**Who:** Non-traditional devs, curious builders, "I just want to try something."

### 3.1 5–10 Minute Loop: "Talk → See → Ship"

1. **Talk**

   - They describe an idea in plain language to the conversational interface.

   - Wove clarifies in 1–2 turns: "I'm thinking this structure, does that feel right?"

2. **See**

   - Files begin appearing in the editor.

   - They see the app preview update in real time.

   - Errors are explained in natural language and auto-fixed when safe.

3. **Ship**

   - They click "Ship" → Wove deploys to edge.

   - They get a live URL + QR code.

4. **Remix**

   - Immediately after shipping, they're invited to:

     - Explore how similar apps have been remixed, and

     - Level up one hand-picked beginner-friendly project.

**Emotional anchor:**

> "I made a real thing and I helped improve someone else's."

---

### 3.2 Daily Loop (Returning Experimenter)

1. Open The Wove → see:

   - "Your latest projects" and

   - "Remixes that affected your work" (others leveling up their apps).

2. Choose between:

   - Starting a new tiny thing, or

   - Doing a quick level-up remix (vibe shift, small feature add).

3. End each session by:

   - Shipping (if possible), and/or

   - Publishing at least one remix.

---

## 4. Builder Loop

**Who:** People already comfortable with code + AI, but hitting complexity walls.

### 4.1 5–10 Minute Loop: "Resume → Understand → Evolve"

1. **Resume**

   - They open a project and see a "Where we left off" summary:

     - last features worked on

     - open questions

     - known rough edges

2. **Understand**

   - Wove offers:

     - A mini map of the project structure.

     - Highlighted "hotspots" (complex or fragile areas).

   - Builder can ask:

     - "Why is this structured this way?"

     - "Remind me what this component does."

3. **Evolve**

   - They pick a micro-goal: "add auth", "improve performance", "refactor X".

   - Wove proposes:

     - 2–3 implementation paths with tradeoffs.

   - "Make this maintainable" is running in the background:

     - Suggesting small refactors,

     - Highlighting duplication,

     - Proposing tests for critical paths.

4. **Optionally: Publish a Level-Up Remix**

   - If they were working on someone else's project, their work becomes:

     - 🚀 Feature Add, 🎓 Teaching Remix, or 🔧 Rescue Mission.

**Emotional anchor:**

> "My messy AI-coded project is gradually becoming solid, and I can do the same for others."

---

### 4.2 Weekly Loop (Builder)

- Pick **1–3 community projects** to:

  - Rescue (fix broken/brittle stuff), or

  - Extend (new features).

- Get a steady stream of:

  - Upstream merges,

  - Thank You notes,

  - Visible impact stories ("your pattern was reused X times").

---

## 5. Teacher Loop

**Who:** People who enjoy explaining, mentoring, documenting.

### 5.1 5–10 Minute Loop: "Capture → Annotate → Publish"

1. **Capture**

   - They select a project they've leveled up (their own or someone else's).

2. **Annotate**

   - Turn it into a 🎓 Teaching Remix:

     - Add checkpoints (e.g. "Extracted this component", "Added error handling").

     - Each checkpoint ties to a code diff.

   - AI helps generate:

     - Short explanations for each checkpoint.

     - Comprehension questions or exercises.

3. **Publish**

   - They flip "Teaching Remix ON".

   - Remix appears in:

     - Learn section,

     - Onboarding "First Remix" candidates,

     - Challenges, where relevant.

4. **Feedback**

   - Learners can:

     - Remix from any checkpoint.

     - Send Thank You notes explaining what they learned.

**Emotional anchor:**

> "People are actually learning from the way I think about code."

---

### 5.2 Ongoing Teacher Loop

- Take interesting community remixes and:

  - Wrap them in teaching structure.

- Host live or async "Remix Clinics" using:

  - Room + replay + guided remixes.

- Gradually build:

  - A personal library of Teaching Remixes,

  - A visible lineage of students' remixes.

---

## 6. Innovator Loop

**Who:** Multi-agent weirdos, "workflow inventors," pipeline designers.

### 6.1 5–10 Minute Loop: "Spot Pattern → Encode Pipeline → Test on Real Project"

1. **Spot Pattern**

   - They notice a recurring workflow:

     - rescue broken project,

     - design from wireframe,

     - refactor + test + deploy.

2. **Encode Pipeline**

   - Open the **Pipeline Editor**:

     - Define stages (analyze, propose, refactor, test, explain).

     - Attach specialized agents (frontend, backend, infra, docs).

   - Declare:

     - Inputs (project + goals),

     - Outputs (diffs + reports).

3. **Test on Real Project**

   - Run the pipeline against:

     - Their own project, or

     - A community project (with explicit consent / challenge context).

4. **Publish as a Pipeline Remix**

   - Pipelines themselves can be "remixed":

     - Others fork and tweak them.

   - Attach pipelines to:

     - Challenges,

     - Onboarding flows,

     - Specific persona loops.

**Emotional anchor:**

> "I designed a workflow that makes other people more powerful."

---

### 6.2 Long-term Innovator Loop

- Iteratively improve pipelines based on:

  - Success/failure rates,

  - User feedback,

  - Emergent use cases.

- Collaborate with:

  - Builders (to stress-test),

  - Teachers (to wrap pipelines in learning),

  - Governance stewards (to ensure safety/kindness alignment).

---

## 7. How Loops Interlock

- Experimenters graduate into Builders when:

  - They start caring about maintainability and rescuing others.

- Builders become Teachers when:

  - They turn Level-Up work into Teaching Remixes.

- Innovators fuel everyone by:

  - Encoding best workflows into reusable pipelines.

- Teachers and Innovators anchor the culture:

  - They set norms for how we treat each other's work and how we talk about code.

---

## 8. Implementation Notes

- Every major feature should answer:

  - "Which loop(s) does this support?"

- Metrics to track per loop:

  - Frequency and completion of core loop steps.

  - Time-to-first "emotional anchor" moment:

    - Shipping,

    - Level-up,

    - Teaching impact,

    - Pipeline adoption.

- Adjust discovery, notifications, and nudges to:

  - Nudge people into neighboring loops,

  - Avoid funneling everyone into just "ship demos and leave."

