# TritonLens Release Checklist

This is a preparation checklist, not approval to publish. The default build is
link-only and excludes the Easy-A/RMP/UCSD metric snapshot. The separate
development-data build remains development-only and must not be uploaded or
publicly distributed while its redistribution review is unresolved.

## Data and Provenance

- [ ] Resolve upstream redistribution and source-policy questions recorded in
  `DATA_SOURCES.md`; retain private permission evidence outside Git.
- [ ] Review attribution and select a license for original TritonLens code.
  A code license does not automatically license bundled third-party data.
- [x] Verify the default release bundle contains no Easy-A/RMP/UCSD metric
  snapshot and does not import the development entry point.
- [ ] If a future release enables bundled metrics, validate its dataset in
  production mode and confirm permissions, source dates, safe identity matches,
  unavailable values, and historical-not-prediction labels.

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
- [ ] Confirm the default badge says `View ratings`, its card contains no score,
  GPA, grade graph, or update date, and both outbound links are HTTPS.
- [ ] Confirm neither opening TSS nor scanning its DOM makes an automatic RMP
  or UCSD grade-source request; requests occur only after a user clicks a link.
- [ ] Inspect `dist/content.js` for excluded development markers and a known
  generated-only identity; run `npm.cmd run build:development-data` only into a
  separate local output when that build is intentionally needed.
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
