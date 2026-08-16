# Security policy

## Scope

This repository contains an automated test suite. It holds no application code and no
production data. The credentials in `fixtures/users.json` are Sauce Labs' public demo
credentials, published by Sauce Labs on the login page of the site under test.

## Reporting a vulnerability

Open a [private security advisory](https://github.com/gurjarvikram/playwright-ui-automation/security/advisories/new)
rather than a public issue. Expect an acknowledgement within five working days.

## Handling credentials

If this framework is pointed at a non-public environment, its credentials must not enter the
repository:

- Supply them through `SAUCE_USERNAME` / `SAUCE_PASSWORD` in a local, git-ignored `.env`, or
  through GitHub Actions repository secrets in CI.
- `.gitignore` excludes every `.env` variant except the documented `.env.example` template.
- A secret that has been committed must be **rotated**. Rewriting git history does not
  invalidate a credential that has already been published, and forks and clones keep it.

## Failure artefacts

Traces, videos and screenshots capture whatever was on screen, including anything typed into
a form. They are uploaded as workflow artefacts with a 7-day retention. Treat them as
sensitive when the suite runs against an environment holding real data.
