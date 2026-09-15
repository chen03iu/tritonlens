# TritonLens Privacy

Last updated: 2026-09-15

This document describes the current local development version of TritonLens.
It must be reviewed again before public distribution or changes to data use.

## Local Processing

TritonLens runs on `https://tss.ucsd.edu/*`. It reads displayed course,
instructor, term, section, schedule, location, and enrollment-count information
to associate its badges with the correct course entries. These values are
processed in browser memory and are not saved by the extension.

Professor ratings and historical course grades are looked up in a bundled
static dataset. They are not the user's personal grades.

## Information Not Collected

TritonLens does not collect, save, or transmit student names, student IDs,
passwords, authentication cookies, session tokens, personal grades, enrollment
history, financial information, or degree-audit information. It has no
analytics, advertising, accounts, backend, or cloud synchronization.

The extension does not use browser storage or make automatic network
requests. It does not automate enrollment or other TSS actions.

## Source Links

If you choose to click a source or professor-profile link, your browser opens
the external website. That website receives the normal request associated
with your visit and operates under its own privacy practices. TritonLens does
not send extracted TSS context to it.

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
