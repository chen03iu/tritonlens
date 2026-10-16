# TritonLens Privacy

Last updated: 2026-10-15

This document describes the default TritonLens build, which includes a static
data snapshot, and the optional link-only build. It must be reviewed again if
the extension adds remote data access, storage, analytics, or new permissions.

## Local Processing

TritonLens runs on `https://tss.ucsd.edu/*`. It reads displayed course,
instructor, term, section, schedule, location, and enrollment-count information
to associate its badges with the correct course entries. These values are
processed in browser memory and are not saved by the extension.

The default build performs local lookups against a bundled static snapshot of
professor ratings and aggregate historical-grade metrics. Those values are not
the user's personal grades. The optional link-only build omits the snapshot and
provides user-clicked external resource links instead.

## Information Not Collected

TritonLens does not collect, save, or transmit student names, student IDs,
passwords, authentication cookies, session tokens, personal grades, enrollment
history, financial information, or degree-audit information. It has no
analytics, advertising, accounts, backend, or cloud synchronization.

The extension does not use browser storage or make automatic network
requests. It does not automate enrollment or other TSS actions.

## Source Links

If you choose to click a source link, your browser opens the external website.
The RMP search link includes the displayed instructor name as its search query;
the UCSD A.S. link opens the grade archive landing page. The external website
then receives the normal request associated with your visit and operates under
its own privacy practices. TritonLens does not send course, section, enrollment,
student, authentication, or session information to either site.

## Access and Diagnostics

The manifest declares a content script limited to the TSS website. It declares
no additional API permissions or separate host permissions. This site access
is needed to read course entries and insert badges and detail cards.

A failed page scan may write a generic warning to the browser console. The
warning contains no page content, exception details, or session data and is
not transmitted anywhere.

## Control and Release Preparation

You can disable or remove TritonLens in Chrome's extension settings. There is
no extension-maintained persistent user data to delete.

Before public release, add a public support/contact channel, review this
document against the packaged implementation, and publish it at a stable URL.
