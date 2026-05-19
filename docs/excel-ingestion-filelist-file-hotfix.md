<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Hotfix: Excel Ingestion FileList To File Bug In Psych Scheduler

## What Changed
- `handleExcelDrop`: `event.dataTransfer.files` to `event.dataTransfer.files[0]`
- Browse-file input: `onchange="handleExcelFile(this.files)"` to `onchange="handleExcelFile(this.files[0])"`

## Why It Was Broken
`event.dataTransfer.files` and `input.files` both return a **FileList** (array-like). `FileList` has no `.name`, and `FileReader.readAsArrayBuffer` requires a `Blob`/`File`. The individual `File` is `files[0]`.

## Runtime Symptoms Before Fix
- Drop path: `TypeError: Cannot read properties of undefined (reading 'match')` - silent failure (no parse-result message)
- Browse path: caught by try/catch - surfaced as `"Excel parse error: ..."`

## Commits
- `58eda12` - introduced bug (feat commit)
- `601fcde` - hotfix - [view](https://github.com/TroyFowlerMD/non-clinical/commit/601fcde3e7678a7cda91cfb9b61e5086da6baf0d)

## Process Note
Spec was followed verbatim per user instructions, but the bug should have been flagged during Step 1 verification rather than shipped. Adding this to Preferences & Patterns mental model: **review provided code for runtime correctness before committing, even when spec is authoritative; surface concerns before write phase.**
