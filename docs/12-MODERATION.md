# 12-MODERATION.md

## 1. Purpose

Moderation in The Wove exists to:

- Keep people safe.

- Maintain structural kindness.

- Protect learning and collaboration.

- Prevent abuse, harassment, bigotry, and spam.

This doc defines moderation philosophy, workflows, roles, and the AI-assistance layer.

---

## 2. Principles

1. **Human dignity first**  

   We favor protecting people over preserving content.

2. **Repair when possible, remove when necessary**  

   Aim for education and correction before bans, when safe and appropriate.

3. **Transparent and appealable**  

   Moderation decisions:

   - Are documented at an appropriate level of detail.

   - Can be appealed through clear channels.

4. **AI-assist, human-decide**  

   AI helps surface and pre-filter, but humans hold final authority in meaningful cases.

---

## 3. Scope of Moderation

Moderation applies to:

- Public and semi-public content:

  - Comments, reviews, project descriptions.

  - Room messages.

  - Challenge entries.

- User profiles and handles (where visible).

- Visible code comments when associated with harassment or doxxing.

It does *not*:

- Police private local edits or personal opinions unless brought into shared spaces.

---

## 4. Roles & Responsibilities

### 4.1 Core Team

- Owns moderation policies and infrastructure.

- Handles:

  - High-risk incidents (e.g. threats, doxxing).

  - Legal or law-enforcement-related issues.

### 4.2 Stewards

- Review complex cases surfaced by:

  - Room Hosts,

  - AI detectors,

  - Reports from users.

- Help align moderation decisions with community norms and governance.

### 4.3 Room Hosts

- Apply moderation guidelines within their rooms:

  - Issue gentle nudges.

  - Soft warnings.

  - Mute or temporarily remove disruptive participants.

- Escalate to Stewards/Core Team when:

  - Patterns emerge,

  - Severity is high.

### 4.4 Community Members

- Can:

  - Report harmful content.

  - Block or mute other users for their own experience.

  - Participate in discussions about norms and improvements.

---

## 5. AI Tone Checking & Pre-Post Filters

### 5.1 Tone Check UX

When a user writes a comment or feedback:

- AI runs a quick tone analysis for:

  - Personal attacks,

  - Dismissive language,

  - Harassment/bigotry.

If flagged, UX gently intervenes:

> "This might come across as harsh. Want to rephrase?"  

> Option 1: "Show me a kinder version."  

> Option 2: "Post anyway" (with logging and potential rate limiting).

We **do not**:

- Secretly edit user content.

- Prevent criticism outright.

We **do**:

- Encourage specific, constructive feedback ("This code breaks because…" vs "This is garbage").

### 5.2 Content Filters

Certain content is blocked or heavily restricted by policy (e.g. explicit hate, violent threats, doxxing).

For those, AI can:

- Hard-block and say:

  - "This violates our community guidelines and cannot be posted."

- Log for moderator review.

---

## 6. Incident Workflow

### 6.1 Low-Severity (Nudge Level)

Examples:

- Mildly rude comments.

- Unhelpful sarcasm toward beginners.

Actions:

1. AI tone-check nudge.

2. Room Host may:

   - Send a private reminder.

   - Suggest rephrasing.

3. No formal record unless recurring.

### 6.2 Medium-Severity (Warning Level)

Examples:

- Repeated dismissive behavior.

- Non-violent but targeted insults.

- Unsolicited explicit content in coding spaces.

Actions:

1. Temporary content removal or editing.

2. Formal warning:

   - Clear description of behavior.

   - Link to guidelines.

3. Logged in moderation system.

4. Possible temporary:

   - Room mute,

   - DM restrictions.

### 6.3 High-Severity (Protective Action Level)

Examples:

- Hate speech.

- Serious harassment.

- Threats of violence.

- Doxxing or attempts to reveal private information.

Actions:

1. Immediate removal of offending content.

2. Temporary or permanent account suspension.

3. IP/device-level blocks in severe cases.

4. Escalation to Core Team and, where required, legal authorities.

5. Option for affected users to:

   - Block,

   - Request review,

   - Access support resources (where applicable).

---

## 7. Appeals

Users can appeal:

- Content removals.

- Warnings.

- Suspensions.

Appeal process:

1. Submit short appeal form:

   - What decision they're appealing.

   - Why they believe it's incorrect or unfair.

2. Reviewed by:

   - A different Steward or Core Team member than the original moderator where possible.

3. Outcomes:

   - Upheld (with explanation).

   - Modified (e.g. warning reduced or clarified).

   - Overturned (with apology and correction of records).

Appeal stats (aggregated) are:

- Monitored for bias.

- Used to refine guidelines and AI systems.

---

## 8. Safety Tools for Users

- **Block/Mute:**  

  Users can block others:

  - Blocks DMs (if applicable).

  - Hides their content where reasonable.

- **Content Controls:**  

  Per-room and global settings:

  - Hide mature content (where applicable).

  - Filter content by tags (e.g. "no NSFW", "no politics").

- **Report Mechanism:**  

  Simple "Report" button with categories:

  - Harassment,

  - Hate/Bigotry,

  - Spam,

  - Other (with description).

Reports:

- Are acknowledged via minimal feedback:

  - "Thanks, we'll take a look."

- Are prioritized by severity and repetition.

---

## 9. Integration with Remix Culture

Moderation intersects remix culture where:

- Someone posts a "remix" as an attack (mocking UI/code, targeted harassment).

- Attribution chains could inadvertently expose personal info (avoid doxxing via commit messages, etc.).

Guidelines:

- Critique code, never the person.

- Remix titles and descriptions should:

  - Describe changes, not attack originals.

- Moderators may:

  - Request renaming or rewording.

  - Remove hostile "remixes" that exist only to shame.

---

## 10. Metrics & Continuous Improvement

We monitor:

- Number and type of incidents per month.

- Recidivism rate (users with repeated issues).

- Ratio of:

  - Thank You notes and positive feedback

  - to moderation incidents.

We gather qualitative feedback:

- "I feel safe here."

- "I feel okay sharing work, even if it's rough."

If we see:

- Rising harassment,

- Certain groups disproportionately affected,

- Or people leaving due to safety concerns,

we:

- Revisit policies via RFC,

- Improve AI detection and tone-check prompts,

- Adjust room norms and hosting support.

Moderation is not just enforcement—it's ongoing culture shaping.
