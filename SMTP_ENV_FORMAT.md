# SMTP Environment Variables (Gmail App Password Integration)

To use Gmail SMTP with App Passwords, add the following variables to your `.env.local` file:

```env
# SMTP Server Settings (Gmail Defaults)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# SMTP Credentials
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Sender settings
SMTP_FROM_EMAIL=your_gmail_address@gmail.com
SMTP_FROM_NAME=Cediman

# Email address to receive administrator notifications (new vendor signups, product listings)
ADMIN_NOTIFICATION_EMAIL=your_gmail_address@gmail.com
```

## How to Get Your Gmail App Password:

Gmail requires an **App Password** to send emails programmatically if you have 2-Step Verification enabled (which is required by Google for app passwords).

1. Go to your [Google Account settings](https://myaccount.google.com/).
2. On the left navigation panel, select **Security**.
3. Under the "How you sign in to Google" section, ensure **2-Step Verification** is turned on.
4. Click on **2-Step Verification** to open its settings.
5. Scroll all the way to the bottom of the page and click on **App passwords** (if you don't see it, search for "App passwords" in the search bar at the top of the page).
6. Enter a name for the app (e.g., `Cediman Store` or `Fanatics App`).
7. Click **Create**.
8. A modal will appear showing a 16-character app password (e.g., `abcd efgh ijkl mnop`).
9. Copy this password (it will not be shown again).
10. Paste it as `SMTP_PASSWORD` in your `.env.local` file. **Make sure to remove any spaces** when entering it (e.g., `abcdefghijklmnop`).

## Troubleshooting Deliverability:

1. **Connection Issues**: By default, we use port `465` (SSL/TLS) with `SMTP_SECURE=true`. If your hosting environment or local network blocks port `465`, you can try port `587` with `SMTP_SECURE=false`.
2. **2-Step Verification Requirement**: Google only allows you to create App Passwords if 2-Step Verification is enabled on your account.
3. **Testing your settings**: You can test the configuration using the test script:
   ```bash
   npx ts-node scripts/test-email.ts your-personal-email@gmail.com
   ```
