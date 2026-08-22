## What changed

<!-- One or two sentences. What behaviour does this add, fix or cover? -->

## Why

<!-- The requirement, bug or gap behind it. Link the ticket if there is one. -->

## Layering

- [ ] Selectors live in `object-repository/`, not in a page object, step definition or feature
- [ ] Accounts and records come from `test-data/` — no credentials in a feature or page object
- [ ] Step definitions delegate to page objects — no selectors, no assertions
- [ ] Assertions are derived from test data, not re-read from the element under test

## Evidence

- [ ] `npm run verify` passes (lint, format, step validation)
- [ ] `npm test` passes locally
- [ ] Every new assertion was made to fail on purpose at least once, then restored

<!--
An assertion that has never failed has never been verified. If you did not watch it go red,
you do not yet know it is testing anything.
-->

## Notes for the reviewer

<!-- Anything surprising: a documented selector exception, a deliberate wait, a skipped case. -->
