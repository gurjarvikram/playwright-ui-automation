# Playwright UI Automation Framework

[![CI](https://github.com/gurjarvikram/playwright-ui-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/gurjarvikram/playwright-ui-automation/actions/workflows/ci.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.62-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-BDD-23D96C?logo=cucumber&logoColor=white)](https://cucumber.io/)
[![Allure](https://img.shields.io/badge/Allure-Report-FF6A00)](https://allurereport.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

End-to-end UI automation for the [Swag Labs](https://www.saucedemo.com) demo shop, built with
**Playwright**, **Cucumber (Gherkin BDD)**, an **Object Repository** and the **Page Object
Model**. Scenarios are tag-driven, run across Chromium, Firefox and WebKit in GitHub Actions,
and publish a merged Allure report with trend history, plus a trace and video for every
failure.

> **Why Cucumber rather than `@playwright/test`?** Playwright ships its own runner, so this is
> a deliberate choice, not an oversight. The runner here is `@cucumber/cucumber`; Playwright
> provides the browser automation and the `expect` assertions. That trade buys
> business-readable specs at the cost of Playwright's fixtures and its native HTML report —
> which is why the World, the hooks and the Allure wiring in `support/` exist.

---

## Table of contents

- [Why this framework](#why-this-framework)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Reports and artefacts](#reports-and-artefacts)
- [Continuous integration](#continuous-integration)
- [Running in Docker](#running-in-docker)
- [Writing a new test](#writing-a-new-test)
- [Conventions](#conventions)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Why this framework

| Concern             | Approach                                                                             |
| ------------------- | ------------------------------------------------------------------------------------ |
| Readability         | Business-readable Gherkin, one feature per user-facing area                          |
| Maintainability     | Object Repository + Page Object Model — a selector is defined exactly once           |
| Stability           | `data-test` selectors, no fixed waits, auto-retrying assertions, one CI retry        |
| Speed               | Tag-driven subsets (`@smoke` in seconds) and four parallel workers per job           |
| Cross-browser truth | The full suite runs on Chromium, Firefox **and** WebKit on every push                |
| Diagnosability      | Allure report with trend and failure categories, plus a trace and video per failure  |
| Safety              | Lint, format and step-resolution gate the pipeline before a browser is ever launched |
| Portability         | Every setting is environment-driven; a pinned Docker image reproduces CI exactly     |

---

## Architecture

Four layers, each with one job, plus a test-data layer feeding them. The two rules that hold
the suite together are that **a selector string appears in exactly one file** and that
**no credential or record is typed into a feature, a step or a page object**.

```
                           features/*.feature            Gherkin — what the business expects
                                   │  step text
                                   ▼
test-data/index.js  ── values ──▶  step-definitions/*.steps.js   One-line delegation.
  users.js  accounts               │  method call
  customer.js  generated records   ▼
                           pageobjects/*.js              How to act, and how to assert.
                                   │  selector lookup
                                   ▼
                           object-repository/*.objects.js   Selector strings, and nothing else.
```

| Layer                | Knows about                                | Never contains          |
| -------------------- | ------------------------------------------ | ----------------------- |
| `features/`          | Business behaviour, in Gherkin             | Selectors, code         |
| `step-definitions/`  | Turning a sentence into a page-object call | Selectors, assertions   |
| `pageobjects/`       | How to act on and assert a page            | Raw selectors, raw data |
| `object-repository/` | Selector strings, and nothing else         | Behaviour, assertions   |
| `test-data/`         | Accounts and generated records             | Selectors, page logic   |

The data layer is entered from the step definition, which resolves the values and passes them
down. A page object therefore never knows where its data came from, which is what lets the
same `loginPage.login()` serve a fixture today and an account created through an API later.

When the UI changes, the fix is a one-line edit in the object repository and nothing else in
the suite moves. Two supporting pieces sit beside those layers:

- **`support/world.js`** — the Cucumber World. Constructed once per scenario, it wires the
  page objects to a fresh page and generates that scenario's customer data. Because everything
  hangs off `this`, no state can leak between scenarios, which is what makes the suite safe to
  run in parallel.
- **`step-definitions/hooks.js`** — browser lifecycle. One browser per worker process, a fresh
  `BrowserContext` per scenario, and the trace/video/screenshot retention policy.

---

## Tech stack

| Tool                                                                 | Purpose                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| [Playwright](https://playwright.dev/) 1.62                           | Browser automation and auto-retrying `expect`        |
| [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) 13     | Gherkin runner, tag filtering, parallel workers      |
| [Allure](https://allurereport.org/) 2                                | Reporting, with trend history and failure categories |
| [@faker-js/faker](https://fakerjs.dev/) 9                            | Per-scenario checkout customer data                  |
| [dotenv](https://github.com/motdotla/dotenv)                         | Local `.env` values, keeping secrets out of the repo |
| [ESLint](https://eslint.org/) 9 + [Prettier](https://prettier.io/) 3 | Static analysis and one formatting authority         |
| [GitHub Actions](https://docs.github.com/actions)                    | Quality gate, smoke, three-engine regression, report |

---

## Prerequisites

| Requirement                    | Version                                  |
| ------------------------------ | ---------------------------------------- |
| [Node.js](https://nodejs.org/) | `>= 22` (see [`.nvmrc`](.nvmrc))         |
| npm                            | `>= 10` (ships with Node 22)             |
| Java                           | `17+`, only to generate an Allure report |
| OS                             | Linux, macOS or Windows                  |

```bash
nvm use          # picks up .nvmrc
node --version   # v22.x
```

Browser engines are installed by Playwright itself, not by your package manager:

```bash
npx playwright install --with-deps chromium          # the default engine
npx playwright install --with-deps firefox webkit    # only if you run the full matrix
```

`--with-deps` installs the system libraries the engines need. On Linux it uses `sudo`; without
it WebKit fails to launch with a "Host system is missing dependencies" error listing
`libgstcodecparsers`, `libflite` and friends.

---

## Getting started

```bash
git clone https://github.com/gurjarvikram/playwright-ui-automation.git
cd playwright-ui-automation

npm ci                                        # installs exactly what package-lock.json pins
cp .env.example .env                          # optional: every value already has a default
npx playwright install --with-deps chromium

npm test                                      # full suite, headless
npm run test:headed                           # watch it happen, serially
```

> Use `npm ci` rather than `npm install`. It installs the locked dependency tree, so a run on
> your machine matches a run in CI.

---

## Running tests

| Command                   | What it runs                                                 |
| ------------------------- | ------------------------------------------------------------ |
| `npm test`                | Full suite, headless, default engine                         |
| `npm run test:smoke`      | `@smoke` only — the critical path, the fast confidence check |
| `npm run test:regression` | `@regression` only                                           |
| `npm run test:negative`   | `@negative` only — validation and error handling             |
| `npm run test:login`      | `@login` scenarios                                           |
| `npm run test:navigation` | `@navigation` scenarios                                      |
| `npm run test:product`    | `@product` scenarios                                         |
| `npm run test:chromium`   | Full suite in Chromium                                       |
| `npm run test:firefox`    | Full suite in Firefox                                        |
| `npm run test:webkit`     | Full suite in WebKit                                         |
| `npm run test:headed`     | Headed and serial — for watching or debugging                |
| `npm run test:parallel`   | Four workers                                                 |
| `npm run test:serial`     | One process                                                  |
| `npm run verify`          | Lint, format check, and step resolution — no browser         |
| `npm run report`          | Run, then generate and open the Allure report                |
| `npm run clean`           | Delete `allure-results/`, `allure-report/` and `artifacts/`  |

### Targeting specific scenarios

```bash
# One feature file
npx cucumber-js features/login.feature

# Tag expressions — and / or / not are all supported
npx cucumber-js --tags "@smoke and not @negative"
npx cucumber-js --tags "@login or @navigation"

# A single scenario, by line number
npx cucumber-js features/product.feature:31
```

The browser and headed scripts go through [`scripts/run-suite.js`](scripts/run-suite.js),
which sets the environment variables and forwards anything after `--` to Cucumber:

```bash
node scripts/run-suite.js --browser webkit --headed --serial -- --tags "@smoke"
```

Cucumber has no native `--browser` flag, and `BROWSER=firefox cucumber-js` is POSIX-only
syntax that `cmd.exe` does not understand. Spawning the runner from Node sets the variables
identically on every platform without adding `cross-env` as a dependency.

### Tags

| Tag                                 | Meaning                                             |
| ----------------------------------- | --------------------------------------------------- |
| `@smoke`                            | Critical path. Gates the rest of the pipeline in CI |
| `@regression`                       | Full functional coverage — applied at feature level |
| `@negative`                         | Validation and error handling                       |
| `@login`, `@product`, `@navigation` | Functional area                                     |

---

## Project structure

```
playwright-ui-automation/
├── .github/
│   ├── workflows/ci.yml              # Quality → smoke → 3-engine regression → merged report
│   ├── dependabot.yml                # Grouped weekly dependency updates
│   ├── CODEOWNERS
│   └── pull_request_template.md      # Enforces the layering checklist at review time
├── features/                         # Gherkin specs — the executable requirements
│   ├── login.feature
│   ├── navigationDrawer.feature
│   └── product.feature
├── step-definitions/                 # Gherkin → page object glue
│   ├── common.steps.js               # Steps used by more than one feature
│   ├── login.steps.js
│   ├── navigationDrawer.steps.js
│   ├── product.steps.js
│   ├── checkout.steps.js
│   └── hooks.js                      # Browser lifecycle, trace/video/screenshot retention
├── pageobjects/                      # Page Object Model — actions and assertions
│   ├── basePage.js                   # Shared locators, navigation, common assertions
│   ├── loginPage.js
│   ├── inventoryPage.js
│   ├── cartPage.js
│   ├── checkoutInformationPage.js
│   ├── checkoutOverviewPage.js
│   └── navigationDrawerPage.js
├── object-repository/                # Selector strings — one file per page
│   ├── common.objects.js             # Header, title, error banner, item tile, cart badge
│   ├── login.objects.js
│   ├── inventory.objects.js
│   ├── cart.objects.js
│   ├── checkout.objects.js
│   ├── navigation.objects.js
│   └── index.js                      # Barrel — page objects import from here
├── config/
│   ├── environments.json             # baseUrl per environment — no URL in code
│   ├── resolve-environment.js        # Picks the environment, fails loudly if unknown
│   └── env.js                        # Browser, headless, artefacts — no test data
├── test-data/                        # What the suite feeds the application
│   ├── users.json                    # Test accounts, keyed by role
│   ├── users.js                      # getUser(role), plus the standard-user env override
│   ├── customer.js                   # buildCustomer() — generated checkout details
│   └── index.js                      # Barrel — step definitions import from here
├── support/
│   ├── world.js                      # Cucumber World — page objects and per-scenario data
│   ├── logger.js                     # Structured, worker-attributed logging
│   └── allure-metadata.js            # environment.properties, categories.json, executor.json
├── scripts/run-suite.js              # Cross-platform browser/headed runner
├── cucumber.js                       # Runner config — parallelism, strict mode, retry, formats
├── eslint.config.js
├── Dockerfile                        # Pinned Playwright image, all three engines
├── .env.example                      # Every variable, documented
└── .nvmrc
```

---

## Configuration

No environment value is hard-coded. Copy `.env.example` to `.env` for local overrides. `.env`
is git-ignored and is never read in CI, where GitHub Actions injects the same names from
repository secrets.

| Variable           | Default                                | Purpose                                                  |
| ------------------ | -------------------------------------- | -------------------------------------------------------- |
| `TEST_ENV`         | `production`                           | Which entry of `config/environments.json` to run against |
| `SAUCE_BASE_URL`   | _(unset)_                              | Ad-hoc URL override; wins over `TEST_ENV`                |
| `SAUCE_USERNAME`   | `standard_user`                        | Overrides the standard user's username                   |
| `SAUCE_PASSWORD`   | `secret_sauce`                         | Overrides the standard user's password                   |
| `BROWSER`          | `chromium`                             | `chromium`, `firefox` or `webkit`                        |
| `HEADLESS`         | `true`                                 | `false` to watch the browser                             |
| `CUCUMBER_WORKERS` | `0` local, `4` in CI                   | Parallel worker processes                                |
| `CUCUMBER_TAGS`    | _(empty)_                              | Tag expression; empty runs everything                    |
| `TRACE`            | `retain-on-failure`                    | `off`, `retain-on-failure` or `on`                       |
| `VIDEO`            | `off` local, `retain-on-failure` in CI | `off`, `retain-on-failure` or `on`                       |
| `ARTIFACTS_DIR`    | `artifacts`                            | Where traces and videos are written                      |
| `FAKER_SEED`       | _(unset)_                              | Makes generated checkout data repeatable                 |
| `LOG_LEVEL`        | `info`                                 | `debug`, `info`, `warn` or `error`                       |
| `LOG_FORMAT`       | `text`                                 | `json` for one JSON object per line                      |

### Target environment

The application URL is not hard-coded anywhere. It lives in
[`config/environments.json`](config/environments.json):

```json
{
    "production": { "baseUrl": "https://www.saucedemo.com" }
}
```

Add an environment by adding an entry, then select it with `TEST_ENV`:

```bash
TEST_ENV=staging npm test
SAUCE_BASE_URL=https://pr-42.review.example.com npm test   # ad-hoc override
```

Resolution order is `SAUCE_BASE_URL` → the `TEST_ENV` entry → `production`. An unrecognised
`TEST_ENV` **fails immediately** rather than falling back, because a silent fallback would run
the whole suite against the wrong site and still report green. Every run logs its target, and
the value is written into the Allure report's environment widget.

### Test data

Everything the suite types into the application comes from `test-data/`, reached through its
barrel. Nothing below the step definitions imports it.

**Fixed accounts** live in [`test-data/users.json`](test-data/users.json), keyed by role, and
are read with `getUser(role)`. A scenario names the role, never the credentials:

```gherkin
When I log in as the "lockedOut" user
```

```js
When('I log in as the {string} user', async function (role) {
    const { username, password } = getUser(role);
    await this.loginPage.login(username, password);
});
```

An unknown role fails immediately and lists the roles that do exist, and a role missing a
username or password is rejected when the file is loaded — so `npm run verify` catches a
malformed data file in about a second, without launching a browser.

`SAUCE_USERNAME` / `SAUCE_PASSWORD` override the **standard** user only. A scenario that names
a specific account is about that account's behaviour, so an environment override there would
quietly turn the test into something else.

**Generated records** — the checkout customer — come from `buildCustomer()`, called once per
scenario by the World and reached as `this.customer`. Nothing is generated at module scope: a
module is evaluated once per worker process, so module-level data would be shared by every
scenario that worker runs, which is the classic way a parallel suite starts failing in ways it
cannot reproduce serially. Individual fields can be pinned when a scenario is about a specific
value:

```js
this.newCustomer({ postalCode: 'SW1A 1AA' });
```

Set `FAKER_SEED` to make a run repeatable when a generated value is implicated in a failure.
Each worker seeds its own copy of faker, so pair it with `CUCUMBER_WORKERS=0`:

```bash
FAKER_SEED=42 CUCUMBER_WORKERS=0 npm test
```

### Runner defaults

Set in [`cucumber.js`](cucumber.js):

| Setting    | Value                | Rationale                                                                      |
| ---------- | -------------------- | ------------------------------------------------------------------------------ |
| `strict`   | `true`               | An undefined or pending step fails the run instead of passing with gaps        |
| `retry`    | `1` in CI, `0` local | Absorbs shared-runner flake; a local failure stays failed while you look at it |
| `parallel` | `4` in CI, `0` local | One browser per worker process                                                 |

A scenario that only passes on retry is still reported as flaky, so the noise stays visible
rather than being swept up.

---

## Reports and artefacts

```bash
npm run report            # run, generate, open
npm run report:generate   # build allure-report/ from allure-results/
npm run report:open       # open the last generated report
```

The report carries more than pass/fail, because `support/allure-metadata.js` writes the three
files the Cucumber reporter does not:

| File                     | What it adds                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `environment.properties` | Environment, base URL, engine, headless, Node and OS — what the run actually tested |
| `categories.json`        | Sorts failures into product defect, broken selector, timeout, environment problem   |
| `executor.json`          | Links the report back to the CI run that produced it (written in CI only)           |

The product-defect versus test-defect split is the distinction that matters on a real project:
a failed assertion is a finding, whereas a timeout or a selector matching nothing is usually
the suite's own problem and should not be filed against the application.

### Failure artefacts

| Artefact   | Default                                | Where                             |
| ---------- | -------------------------------------- | --------------------------------- |
| Screenshot | On failure, always                     | Attached inside the Allure report |
| Trace      | On failure (`TRACE=retain-on-failure`) | `artifacts/<scenario>.trace.zip`  |
| Video      | On failure in CI (`VIDEO=…`)           | `artifacts/`                      |

The screenshot is small enough to live inside the report, so a reviewer sees the failure
without downloading anything. Open a trace for the full replay — DOM snapshots, network and a
timeline, step by step:

```bash
npx playwright show-trace artifacts/<scenario>.trace.zip
```

Playwright decides video recording when the context is created, so a video cannot be started
after a step has already failed. The hooks therefore record whenever retention is not `off`
and delete the file when the scenario passes.

---

## Continuous integration

[`ci.yml`](.github/workflows/ci.yml) runs on every push to `main`, every pull request, nightly
at 02:00 UTC, and on demand. Four stages, each gating the next:

1. **Quality** — ESLint, Prettier and a Cucumber dry run that resolves every step against its
   definition. Seconds, no browser. A lint error should never cost a full browser matrix to
   discover, and an undefined step is caught before anything is launched. A dependency audit
   runs advisory-only, so a new advisory is visible on the PR without blocking an unrelated
   merge.
2. **Smoke** — `@smoke` in Chromium. Fails fast on a broken critical path.
3. **Regression** — the full suite as a matrix across **Chromium, Firefox and WebKit**, with
   `fail-fast: false`, because one engine failing is a finding about that engine rather than a
   reason to abandon the evidence the other two are producing.
4. **Report** — merges the results from all three engines into one Allure report and carries
   trend history between runs, so "is this getting better or worse" is answerable.

Browser binaries are cached against the resolved Playwright version rather than the lockfile
hash, so an unrelated dependency bump does not evict them. In-flight runs are cancelled when a
newer commit lands on the same branch. Traces and videos are uploaded on failure with 7-day
retention.

**Optional repository secrets:** `SAUCE_BASE_URL`, `SAUCE_USERNAME`, `SAUCE_PASSWORD`. The
suite falls back to the documented public defaults when they are absent, so the workflow also
passes on pull requests from forks, which cannot read secrets.

---

## Running in Docker

The [`Dockerfile`](Dockerfile) is pinned to the Playwright image matching the version in
`package.json`. It ships all three engines and every system library they need — which is what
makes a container run reproduce a CI run exactly, and the quickest way past a local WebKit
that will not launch.

```bash
docker build -t playwright-ui-automation .

docker run --rm playwright-ui-automation                                   # full suite, chromium
docker run --rm -e BROWSER=webkit -e CUCUMBER_WORKERS=4 playwright-ui-automation
docker run --rm -v "$PWD/allure-results:/suite/allure-results" playwright-ui-automation
```

---

## Writing a new test

1. **Describe the behaviour** in a `.feature` file and tag it:

    ```gherkin
    @product @regression
    Feature: Product catalogue

      Background:
        Given I am logged in as a standard user

      @smoke
      Scenario: Sorting products from A to Z
        Then the products page should be displayed
        When I sort products by "Name (A to Z)"
        Then the products should be listed in ascending name order
    ```

2. **Register the selector** in the object repository file for that page:

    ```js
    export const inventoryObjects = Object.freeze({
        sortContainer: '[data-test="product-sort-container"]',
        activeSortOption: '[data-test="active-option"]',

        // Parameterised entries are plain functions.
        addToCart: (productSlug) => `[data-test="add-to-cart-${productSlug}"]`,
    });
    ```

3. **Add the interaction and its assertion** to the page object, importing from the barrel
   rather than writing a selector inline:

    ```js
    import { inventoryObjects } from '../object-repository/index.js';

    get sortContainer() {
        return this.page.locator(inventoryObjects.sortContainer);
    }

    async sortBy(optionLabel) {
        await this.sortContainer.selectOption({ label: optionLabel });
        // Asserting the applied label here means the sort has taken effect before the
        // caller reads the list — no fixed wait needed.
        await expect(this.activeSortOption).toHaveText(optionLabel);
    }
    ```

4. **Wire the step**, as a one-line delegation:

    ```js
    When('I sort products by {string}', async function (optionLabel) {
        await this.inventoryPage.sortBy(optionLabel);
    });
    ```

    If the scenario needs data, this is where it is resolved — `getUser(role)` for an account,
    `this.customer` for the generated record — and passed down as values. Add a new account or
    record to `test-data/` rather than typing it into the feature or the page object.

5. **Prove the test can fail.** Break the expectation on purpose, confirm a red run, then
   restore it. An assertion that has never failed has never been verified.

---

## Conventions

- **Selectors** — every selector belongs in `object-repository/`, never inline in a page
  object, step definition or feature. Prefer `[data-test="…"]`, which the application owns;
  never select on CSS classes or copy text, which exist for presentation and change without
  notice. Where the application offers nothing usable, address the control by role. Every
  exception carries a comment explaining why — see `navigation.objects.js`, where the
  third-party burger menu puts `data-test` on a decorative image while a transparent sibling
  button intercepts the click, so the control is reached by its accessible name instead.
- **Locators, not strings, across layers** — page objects expose Playwright `Locator`s. A
  Locator is lazy and re-queries on every use, so it survives a re-render; handing a string
  upward would tempt the layer above into building its own queries.
- **Waiting** — never a fixed sleep. Playwright's locators and `expect` retry on their own;
  assert on the state you are waiting for instead.
- **Step uniqueness** — every step definition file is loaded for every feature, so step text
  must be globally unique. Shared steps belong in `common.steps.js`; a duplicate fails the run
  immediately, which is the intended safety net.
- **Assertions** — derive the expected value from the test data, not from the DOM you are
  checking. Comparing a page's rendering against itself always passes. The checkout total is
  asserted as subtotal plus tax for exactly this reason.
- **Test data** — every account and every generated record comes from `test-data/`, through its
  barrel, and is resolved in the step definition. A credential typed into a `.feature`, a step
  or a page object is the same defect as a selector typed into a step. Per-scenario data is
  built in the World (`newCustomer()`); module-level data is created once per worker process
  and leaks between scenarios, which is the classic way a parallel suite starts failing in
  ways it cannot reproduce serially.
- **`this` in step definitions** — use `function`, never an arrow. An arrow function loses the
  Cucumber World and fails at run time.
- **Credentials** — those in `test-data/users.json` are the demo site's public credentials. Real
  credentials belong in environment variables locally and in repository secrets in CI. A
  secret that has been committed must be rotated; rewriting history does not invalidate it.

---

## Troubleshooting

| Symptom                                                                    | Cause and fix                                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Multiple step definitions match`                                          | The same step text is defined twice. Move it to `common.steps.js` and delete the copies.                                                                      |
| `Undefined. Implement with the following snippet`                          | Step text does not match any definition. Run `npm run validate:steps` — it resolves every step in about a second without a browser.                           |
| `function timed out, ensure the promise resolves within 5000 milliseconds` | A Cucumber step timeout, not a Playwright one. Usually a locator that never became actionable — open the trace to see what the page was doing.                |
| `<button …> intercepts pointer events`                                     | The element you targeted is visually beneath the real control. Target the control itself — by role if it has an accessible name. See `navigation.objects.js`. |
| `strict mode violation: resolved to N elements`                            | The selector matches more than one node. Narrow it, or scope it with `.first()` / `.nth()` deliberately.                                                      |
| WebKit: `Host system is missing dependencies`                              | Run `npx playwright install --with-deps webkit` (needs `sudo` on Linux), or run the suite in Docker, where the libraries are already present.                 |
| `Unknown TEST_ENV "…"`                                                     | The name is not in `config/environments.json`. Add it there, or use `SAUCE_BASE_URL` for a one-off run.                                                       |
| `Unknown BROWSER "…"`                                                      | Supported values are `chromium`, `firefox`, `webkit`.                                                                                                         |
| Allure report generates but is empty                                       | `allure-results/` was cleaned after the run. `npm test` cleans **before** running via `pretest`; generate the report from the same run's results.             |
| `allure: command not found` / report generation fails                      | Allure's CLI is a JVM tool. Install a JDK 17+, or read the raw results from the CI artefact instead.                                                          |
| Suite passes but proves nothing                                            | Mutate the expectation and confirm it fails. See step 5 of [Writing a new test](#writing-a-new-test).                                                         |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the layering rule, the conventions and the
pre-pull-request checklist. In short: branch from `main`, keep each layer doing its one job,
run `npm run verify && npm test`, and make every new assertion fail on purpose at least once.

Security policy: [SECURITY.md](SECURITY.md).

---

## License

Released under the [MIT License](LICENSE).

Swag Labs is a demo application provided by [Sauce Labs](https://saucelabs.com/) and is used
here purely as a test target.
