# TritonLens Release Checklist

This is a preparation checklist, not approval to publish. The current Easy-A
Radar snapshot remains development-only. Do not upload or publicly distribute
the current bundle while its redistribution review is unresolved.

## Data and Provenance

- [ ] Resolve upstream redistribution and source-policy questions recorded in
  `DATA_SOURCES.md`; retain private permission evidence outside Git.
- [ ] Review attribution and select a license for original TritonLens code.
  A code license does not automatically license bundled third-party data.
- [ ] Validate the intended release dataset with `validateLocalDataset()` in
  production mode; do not simply remove development labels.
- [ ] Confirm source dates, safe identity matches, unavailable values, and
  historical-not-prediction labels in the intended release build.

## Privacy and User Information

- [x] Draft privacy documentation for the current implementation.
- [x] Document why TSS-only content-script access is necessary.
- [ ] Review privacy claims against the final bundle and manifest.
- [ ] Add a public support/contact channel and stable privacy-document URL.
- [ ] Prepare an accurate store description without grade predictions or
  claims of UCSD affiliation.

## Packaging and Verification

- [x] Add extension icons and copy them into the build output.
- [ ] Choose a release version and keep package and manifest versions aligned.
- [ ] Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run build`.
- [ ] Review the production package: include only required runtime files;
  exclude `AGENTS.md`, raw captures, credentials, tests, and source maps.
- [ ] Test loading the package in a clean Chrome profile. Any authenticated
  TSS checks must use manual login without recording credentials.
- [ ] Check multiple departments, missing and ambiguous instructors, aliases,
  duplicate badges, course navigation, browser reload, and ordinary TSS actions.
- [ ] Check narrow layouts, keyboard activation, Escape, focus restoration,
  source links, and outside-click dismissal.
- [ ] Capture release screenshots with no private student or session data.
- [ ] Review current Chrome Web Store requirements before submission.

## Development Verification Record

On 2026-09-15, the user reported passing the latest live-TSS smoke checklist:
course switching, repeated card use, empty-instructor behavior, no duplicate
badges, and ordinary TSS actions. This is user-reported validation, not a
clean-profile package test or proof of every department/layout.
