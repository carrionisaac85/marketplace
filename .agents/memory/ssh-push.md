---
name: SSH push workflow
description: How to push to GitHub from this Replit environment
---

## Current pub key
`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGiKgLKUFSgdDms8RPZbwTMtdu5/685GNjPX4Un8b0Fg runner@repl`

## Key persistence
The key at `~/.ssh/id_ed25519` persists across sessions as long as the container is not fully reset. If missing, regenerate with:
```
mkdir -p ~/.ssh && ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -q -f overwrite_existing
```
Or: `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -y` (skip if file exists with `-n` flag).

## GitHub repo
`git@github.com:carrionisaac85/marketplace.git` (remote: `origin`)

## Deploy key location
Add the pub key at: `https://github.com/carrionisaac85/marketplace/settings/keys`
Check "Allow write access".

## Push workflow after code changes
1. `npm run build` — verify build passes
2. `npx cap sync ios` — sync web assets to iOS native project
3. `git add -A && git commit -m "..."` + `git push origin main`
4. This triggers Codemagic to build the iOS .ipa

**Why:** The SSH key is the auth mechanism for git push. GitHub deploy keys are repo-specific.
