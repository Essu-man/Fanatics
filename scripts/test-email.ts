import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { sendEmail } from '../lib/email';

const run = async () => {
  const recipient = process.argv[2];
  if (!recipient) {
    console.error("Error: Please provide a recipient email address.\nUsage: npx ts-node scripts/test-email.ts <recipient-email>");
    process.exit(1);
  }

  console.log(`Attempting to send test email to ${recipient}...`);
  const result = await sendEmail(
    recipient,
    "Cediman SMTP Test Email",
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #dc2626;">SMTP Test Successful!</h2>
      <p>This email confirms that your Gmail SMTP configuration with App Password is working correctly.</p>
      <p><strong>Config Details:</strong></p>
      <ul>
        <li>Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
        <li>Port: ${process.env.SMTP_PORT || '465'}</li>
        <li>User: ${process.env.SMTP_USER}</li>
      </ul>
      <p>Sent at: ${new Date().toString()}</p>
    </div>
    `
  );

  if (result.success) {
    console.log("\nSUCCESS! Test email sent successfully.");
  } else {
    console.error("\nFAILED to send test email:", result.error);
  }
};

run().catch(console.error);
