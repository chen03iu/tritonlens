# TritonLens Release Checklist

This is a preparation checklist, not legal approval to publish. The default
build includes the Easy-A-derived RMP/UCSD metric snapshot and labels its
source permissions as pending. `npm run build:link-only` remains available as
the no-snapshot fallback.

## Data and Provenance

- [ ] Resolve upstream redistribution and source-policy questions recorded in
  `DATA_SOURCES.md`; retain private permission evidence outside Git.
- [ ] Review attribution and select a license for original TritonLens code.
  A code license does not automatically license bundled third-party data.
- [x] Verify the default bundle contains the snapshot and the explicit
  pending-permission disclosure.
- [x] Verify the link-only bundle contains no Easy-A/RMP/UCSD metric snapshot.
- [ ] Resolve direct RMP and UCSD redistribution permission before describing
  the snapshot as approved or production-authorized.

## Privacy and User Information

- [x] Draft privacy documentation for the current implementation.
- [x] Document why TSS-only content-script access is necessary.
- [x] Review privacy claims against the final bundle and manifest.
- [x] Add a public support/contact channel and stable privacy-document URL.
- [ ] Prepare an accurate store description without grade predictions or
  claims of UCSD affiliation.

## Packaging and Verification

- [x] Add extension icons and copy them into the build output.
- [x] Choose a release version and keep package and manifest versions aligned.
- [ ] Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run build`.
- [ ] Confirm the default badge shows available ratings and its card shows the
  pending-permission label, source dates, and historical-not-prediction note.
- [ ] Confirm neither opening TSS nor scanning its DOM makes an automatic RMP
  or UCSD grade-source request; requests occur only after a user clicks a link.
- [ ] Inspect `dist/content.js` for the pending-permission marker and a known
  generated identity; separately verify `npm.cmd run build:link-only` excludes
  both.
- [x] Review the release package: include runtime files and the install guide;
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

## GitHub 0.2.0 preparation (2026-11-02)

See [release verification](docs/releases/0.2.0-verification.md) for package
contents, hashes and completed automated checks. Existing user acceptance
was recorded on 2026-10-29. A new authenticated TSS/clean-profile browser check
was not performed because browser control is unavailable. This preparation
does not complete the source-permission or Chrome Web Store items above.
