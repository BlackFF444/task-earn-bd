# GitHub Actions — Auto APK Build

Both apps build APKs automatically on push (or manual **Actions → Run workflow**).

## 1. Add the 2 workflow files to GitHub
The workflow files are on your PC at:
- `.github/workflows/build-user.yml`
- `.github/workflows/build-admin.yml`

They were NOT pushed (token scope limit). Add them manually:
1. GitHub repo → **Add file → Create new file**
2. Name: `.github/workflows/build-user.yml` → paste file contents → Commit
3. Repeat for `build-admin.yml`
4. After commit, both APK builds start automatically.

## 2. Add Secrets (repo → Settings → Secrets and variables → Actions → New repository secret)
These inject Firebase + Google config at build time (via `write-config.js`):

| Secret Name | Value (from Firebase/Google console) |
|---|---|
| `FIREBASE_API_KEY` | Firebase web apiKey |
| `FIREBASE_AUTH_DOMAIN` | project.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | project id |
| `FIREBASE_STORAGE_BUCKET` | project.appspot.com |
| `FIREBASE_MESSAGING_SENDER_ID` | sender id |
| `FIREBASE_APP_ID` | app id |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |

**Where to get them:**
- Firebase: Console → Project Settings → Your apps → Web app config
- Google Client ID: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Web Client

If you skip secrets, the APKs still build and run in **localStorage mode** (single device).

## 3. Download APKs
After build finishes (Actions tab → green check → Artifacts):
- `task-earn-bd-user-apk` → `app-debug.apk`
- `task-earn-bd-admin-apk` → `app-debug.apk`

Install on phones. Admin password: `FAHIM2020`.
