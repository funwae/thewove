# 10-ONBOARDING.md

## 1. Purpose

Onboarding is where new users experience The Wove's **core magic** for the first time:

- AI-native building (talk → see → ship)

- Remix culture (leveling up someone else's project)

- Structural kindness (gratitude, lineage, no gatekeeping)

The goal: in the first 10–20 minutes, a new user should:

1. Ship something simple.

2. Level up someone else's project at least once.

3. See how attribution and gratitude work.

4. Feel invited into an ongoing community, not a tool silo.

---

## 2. Design Goals

1. **Do, don't explain**  

   Minimize static docs. The product itself should teach.

2. **One emotional peak quickly**  

   Either "My thing is live" or "I helped someone else" within the first session (ideally both).

3. **Anti-overwhelm**  

   Reveal complexity gradually; keep the first session focused.

4. **Persona-flexible**  

   Work for experimenters, builders, teachers, and innovators without heavy branching.

5. **Remix-first**  

   Treat the first remix as part of onboarding, not an advanced feature.

---

## 3. Entry Surface

### 3.1 Landing Choice: Three Paths

When a new user arrives (first time, or logged-out):

They see a minimal screen with three clearly labeled, non-intimidating paths, each with a 10s looping preview:

1. 🎥 **Watch someone build**  

   - Plays a sped-up replay of a real collab session in The Wove.

   - Communicates: multiplayer, AI, shipping.

2. 🚀 **Build something now**  

   - Starts the conversational scaffold flow (see §4).

   - Communicates: you can make something real quickly.

3. 🌊 **Explore the vibe**  

   - Opens a curated gallery of projects and remixes.

   - Communicates: living ecosystem, not solo tool.

All three paths eventually converge on creating an account (lightweight) and doing **at least one remix**.

---

## 4. Path: "Build Something Now"

This is the main default for experimenter-type users and many builders.

### 4.1 Conversational Scaffold

Instead of a blank editor, they see a chat:

> "👋 I'm here to help you build. What do you want to make?"

As they respond, The Wove:

- Suggests a simple scaffold plan:

  - "I'm thinking: search bar + list of recipes + favorites."

- Offers a choice:

  - Real API vs fake data (speed vs realism).

- Begins generating files in the background:

  - Editor shows progress but does not demand attention yet.

### 4.2 Anti-overwhelm Defaults

While scaffolding:

- File tree is collapsed.

- Only a "main" file (or component) is foregrounded.

- Terminal/logs hidden unless:

  - Something breaks, or

  - User explicitly asks.

Errors are always explained in natural language:

> "This broke because we forgot to import X. I'll fix it and show you the change."

### 4.3 First Shipping Moment

After ~5–10 minutes, aim to get to a minimally functional app.

Wove says:

> "Your app is working!  

> Want to:

> 1. Ship it (get a live link),  

> 2. Add one more feature, or  

> 3. Let me suggest some improvements?"

When they choose **Ship**:

- One-click deploy to edge.

- Show:

  - Live URL

  - QR code

  - Simple "Share with a friend" option

Small delight (confetti / tasteful animation) marks this moment.

### 4.4 From Shipping to Remix

Immediately after shipping:

> "🎉 Nice! Your app is live.  

> The coolest part of The Wove is how people level up each other's projects.  

> Want to see how others might remix yours, and try remixing someone else's?"

This transitions into the **First Remix Tutorial** (§6).

---

## 5. Path: "Watch Someone Build"

Target: people who want to understand before committing.

- Plays a **replay of a real, short collab session**:

  - Two users + AI building or rescuing a project.

  - Shows:

    - Live cursors

    - AI suggestions

    - Shipping moment

    - A remix being created or merged

- Controls:

  - Pause and "Start from here":

    - If they click, Wove spins a new project at that snapshot and moves them into the editor.

  - "Show me the final project":

    - Takes them to the project page with lineage tree visible.

At the end, they're invited to:

> "Remix this project or start your own?  

> (We'll guide you either way.)"

This path still leads into **First Remix Tutorial** or conversational scaffolding.

---

## 6. Path: "Explore the Vibe"

For curious browsers and lurkers.

- Shows a curated gallery:

  - Projects with interesting remixes.

  - Rescue missions.

  - Teaching remixes with high impact.

- Filters:

  - Skill level (Beginner-friendly / Intermediate / Advanced).

  - Goal ("I want to learn X", "I want to see weird experiments", etc.).

On any card, "Remix this" is available. Clicking it triggers:

- Light account creation.

- Then flows into the **Remix Creation** UI (see [Remix Culture](./07-REMIX-CULTURE.md) spec).

---

## 7. First Remix Tutorial (Core Onboarding Moment)

We want every new user to **level up someone else's project** in their first session.

### 7.1 Selecting Remix Targets

After shipping or after choosing "Explore / Remix":

The Wove presents 3–5 **pre-vetted remix targets**, tagged as "Beginner-friendly":

Examples:

- A todo app that needs visual polish.

- A weather app that lacks error handling.

- A simple game missing sound effects.

- A partially broken project suitable for a mini rescue.

Each card briefly explains:

- "What this does now."

- "Suggested level-ups" (1–2 specific, scoped ideas).

### 7.2 Guided Remix Flow

Once a user picks a target:

> "Let's level up [project]. I see a few quick wins:  

> - Add color and spacing (easy)  

> - Make it save your data (medium)  

> - Add categories or filters (more involved)  

>  

> Which sounds fun?"

User picks one. Then:

- Wove sets up the remix with appropriate **Remix Type**:

  - Visual changes → 🎨 Vibe Shift.

  - Bug fix or completion → 🔧 Rescue Mission.

  - Structural improvements → 🎓 Teaching Remix (optional prompt to annotate).

- The AI works **with** the user:

  - Proposes changes.

  - Explains concepts on demand.

  - Highlights diffs clearly.

### 7.3 Before/After Moment

On completion:

- Show a **side-by-side before/after** preview:

  - "Here's how it looked before."

  - "Here's what you just did."

- Summarize in natural language:

  - "You made it mobile-friendly and added hover states."

  - "You fixed the API error and added proper loading and error views."

User can tweak that summary before publishing.

### 7.4 Publishing & Social Feedback

On publish:

- Original creator is notified:

  - "Someone leveled up your project."

  - Link to the **Remix Diff Viewer**.

- User sees:

> "Nice work. I've let [creator] know you helped improve their project.  

> They'll see exactly what you changed."

If/when the original creator sends a Thank You or adopts changes upstream, the new user gets:

> "🎉 Your remix unblocked [creator]. You just did a real rescue mission."

This is designed to be **addictive in a positive way**: leveling-up as the emotional hook.

---

## 8. Anti-Overwhelm Mechanics (Global to Onboarding)

### 8.1 Progressive Disclosure UI

- Editor starts in **"Simple Mode"**:

  - File tree collapsed.

  - Single main file visible.

  - No terminal/console surface.

- Users can gradually unlock:

  - "Show more files."

  - "Show logs/terminal."

  - "Show project structure."

Once unlocked, these preferences stick.

### 8.2 Safe Experimentation

- Auto-save of important states:

  - "Shipping point" snapshot.

  - "Before remix" snapshot.

- Ability to:

  - "Undo to this state" from a timeline view.

  - Spin these states into new experiments without losing progress.

### 8.3 Maintainability in the Background

The "Make this maintainable" idea manifests as:

- Background agent that:

  - Scans for obvious footguns.

  - Suggests small, incremental improvements.

- Surface as:

  - Non-threatening prompts:

    - "Want to tidy this up a bit?"  

    - "We could make this easier to maintain later with small changes now."

- Opt-in full session:

  - "Do a Level-Up pass" opens a guided, multi-step refactor session.

- Language avoids judgment:

  - No "bad / ugly / smelly code" phrasing.

  - Emphasis on "future you" and collaborators.

---

## 9. Persona Considerations

Onboarding flows are *shared* but the emphasis differs:

### 9.1 Experimenter

- Bias to "Build something now".

- Shorter scaffold flows.

- Single-feature remix targets.

- Quick win: "You shipped; you helped."

### 9.2 Builder

- Show "Where we left off" summaries on second visit.

- Surface "Level up this code" suggestions early.

- Remix targets focus on feature additions and rescue missions.

### 9.3 Teacher

- Early invite to mark remixes as **Teaching Remixes**.

- Prompt to add checkpoints with explanations.

- Suggest turning their first successful remix into a public lesson.

### 9.4 Innovator

- Expose:

  - AI pipeline editor earlier.

  - Multi-agent flows.

- Offer "Prototype a new workflow" as a secondary path from landing.

- Example: "Design a pipeline that turns broken projects into rescue candidates."

---

## 10. Community Connection

At the **end of the first session**, after they've:

- Shipped something OR

- Completed a remix (ideally both),

we give a minimal, but meaningful next step:

> "You're in. Where do you want to hang out?"

Offer a single choice (optional but encouraged):

- **Join a Room:**

  - #beginners

  - #web-apps

  - #weird-experiments

  - #teaching-and-remixes

Selecting a room:

- Subscribes them to that space.

- Shows:

  - Active threads.

  - Projects from room members.

  - Occasional "remix this" prompts.

No forced profile setup before this. Profile enhancements (avatar, bio, skills) can be gently prompted later.

---

## 11. Instrumentation & Metrics

We should track:

- Time to:

  - First shipped project.

  - First remix.

- % of new users who:

  - Ship in first session.

  - Complete at least one remix in first session.

- Drop-off points:

  - During conversational scaffolding.

  - During first remix.

- Feature adoption:

  - Simple Mode vs advanced views.

- Qualitative feedback:

  - Short in-product question: "Did you feel overwhelmed at any point?"

Success looks like:

- Majority of new users shipping and remixing once in their first session.

- High completion rate of the first remix tutorial.

- Reported feelings of:

  - "I helped someone."

  - "I learned by doing."

  - "This feels welcoming."

---

## 12. Future Extensions

- **Persona-aware variants**:

  - Different default paths depending on self-identified goals.

- **Official Challenges integrated into onboarding**:

  - "This week's remix challenge" as an optional route.

- **Live onboarding sessions**:

  - Scheduled rooms where mentors guide small groups through first build + remix.

- **Teacher-specific onboarding**:

  - For people arriving from content (YouTube, blog posts), pre-populate teaching-focused flows.

Onboarding is not a one-time event; it should feel like the first thread in an ongoing weave.
