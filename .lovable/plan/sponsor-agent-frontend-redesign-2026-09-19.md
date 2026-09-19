# Sponsor Agent frontend redesign

## Goal
Build the complete responsive Sponsor Agent demo at `/` without adding any backend, database, or authentication integration.

## What will be built
- Compact product header with Sponsor Agent branding and the requested navigation actions.
- Event brief form using the exact six fields and requested two-column layout.
- A realistic front-end-only workflow: event brief → sponsor results → contact research → editable email review.
- Restrained sponsor result rows showing company fit, prior sponsorships, confidence, sources, and “Research contact”.
- Professional contact research panel with verification state, role/person details, contact route, evidence, and an email composer with To, Subject, and Message fields.
- “Approve & send” and multi-select “Approve selected” controls, with clear demo states and no real email transmission.
- Responsive behavior for desktop and mobile.

## Visual direction
- Off-white page, white working surfaces, charcoal typography, subtle gray borders, and one warm coral accent.
- Neutral sans-serif typography and a compact 64–72px header.
- Consistent 8px, 12px, and 16px radii only.
- No gradients, glow, glass effects, decorative AI motifs, oversized marketing headline, or unnecessary icons.

## Technical approach
- Keep the app on React and TanStack Start, with the primary experience in the existing index route.
- Split the workflow into focused reusable React components and typed mock data.
- Keep data access behind frontend API adapter functions/placeholders so supplied REST endpoints can replace mock responses later without redesigning the UI.
- Use semantic design tokens in the global stylesheet and preserve the existing project structure.
- Add route-specific title, description, Open Graph, and Twitter metadata.
- Validate the rendered workflow at desktop and mobile widths, including form submission, contact research, email editing, selection, and approval states.

## Boundaries
- No Lovable Cloud, database, backend routes, email provider connection, or real sending.
- Existing functional placeholders will be preserved or replaced only with equivalent frontend adapters where the fresh template has none.
