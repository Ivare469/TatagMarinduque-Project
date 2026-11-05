# AI-Assisted Tasks

This file records the project work completed with AI assistance. It is not a claim that the prototype has been reviewed, approved, or submitted by the course team.

## Completed

- Translated the TatagMarinduque project brief into a monorepo structure using the required Next.js, Express, and MongoDB/Mongoose stack.
- Scaffolded the Next.js App Router client and added shared root scripts, environment-variable template, ignore rules, and local setup documentation.
- Designed and implemented the responsive marketplace homepage using the brief's sea, straw, background, ink, and success colors; added typography, focus styles, reduced-motion handling, and a system dark theme.
- Added a searchable sample vendor directory view on the homepage with Food/Crafts filters, a DTI-verified-only filter, capacity details, and sample-status labels.
- Added a quote-request dialog with basic required-field validation and an explicit prototype-only confirmation state.
- Added a sourcing-board preview with Need/Supply examples and sample-data labels.
- Added dedicated directory, sample maker profile, quote request, sourcing board, and about pages.
- Added API-connected account registration/sign-in, a one-screen vendor profile/product/quote dashboard, and an officer verification queue.
- Added five Mongoose schemas with enums, input bounds, references, timestamps, and vendor/bulletin search indexes.
- Added Express routes for registration, login, current user, vendor search/profile and officer verification, product management, quote requests/replies, and sourcing posts.
- Added Zod request validation, bcrypt password hashing, JWT authentication, role checks, ownership checks, safe regex escaping for vendor search, and consistent API error responses.
- Added a seed script for six vendors (four verified, two pending), products, and three bulletin posts. All seeded names and product entries are explicitly marked as samples.
- Added five backend unit tests covering request validation, escaped vendor search filters, and role guards.
- Added this task log and the project README, including the prototype boundaries and local run instructions.
- Ran frontend ESLint, a production Next.js build, API JavaScript syntax checks, and the backend unit tests.
- Checked home/directory search, quote-form navigation, all four catalog images, verified filtering, the dark theme token, and a 360px-wide viewport in the browser.

## Still requiring team work

- Review the generated code and test the API against a configured MongoDB instance.
- Connect the sample directory and sourcing-board forms to the API, then add database-backed integration tests.
- Replace sample content with approved vendor data and actual product photography; confirm all contact details and certifications with their owners.
- Confirm instructor submission requirements, team member names, research references, and deployment expectations.
- Add end-to-end tests for database-backed authentication, quote creation, and verification; complete accessibility and 360px device review.
- Configure production secrets, MongoDB Atlas, hosting, and deployment. No deployment has been performed.
