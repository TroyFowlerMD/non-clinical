# Psych Scheduler project instructions

This repository contains my Psych Scheduler website.

## Project overview

- GitHub repo: TroyFowlerMD/non-clinical
- Live GitHub Pages site: https://troyfowlermd.github.io/non-clinical/psych-scheduler.html
- Main source file: psych-scheduler.html
- Branch: main
- This is a single-file static web app.
- HTML, CSS, and JavaScript are all inside psych-scheduler.html.
- There is no normal backend server for the webpage itself.

## Important communication instructions

The owner of this repo is not a programmer.

Always assume the user knows absolutely nothing about:

- coding
- GitHub
- Git
- branches
- commits
- pull requests
- terminals
- file paths
- Codex workspaces
- deployment
- ChatGPT or Codex navigation

When explaining anything to the user:

- Give very step-by-step instructions.
- Explain what each step means.
- Recommend the simplest option first.
- Avoid vague phrases like “copy it from the workspace.”
- If mentioning a path like `/workspace/non-clinical/psych-scheduler.html`, clearly explain that it is inside Codex’s temporary environment and is not a website URL the user can open in a normal browser.
- If GitHub website instructions are needed, explain exactly what to click.

## Coding instructions

Before editing, inspect psych-scheduler.html.

Do not change unrelated behavior.

Preserve the existing single-file structure unless the user specifically asks to split the app into multiple files.

Use existing CSS variables for styling whenever possible.

Avoid hardcoded colors when a theme variable already exists.

The app has light and dark themes, so new UI should work in both.

If changing visible UI, try to keep it mobile-friendly.

## Important app details

Provider names are last-name-only strings, such as:

- Fowler
- Carter
- Ondreyka
- Anderson
- Smith
- Cooley
- Patil
- German

Do not rename provider strings unless the user specifically asks.

The My Schedule dashboard rendering is in or near:

- renderDashboard()
- schedCell()
- the dashboard column rendering logic

## Git and deployment instructions

If code changes are made:

1. Commit the changes.
2. Create a pull request if the environment supports it.
3. If pushing/deploying to GitHub Pages is not possible because of permissions or network restrictions, say so clearly.
4. Then give the user beginner-friendly manual GitHub website instructions.

Do not imply that the live GitHub Pages website has been updated unless the change was actually pushed or merged into the GitHub repo.
