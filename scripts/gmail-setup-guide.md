
# Gmail Setup Guide (IMAP + App Password)

This testing framework uses IMAP to read Gmail messages for:
- registration confirmation emails
- failed deposit emails

## 1. Enable 2FA on your Gmail account
Go to:
Google Account → Security → 2-Step Verification → Enable

## 2. Create an App Password
Google Account → Security → App Passwords

Select:
- App: Mail
- Device: Other → type “PlaywrightAutomation”

Copy the 16‑character app password.

## 3. Add to GitHub Secrets
In your repo, go to:
Settings → Secrets → Actions → New Secret

Add:
- GMAIL_USERNAME = youremail@gmail.com
- GMAIL_APP_PASSWORD = the 16-character app password

## 4. You're done!

The test suite now uses `findEmail()` in:
tests/helpers/gmail-reader.ts

No OAuth or Google Cloud setup required.
