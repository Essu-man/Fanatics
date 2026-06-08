# SMTP Environment Variables (Yahoo App Password Integration)

To use Yahoo App Password with SMTP, add the following variables to your `.env.local` file:

```env
# SMTP Server Settings (Yahoo Defaults)
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=465
SMTP_SECURE=true

# SMTP Credentials
SMTP_USER=your_yahoo_email@yahoo.com
SMTP_PASSWORD=your_yahoo_app_password

# Sender settings
SMTP_FROM_EMAIL=your_yahoo_email@yahoo.com
SMTP_FROM_NAME=Cediman
```

## How to Get Your Yahoo App Password:

1. Go to [Yahoo Account Security Page](https://login.yahoo.com/account/security) and log in.
2. Scroll down and look for **Generate App Password** or **Manage app passwords**.
3. Select **Other App** from the dropdown menu and enter a name like `Cediman Store`.
4. Click **Generate**.
5. Yahoo will generate a 16-character password (e.g., `abcd efgh ijkl mnop`).
6. Copy this password.
7. Paste it as `SMTP_PASSWORD` in your `.env.local` file. You can enter it with or without spaces, but it is recommended to enter it as a single block without spaces (`abcdefghijklmnop`).

## Troubleshooting Deliverability:

1. **Sender Address Rejection**: Yahoo SMTP requires the sender email (`SMTP_FROM_EMAIL`) to match the authenticated email (`SMTP_USER`) or be an approved Yahoo account alias. If you specify a different email, Yahoo SMTP will reject the message with a `550 Sender address rejected` error.
2. **Connection Issues**: We use port `465` (SSL/TLS) by default. If your network blocks port `465`, you can try port `587` with `SMTP_SECURE=false`.
