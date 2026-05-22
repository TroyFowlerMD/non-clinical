# Windows Codex + GitHub Workstation Setup

Purpose: make another Windows computer mirror the working setup from this computer.

## Target Setup

- Local repos live outside OneDrive.
- GitHub is the source of truth.
- GitHub Desktop and Codex Desktop use the same local folders.
- Command-line Git is authenticated so Codex can commit and push when repo instructions call for it.
- Node.js LTS, Google clasp, and Google Apps Script login are configured so Codex can edit/deploy the Psych Scheduler Apps Script bridge.
- The Psych Scheduler feedback admin token is stored locally, outside Git, so Codex can mark IT request rows done/triaged from that workstation.

Use this folder:

```text
C:\Users\<you>\Documents\Codex\Projects
```

Do not use OneDrive folders for active coding repos.

## First-Time Setup Steps

1. Install and sign into GitHub Desktop.
2. Install and sign into Codex Desktop.
3. In GitHub Desktop, set the default clone directory to:

```text
C:\Users\<you>\Documents\Codex\Projects
```

4. Clone `TroyFowlerMD/non-clinical` into:

```text
C:\Users\<you>\Documents\Codex\Projects\non-clinical
```

5. Open PowerShell and run:

```powershell
cd "$HOME\Documents\Codex\Projects\non-clinical"
powershell -ExecutionPolicy Bypass -File .\scripts\setup-codex-projects.ps1
```

The script will:

- configure Git Credential Manager
- prompt for GitHub device login if needed
- create `Documents\Codex\Projects`
- clone missing active repos
- pull clean existing repos with `git pull --ff-only`
- skip any repo that has local changes so work is not overwritten
- offer to set up Psych Scheduler Apps Script access, including Node.js LTS, Google clasp, `clasp login`, and the local feedback admin token

## Psych Scheduler Apps Script Access

This is the part that gives Codex on the other computer the same Apps Script editing/deploy ability and the ability to mark scheduler feedback rows done.

The setup script may ask you to:

1. Approve a Node.js LTS install through Windows.
2. Sign into Google through `clasp login` using `troyfowlermd@gmail.com`.
3. Enable the Apps Script API at:

```text
https://script.google.com/home/usersettings
```

4. Paste or import the Psych Scheduler feedback admin token.

The token is not stored in Git. It should live only at:

```text
C:\Users\<you>\Documents\Codex\Projects\non-clinical\.codex-local\psych-scheduler-feedback-admin-token.txt
```

Simplest token transfer path:

1. On the already-configured computer, copy this file:

```text
C:\Users\troyf\Documents\Codex\Projects\non-clinical\.codex-local\psych-scheduler-feedback-admin-token.txt
```

2. On the other computer, paste that token when `setup-psych-scheduler-appscript-access.ps1` prompts for it, or save it to the same `.codex-local` path.

Separate-token path:

On the already-configured computer, run:

```powershell
cd "$HOME\Documents\Codex\Projects\non-clinical"
powershell -ExecutionPolicy Bypass -File .\scripts\provision-psych-scheduler-feedback-token.ps1 -Label "other-computer"
```

Copy the generated output file to the other computer as:

```text
.codex-local\psych-scheduler-feedback-admin-token.txt
```

Do not paste the token into GitHub, docs, commits, screenshots, or chat unless you intentionally want to share status-update access.

To rerun only the Apps Script/access setup later:

```powershell
cd "$HOME\Documents\Codex\Projects\non-clinical"
powershell -ExecutionPolicy Bypass -File .\scripts\setup-psych-scheduler-appscript-access.ps1
```

To verify only, without installing or logging in:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-psych-scheduler-appscript-access.ps1 -VerifyOnly
```

## Active Repos The Script Manages

- `TroyFowlerMD/non-clinical`
- `TroyFowlerMD/my-dashboard`
- `TroyFowlerMD/troyfowlermd.github.io`
- `TroyFowlerMD/IVC-Suite`
- `TroyFowlerMD/journal-club-hub`
- `TroyFowlerMD/psychometrics-hub`
- `TroyFowlerMD/sud-education-hub`
- `TroyFowlerMD/sud-patient-education`
- `cocm-camasca/cocm-pediatrico-honduras`

Archived repos and `perplexity-config` are intentionally not included.

## GitHub Desktop After The Script

If GitHub Desktop does not show a repo automatically:

1. Choose **File > Add local repository**.
2. Select the matching folder under:

```text
C:\Users\<you>\Documents\Codex\Projects
```

Adding an existing local repository does not duplicate the repo. It points GitHub Desktop at the existing `.git` metadata.

## Codex Desktop After The Script

Start Codex chats from the local repo folder under `Documents\Codex\Projects`.

Useful commands:

```text
#start repo-name
#done repo-name
```

`#start` means: check repo status, pull latest GitHub changes if safe, read repo instructions, and report current state.

`#done` means: run the repo shutdown routine, update logs/docs when relevant, run checks, commit, and push when safe.

## Verification

Run this from PowerShell:

```powershell
cd "$HOME\Documents\Codex\Projects"
Get-ChildItem -Directory | ForEach-Object {
  Push-Location $_.FullName
  if (Test-Path .git) {
    git status --short --branch
  }
  Pop-Location
}
```

Healthy output should show each repo tracking `origin` without `ahead`, `behind`, modified, or untracked files unless you intentionally have local work.

## What troyfowlermd.github.io Is

`TroyFowlerMD/troyfowlermd.github.io` is the special GitHub Pages root repo for:

```text
https://troyfowlermd.github.io/
```

It is not the active dashboard. The active TroyMD dashboard is:

```text
TroyFowlerMD/my-dashboard
```
