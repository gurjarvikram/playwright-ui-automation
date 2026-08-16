# Contributing

## Setup

```bash
nvm use            # picks up .nvmrc (Node 20)
npm ci             # installs exactly what package-lock.json pins
npx playwright install --with-deps chromium
cp .env.example .env
```

Use `npm ci`, not `npm install`. It installs the locked tree, so a run on your machine matches
a run in CI.

## The layering rule

Four layers, each with exactly one job. Almost every review comment on this repository is
about a change that crossed one of these lines.

| Layer                | Knows about                                | Never contains        |
| -------------------- | ------------------------------------------ | --------------------- |
| `features/`          | Business behaviour, in Gherkin             | Selectors, code       |
| `step-definitions/`  | Turning a sentence into a page-object call | Selectors, assertions |
| `pageobjects/`       | How to act on and assert a page            | Raw selector strings  |
| `object-repository/` | Selector strings, and nothing else         | Behaviour, assertions |

A selector string appears in exactly one file. When the UI changes, the fix is a one-line edit
in the object repository and nothing else in the suite moves.

## Adding a test

1. **Describe the behaviour** in a `.feature` file and tag it — feature-level tags for the
   area and the tier, scenario-level tags for `@smoke` and `@negative`.
2. **Register the selector** in the matching `object-repository/*.objects.js` file.
3. **Add the interaction and its assertion** to the page object. Assertions belong here, not
   in the step definition.
4. **Wire the step**, as a one-line delegation.
5. **Prove the test can fail.** Break the expectation on purpose, watch it go red, then
   restore it.

Step five is not optional. An assertion that has never failed has never been verified.

## Conventions

- **Selectors** — prefer `[data-test="…"]`, which the application owns. Never select on CSS
  classes or on copy text; both exist for presentation and change without notice. Where the
  application gives you nothing, address the control by role. Every exception carries a
  comment saying why, as `navigation.objects.js` does for the third-party burger menu.
- **Waiting** — never a fixed sleep. Playwright's locators and `expect` retry on their own;
  assert on the state you are waiting for instead. A `waitForTimeout` in a diff will be
  rejected.
- **Step uniqueness** — every step definition file is loaded for every feature, so step text
  is globally unique. Shared steps belong in `common.steps.js`; a duplicate fails the run
  immediately, which is the intended safety net.
- **Assertions** — derive the expected value from the test data, not from the DOM you are
  checking. Comparing a page's rendering against itself always passes.
- **Test data** — generate per-scenario data in the World (`newCustomer()`). Module-level data
  is created once per worker process and leaks between scenarios.
- **`this` in step definitions** — use `function`, never an arrow. An arrow function loses the
  Cucumber World and fails at run time.

## Before opening a pull request

```bash
npm run verify     # eslint, prettier, and a dry run that resolves every step
npm test           # the full suite
```

Branch from `main` as `feat/…`, `fix/…`, `refactor/…` or `ci/…`. CI must be green on all three
browser engines before merge.
