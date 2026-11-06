# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a 9th-grade student (the family's own son) practicing for a math exam and building arithmetic fluency. Secondary: a parent (views a progress dashboard, adjusts lesson settings, gifts coins) and an admin who manages parent accounts. In practice all three roles are operated by one family running their own private deployment, not a multi-tenant product for unrelated families.

## Product Purpose

Help a 9th-grade student prepare for a math exam through structured, self-paced practice: Kumon-style repetitive drilling for arithmetic fundamentals (addition through long multiplication/division, fractions, decimals), plus guided instruction for harder algebra topics (linear equations, quadratic functions, step-by-step equation solving). Coins and streak rewards sustain motivation; a parent dashboard gives oversight without requiring the parent to sit with the student.

## Positioning

Combines Kumon's mastery-through-repetition drilling method with an interactive "notebook" teaching flow that walks through the actual reasoning steps of solving an equation (choose the inverse operation, compute, check by substitution) rather than plain multiple-choice quizzing — fully localized for Hebrew/RTL with math notation correctly isolated as LTR within the RTL page.

## Operating Context

Used at home, likely on a phone or shared family computer, in short self-directed practice sessions. A lesson-timer feature tracks real practice time (12 sessions of 1.5 net hours each, separate from quick multiple-choice drill sheets) with a shoe-reveal puzzle reward. The parent periodically opens the dashboard to check status, weekly/monthly time, per-topic gaps, and to gift coins or adjust a student's lesson program.

## Capabilities and Constraints

- Single-file static web app (`index.html`) plus one small serverless function (`api/manage-user.js`, Node, Firebase Admin SDK) used only for privileged account actions (password reset, parent profile edit, delete) that the Firebase client SDK cannot perform on another user's behalf.
- Firebase Realtime Database backend (Auth + Realtime Database); deployed on Vercel.
- **Hard constraint: Hebrew RTL throughout the page, with all math/equation notation kept LTR-isolated inside it** (`direction:ltr; unicode-bidi:isolate` on math spans). This must not regress in any redesign.
- Must keep working well on a phone-width mobile browser, since a 14-year-old is the primary daily user.
- Three roles (student/parent/admin) share one codebase and one set of screens; there is no separate marketing site.

## Brand Commitments

- App name: "מערכת תרגול חשבון ומתמטיקה בהשראת Kumon" (established this project; keep as the page title and header).
- The user supplied a specific CSS design-token set as the binding visual direction for a full redesign: a warm "paper" surface palette, blue/orange/mint/sun/pink/purple accents, `Fredoka` (display) + `Rubik` (body) typefaces, a generous rounded-corner scale, and a signature "chunky" button with a hard offset shadow that compresses on press. This only covers tokens + one button state; it needs to be extended (cards, inputs, badges, the notebook/formula-box treatment, admin tables, etc.) in the same spirit rather than treated as exhaustive.

## Evidence on Hand

Live production app with real usage data (~95+ real practice submissions from the actual student). No logo file or other brand imagery is known to exist.

## Product Principles

1. The student's daily practice screens are the product's core — polish there matters more than the admin/parent screens, though both must stay usable and consistent.
2. Hebrew-first, RTL-correct: never let a redesign regress math/equation legibility or direction.
3. Gamification (coins, streaks, the lesson puzzle) should read as genuinely rewarding, not as a decorative afterthought bolted onto the new design system.
4. A single family runs admin/parent/student themselves — clarity and low friction beat enterprise-dashboard density.
5. Keep the app a zero-friction static deploy wherever possible; only the already-added privileged actions need the serverless function.

## Accessibility & Inclusion

No specific standard was established. General good practice applies given the primary user is a teenager on a phone: legible contrast, touch-sized tap targets, and no reliance on color alone for correct/incorrect feedback.
