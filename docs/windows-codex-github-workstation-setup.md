# Windows Codex + GitHub Workstation Setup

Purpose: make another Windows computer mirror the working setup from this computer.

## Target Setup

- Local repos live outside OneDrive.
- GitHub is the source of truth.
- GitHub Desktop and Codex Desktop use the same local folders.
- Command-line Git is authenticated so Codex can commit and push when repo instructions call for it.

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
