# SendGrid Environment Variables

Add these to your `.env.local` file:

```env
# SendGrid API Key (Required)
# Get this from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.your_api_key_here

# SendGrid From Email (Optional - defaults to noreply@cediman.com)
# Must be a verified sender in SendGrid
SENDGRID_FROM_EMAIL=noreply@cediman.com
# OR use SENDGRID_SENDER_EMAIL (both work)

# SendGrid From Name (Optional - defaults to "Cediman")
SENDGRID_FROM_NAME=Cediman
# OR use SENDGRID_SENDER_NAME (both work)
```

## How to Get Your SendGrid API Key:

1. Go to https://app.sendgrid.com/
2. Sign in or create an account
3. Navigate to **Settings** → **API Keys**
4. Click **Create API Key**
5. Give it a name (e.g., "Cediman Production")
6. Select **Full Access** or **Restricted Access** (with Mail Send permissions)
7. Copy the API key (you'll only see it once!)
8. Paste it into your `.env.local` file

## Important Notes:

- The API key must start with `SG.`
- Never commit your API key to git (it should be in `.env.local` which is in `.gitignore`)
- Make sure your sender email is verified in SendGrid
- For production, set these in your hosting platform's environment variables (Vercel, etc.)

