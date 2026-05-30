---
name: SSH push workflow
description: How to push to GitHub from this Replit environment
---

## Key persistence
The SSH key is wiped on EVERY container restart. Always regenerate and re-add to GitHub deploy keys at the start of any push task. Generate with:
```
mkdir -p ~/.ssh && ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -q && cat ~/.ssh/id_ed25519.pub
```
Then add at https://github.com/carrionisaac85/marketplace/settings/keys with "Allow write access".

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
