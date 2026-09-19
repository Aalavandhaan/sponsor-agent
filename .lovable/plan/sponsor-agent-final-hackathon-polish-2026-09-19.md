# Sponsor Agent final hackathon polish

## Goal
Polish the existing Sponsor Agent experience for a clear, trustworthy demo without changing its AWS integrations, sponsor filtering, Gmail flow, or discovery behavior.

## What will change
- Add a compact four-step research progress indicator with one active step at a time:
  1. Finding similar events
  2. Discovering sponsor candidates
  3. Verifying outreach contacts
  4. Preparing personalized emails
- Keep the existing live status messages beneath the steps, including verified sponsor counts and additional-prospect searches, without exposing rejected companies.
- Add a subtle “Verified email” badge only to results that already passed `email_ready === true` and valid-email filtering.
- Reorganize each sponsor card for clearer scanning: “Why this sponsor,” past sponsored events, confidence, contact details, and a collapsed “Research evidence” section containing sponsor evidence URLs only.
- Refine the existing editable To / Subject / Message composer and approval controls so it is clear each sponsor receives an individual personalized message.
- Add a positive partial-result message when fewer than five verified sponsors are returned, plus the muted trust line about publicly verified professional email addresses.
- Add a compact, unframed “Built on AWS” section with the requested description and vertical architecture flow.
- Preserve the existing minimal footer text exactly.

## Technical details
- Extend only the presentation-facing progress phase labels; do not modify endpoint payloads, request concurrency, 5-of-20 search limits, filtering rules, or error handling.
- Keep Gmail access tokens in memory and preserve all existing OAuth and send behavior.
- Use existing semantic colors, spacing, typography, buttons, and restrained motion styles.
- Verify loading, completed, empty/partial, sponsor review, and bulk controls on desktop and mobile.

## Boundaries
- No backend, API, discovery, verification, Gmail, or email-delivery logic changes.
- No mock data, redesign, new routes, gradients, glass effects, neon styling, decorative AI motifs, or extra footer content.
