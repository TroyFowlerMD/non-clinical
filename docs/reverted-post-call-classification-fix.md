<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# 2026-05-11 - Reverted Post-Call Classification Fix

## Context
- Repo: [TroyFowlerMD/non-clinical](https://github.com/TroyFowlerMD/non-clinical)
- File: `psych-scheduler.html`
- Deployed: [troyfowlermd.github.io/non-clinical/psych-scheduler.html](http://troyfowlermd.github.io/non-clinical/psych-scheduler.html)

## What Broke
Commit `33bd501` (2026-05-11 07:48 EDT) attempted to reclassify post-call status as Off/Unavailable rather than Clinical. Result was a broken page reported by Troy at session start.

## Action Taken
- `git revert 33bd501 --no-edit` -> new commit `288b1ea`
- Pushed to `main`. GitHub Pages will redeploy automatically.
- No force-push; history preserved.

## Next
See Asana Build & Dev task: re-diagnose post-call classification logic before re-attempting.
