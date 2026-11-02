# Explicit reviewed source-name bindings

Date: 2026-11-02. The user has authorized automatic evidence-backed name repairs and asked to proceed without repeated design questions. This is an implementation choice within that scope.

## Design

Extend only the existing development-import review manifest with optional `sourceDisplayName`. It declares the independently reviewed exact RMP source name when it differs from the TSS alias; existing rules default to their alias, preserving backward compatibility. The existing stable retained/source IDs, saved department/school, fresh observation and unique owned history marker remain mandatory. No nickname table, fuzzy matcher or relaxed runtime name normalization is added.

Both the requested alias and the declared source name must be unambiguous across raw source profiles and retained identities. A contradictory future observation must stop a previously promoted alias before source reconciliation or grade matching, retaining the old dataset. Rating values, alternate observations, grades, provenance and permissions are untouched.

## Alternatives considered

- Broaden runtime nickname/middle-name heuristics: rejected because it could join unrelated people.
- Hand-edit generated aliases outside the importer: rejected because refreshes would not consistently revalidate them.
- Explicit source-name bindings in the existing reviewed manifest: selected as the smallest change that preserves source and identity guards.

## Scope and exclusions

Review 23 preferred/full-name leads using UCSD primary evidence and the saved raw RMP roster. Skip held/contradictory profiles and existing name collisions. Michael Landry remains exactly unchanged and pending review by the user's explicit choice. No push, merge, release, UI change or new data collection.
