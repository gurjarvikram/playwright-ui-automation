# playwright-automation

BDD test automation for [saucedemo.com](https://www.saucedemo.com), built with [Cucumber.js](https://github.com/cucumber/cucumber-js) driving [Playwright](https://playwright.dev/) via the Page Object Model, with [Allure](https://allurereport.org/) reporting.

## Structure

```
features/            Gherkin .feature files (scenarios)
step-definitions/     Given/When/Then implementations + hooks (browser lifecycle)
support/world.js      Cucumber World: wires page objects into each scenario
pageobjects/          Page Object Model classes (all extend BasePage)
config/env.js         Environment config (base URL, credentials, headless flag)
```

## Setup

```bash
npm install
cp .env.example .env   # optional: override base URL / credentials / headless mode
npx playwright install chromium
```

## Running tests

```bash
npm test               # full suite
npm run test:login     # only @login scenarios
npm run test:navigation
npm run test:product
```

## Reports

```bash
npm run report          # run tests, then generate + open the Allure report
npm run report:generate # generate allure-report/ from allure-results/
npm run report:open     # open the last generated report
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `SAUCE_BASE_URL` | `https://www.saucedemo.com` | Site under test |
| `SAUCE_USERNAME` | `standard_user` | Login username |
| `SAUCE_PASSWORD` | `secret_sauce` | Login password |
| `HEADLESS` | `true` | Run browser headless |

## CI

`.github/workflows/playwright.yml` runs the full suite on every push/PR to `main` and uploads the Allure report as a build artifact.
