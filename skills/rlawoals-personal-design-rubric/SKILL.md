---
name: rlawoals-personal-design-rubric
description: Personal UI design and review rubric for compact, original, functional applications. Use for new frontend design, visual polish, design-system planning, and screenshot review. Triggers on "use my personal design rubric", "midnight navy muted slate", "remove AI slop", "review my UI design", "personal UI rubric", "/rlawoals-personal-design-rubric".
---

# Personal design rubric

Use this to design and review thoughtful, original, useful software interfaces. It records user-stated visual preferences, not a mandate to make every application look identical.

## Precedence and intent

- The current project's audience, jobs-to-be-done, brand, accessibility requirements, and direct user feedback override this skill.
- Default to a compact, low-noise, tool-first interface where the primary task is obvious. If a project needs a warmer or more playful direction, adapt instead of forcing dark navy.
- Inspiration can inform interaction principles. Favor strong hierarchy, compact navigation, efficient search, keyboard-first interactions, and consistent spacing. Do not copy another product's layout, branding, icons, or proprietary assets pixel-for-pixel.
- Distinguish confirmed requirements from your design proposals. Ask for preference only when a decision materially changes direction; otherwise produce a concrete, reviewable proposal.

## Grounded preferences

Preferences explicitly established during Patchwise design exploration:

- Favor dark, very deep midnight navy over flat charcoal, with cool blue / violet undertones.
- Prefer muted slate-selected surfaces and comfortable tonal separation instead of glaring white or pale-frost cards.
- Use a restrained navy-to-purple gradient for subtle depth, primarily in one header edge or ambient treatment; keep the content background solid.
- Prioritize compact, purpose-built navigation and balanced information density. Reduce excessive card padding, giant hero copy, redundant labels, and wasted whitespace.
- Keep product-specific character. Champion artwork and useful patch-change markers can supply visual interest without flashy effects.
- Avoid newspaper-like layouts for tools, stock AI chat dashboards, loud glows, glassmorphism, and identical rounded cards across every page.

Exact optional preset and layout numbers: [Midnight Navy + Muted Slate](references/midnight-navy-muted-slate.md).
Project-specific reusable prompt: [Project design brief](references/project-design-brief.md).

## Design workflow

### 1. Define the task and information hierarchy

Before styling, write down:

- The primary action within the first screenful.
- The three most important data objects and the actual user questions they answer.
- Which information must be visible versus progressively disclosed.
- Expected content density, viewport range, keyboard interactions, and data limits.
- A brief explanation of what makes this product visually and functionally distinct.

Show at least two meaningfully different information architectures when the direction is uncertain. Changing accent colors on the same layout does not count.

### 2. Build a compositional system, not a template

- Use a compact persistent navigation shell only when the app has enough destinations to justify it.
- Prefer well-aligned lists, tables, tabs, contextual inspectors, and visible selection states over repeated cards.
- Establish one clear content hierarchy. Major pages may have distinct layouts but must share tokens and interaction patterns.
- Let whitespace separate groups. Use borders and surfaces only when they clarify hierarchy.
- Use gradients sparingly, never behind substantial reading content.
- Keep explanatory AI chat secondary when the product has a useful deterministic workflow.
- Avoid decorative charts, invented metrics, fake confidence scores, nonfunctional icons, and filler marketing claims.

### 3. Tokens and components

- Define theme colors, typography, type sizes, spacing, radii, shadows, motion, and breakpoints in one source of truth.
- Keep body text readable, numeric values tabular, and secondary text legible. Verify contrast in actual rendered contexts.
- Build components from accessible, largely unstyled primitives when needed; do not inherit a ready-made gallery aesthetic.
- Treat hover, focus, active, disabled, loading, empty, error, and partial-data states as part of the design, not afterthoughts.
- Use real assets only when license and attribution allow it. Never fake screenshots or source-backed statistics.

### 4. Interaction and responsive behavior

- Every visible interactive affordance must work and have a meaningful outcome.
- Use keyboard-accessible search, filters, tabs, dialogs, and navigation; restore focus correctly after overlays.
- Preserve useful state during navigation. Filters should survive refresh or be encoded in URLs when appropriate.
- Design mobile layouts deliberately: navigation compresses, tables gain responsive alternatives, inspectors become drawers or sheets.
- Ensure long names, localized strings, missing artwork, empty states, and dense numeric data do not clip or overflow.
- Respect reduced-motion preferences. Animation should communicate transitions or state, not show off.

### 5. Verify in a running UI

- Compare screenshots at desktop (~1440 and 1280px), tablet (~768px), mobile (~390 and 320px), and zoomed text where practical.
- Check readable contrast against WCAG AA targets, text resizing, focus visibility, keyboard-only flows, touch target usability, and form labels.
- Test representative real data, no-data states, long labels, and network / model-offline states.
- Check for duplicated styling overrides, inconsistent spacing, unnecessary dependencies, and layouts that only work in the designer's chosen screenshot.
- Do not claim visual inspection, accessibility compliance, or passing tests without actual evidence.

## Anti-template review

Reject or revise a UI if any of these are true:

- It could be relabeled for an unrelated AI startup with no structural changes.
- The first screen is a huge headline, a glowing AI input, and three generic feature cards when a real tool could appear instead.
- Color, gradient, border, and shadow all compete to mark the same hierarchy.
- Every page repeats the same hero and card arrangement despite different user tasks.
- A selected surface is uncomfortably bright against a dark workspace.
- A compact-looking row has unusably small clickable controls or illegible text.
- A decorative effect or copy choice is doing the work that data design should do.

## Handoff contract

Before implementation, provide: product and audience, chosen interaction concept, competing alternative, sitemap / flows, desktop and mobile wireframes, design tokens, component states, risks, and acceptance checks.

During implementation, work in reviewable increments, avoid parallel CSS override layers, and compare rendered screenshots against the approved spec.

Before declaring done, provide evidence for visual, responsive, keyboard, contrast, and functional checks; explicitly label anything unverified.
