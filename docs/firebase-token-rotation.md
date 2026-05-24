# Firebase CI Token Rotation Runbook

## Overview

The `FIREBASE_TOKEN` GitHub secret is a long-lived CI token created with
`firebase login:ci`. It never expires on its own. If it were ever leaked,
anyone with the token could deploy Firestore and Storage rules to the
`marketplace305` project. **Rotate it every 6–12 months** (or immediately
if you suspect it has been exposed).

---

## Rotation Steps

### 1 — Generate a new token

On your local machine (not in CI), run:

```bash
npx firebase-tools login:ci
```

A browser window will open. Sign in with the Google account that owns the
Firebase project. Copy the token that is printed in the terminal — it looks
like:

```
1//0g...long-string...
```

### 2 — Update the GitHub secret

1. Open your GitHub repository in a browser.
2. Go to **Settings → Secrets and variables → Actions**.
3. Find **`FIREBASE_TOKEN`** and click **Update**.
4. Paste the new token and save.

### 3 — Revoke the old token (optional but recommended)

```bash
npx firebase-tools logout --token OLD_TOKEN_VALUE
```

This immediately invalidates the previous token so it cannot be reused.

### 4 — Verify the workflow still works

Trigger the **Deploy Firebase Rules** workflow manually:

1. Go to **Actions → Deploy Firebase Rules**.
2. Click **Run workflow → Run workflow**.
3. Confirm the job passes (green check).

### 5 — Record the rotation date

Update the table below so the next rotation deadline is visible:

| Rotation date | Rotated by | Next due date  |
|---------------|------------|----------------|
| _(initial)_   | —          | 2026-11-24     |

---

## Rotation Schedule

A GitHub Actions workflow (`.github/workflows/firebase-token-reminder.yml`)
opens a GitHub Issue automatically every 6 months to prompt rotation. You can
also add a personal calendar reminder for the same cadence.

---

## Optional: Migrate to Keyless Auth (Workload Identity Federation)

Long-lived tokens can be eliminated entirely by using **Google Workload
Identity Federation**. With WIF, GitHub Actions authenticates directly with
Google Cloud via a short-lived OIDC token — no stored secret needed.

High-level steps:

1. **Create a Google Cloud service account** with the
   `Firebase Rules Admin` or `Firebase Admin` role.
2. **Enable Workload Identity Federation** in the Google Cloud Console and
   create a pool + provider linked to your GitHub repo.
3. **Replace the deploy step** in `.github/workflows/deploy-rules.yml` with:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID'
    service_account: 'SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com'

- name: Deploy Firestore and Storage rules
  run: npx firebase-tools deploy --only firestore:rules,storage --project marketplace305
```

4. **Remove `FIREBASE_TOKEN`** from GitHub Secrets once the WIF workflow is
   confirmed working.

Full guide: https://firebase.google.com/docs/hosting/github-integration

---

## Emergency: Token Compromised

If you believe the token has been leaked:

1. **Immediately** run `npx firebase-tools logout --token LEAKED_TOKEN` to
   revoke it.
2. Follow steps 1–4 above to issue and configure a fresh token.
3. Review Firebase audit logs (Google Cloud Console → Firestore → Audit Logs)
   for any unauthorised rule deployments.
4. If rules were modified, restore them from git and redeploy.
