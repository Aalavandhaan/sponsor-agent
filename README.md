# Sponsor Connect

Build this as a React frontend that can later be exported to GitHub and deployed on AWS Amplify. Do not create a backend, database, or Supabase integration. The backend already exists in AWS. Only build the frontend and wire it to the REST APIs I provide.

This is the workflow btw,  js for the reference form → Find Sponsors → results → Research Contact → email draft.

Build a modern React frontend for an AI sponsorship outreach agent called Sponsor Agent.

The app should have a form with:

 Event name

 Place / city

 Expected footfall

 Audience type

 Event category

 Sponsorship needed

Add a “Find Sponsors” button.

After submission, show sponsor research results in cards or a clean results panel.

Each sponsor should have:

 Sponsor name

 Why they are relevant

 Past similar events sponsored

 Evidence/source links

 “Find Contact” button

When “Find Contact” is clicked, show:

 Whether a verified person was found

 Recommended department/role

 Contact name/title if available

 Contact channel URL

 Verification/evidence links

 Generated sponsorship email in an editable textarea

Add:

 “Approve & Send”

 “Approve All Verified Contacts”

Do not implement backend logic yet. Make the UI responsive, polished, hackathon-demo ready, and easy to connect to REST APIs later.

Use React and clean component structure.

Redesign the existing Sponsor Agent frontend completely. Do NOT change the functionality, form fields, data flow, or page structure unless necessary for usability.

I want the visual language to feel closer to Meetup, Eventbrite, LinkedIn, or a mature event-management SaaS product rather than an AI-generated startup landing page.

Remove all obvious “AI website” styling:

 no dark neon theme

 no gradients

 no glowing borders

 no glassmorphism

 no giant hero headline

 no pill-shaped AI badge

 no sparkle / magic / lightning icons

 no unnecessary icons next to every input

 no excessive rounded cards

 no purple/cyan/green startup gradients

Use a clean light interface with an off-white or white background, dark charcoal text, subtle gray borders, and one restrained accent color similar to the warm red/coral used by event-discovery platforms.

The header should look like a normal web product:

Sponsor Agent logo/name on the left.

On the right:
“How it works”
“Past searches”
“Connect Gmail”

Keep the header compact, around 64–72px tall.

Do NOT make the top section look like a marketing landing page.

Instead, use a straightforward page title:

“Find sponsors for your event”

Supporting text:
“Tell us about your event. Sponsor Agent researches similar events, identifies companies that have sponsored them before, and helps you reach the right people.”

Below that, make the event form the main focus.

Form design:

 Event name full width

 Place / City and Expected footfall on one row

 Audience type and Event category on one row

 Sponsorship needed full width

 Large but normal primary button saying “Find sponsors”

Inputs should look like standard high-quality product inputs, not futuristic UI components.

Use approximately 8–12px border radius, subtle #E5E7EB-style borders, white backgrounds, and clear labels above fields.

Avoid icons inside the form unless they genuinely improve usability.

Typography should feel editorial and professional. Use Inter, Arial, Helvetica, or a similar neutral sans-serif. Avoid futuristic fonts.

Make the content width around 1050–1150px and use plenty of natural whitespace.

When sponsor results appear, display them as clean rows/cards similar to event listings or LinkedIn search results.

Each sponsor result should emphasize:

 company name

 why it matches

 past events sponsored

 confidence / evidence

 source links

 a clear “Research contact” button

Do not use giant colorful cards for every sponsor.

The contact research view should feel like a professional research panel:

 Company

 Recommended role

 Verified person if found

 Contact route

 Evidence

 Draft email

The email draft should resemble an email composer, not a generic textarea. Show To, Subject, and Message sections.

Buttons should use clear product language:
“Find sponsors”
“Research contact”
“Review email”
“Approve & send”
“Approve selected”

Overall design goal:
This should look like something an event organizer would actually use at work, not something generated during an AI hackathon.

Keep it polished, restrained, modern, and human-designed.

Do not change or remove existing backend placeholders/API hooks.

And one extra thing I’d tell Bolt after it does the redesign:

Reduce the number of border-radius values across the app. Use only 8px, 12px, and 16px consistently. Remove decorative icons unless they communicate an actual action.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sponsor-scout-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4dcd3f3f-fc76-439b-af66-46476346befb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
