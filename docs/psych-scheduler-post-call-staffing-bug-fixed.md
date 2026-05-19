<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Psych Scheduler Post-Call Staffing Bug Fixed

## What Changed
- Added `!isPostCall(...)` guards to the `workingCore` and `workingTemp` list construction in `psych-scheduler.html`.
- Daily Staffing Working Providers and downstream counts now exclude cells marked `Post Call`.
- Specific regression example addressed: Anderson on 2026-05-09 should no longer appear as working when the cell value is `Post Call`.

## Root Cause
- `isWorking()` returns true for post-call cells because `CLINICAL_KW` includes post-call terms.
- The Daily Staffing renderer consumes precomputed `r.workingCore` / `r.workingTemp`; it did not have a post-call exclusion guard itself.
- Current file did not contain `pcFlags`, so the fix uses the existing `isPostCall()` helper directly at working-list construction.

## Guardrails Preserved
- Did not touch `parseTSVRobust()` or `parseAndLoad()`.
- Did not alter `CLINICAL_KW`, `classify()`, or global classification behavior.
- Kept the patch surgical: one-file change, two filter guards.

## Commit / Deploy
- Commit: `1f81e58` - `Fix post-call exclusion in staffing counts`
- Branch: `main` pushed successfully.
- Live tool: [https://troyfowlermd.github.io/non-clinical/psych-scheduler.html](https://troyfowlermd.github.io/non-clinical/psych-scheduler.html)

## Lesson for Next Session
Post-call exclusion belongs at working-provider list construction (`workingCore` / `workingTemp`) or an equivalent availability helper, not as a global reclassification and not in parser/import code.
