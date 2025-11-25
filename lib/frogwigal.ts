// Frog Wigal SMS and Email notification service
// Documentation: https://frogdocs.wigal.com.gh

interface FrogWigalSMSDestination {
  destination: string; // Phone number
  message: string;
  msgid: string; // Unique message ID
  smstype?: string; // Default: "text"
}

interface FrogWigalSMSPayload {
  senderid: string; // Sender ID
  destinations: FrogWigalSMSDestination[]; // Array of destinations (can be single or bulk)
}

interface FrogWigalEmailPayload {
  from?: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  [key: string]: any; // Allow additional fields
}

// Send SMS via Frog Wigal
export const sendSMS = async (
  phoneNumber: string,
  message: string,
  sandbox: boolean = false
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Use single API key for both SMS and Email
    // Try multiple possible variable names
    const apiKey = process.env.FROGWIGAL_API_KEY || process.env.FROG_API_KEY || process.env.FROGWIGAL_KEY;
    const username = process.env.FROGWIGAL_USERNAME || process.env.FROG_USERNAME || apiKey; // Fallback to API key if username not set
    const senderId = process.env.FROGWIGAL_SENDER_ID || "Cediman";

    // Debug logging
    console.log("Frog Wigal SMS Config Check:", {
      hasApiKey: !!apiKey,
      hasUsername: !!username,
      apiKeyLength: apiKey?.length || 0,
      usernameLength: username?.length || 0,
      envVars: {
        FROGWIGAL_API_KEY: !!process.env.FROGWIGAL_API_KEY,
        FROG_API_KEY: !!process.env.FROG_API_KEY,
        FROGWIGAL_KEY: !!process.env.FROGWIGAL_KEY,
        FROGWIGAL_USERNAME: !!process.env.FROGWIGAL_USERNAME,
        FROG_USERNAME: !!process.env.FROG_USERNAME,
      },
    });

    // If API key is not configured, skip sending (optional feature)
    if (!apiKey) {
      console.warn("Frog Wigal API key not configured, skipping SMS");
      console.warn("Checked env vars: FROGWIGAL_API_KEY, FROG_API_KEY, FROGWIGAL_KEY");
      return { success: true, message: "SMS skipped (API not configured)" };
    }

    // Format phone number (remove spaces, dashes, ensure 233 prefix)
    const formattedPhone = formatGhanaPhone(phoneNumber);

    // Generate unique message ID
    const msgId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Frog Wigal SMS API payload format (bulk format, but can send single message)
    const payload: FrogWigalSMSPayload = {
      senderid: senderId,
      destinations: [
        {
          destination: formattedPhone,
          message: message,
          msgid: msgId,
          smstype: "text",
        },
      ],
    };

    // Frog Wigal SMS API endpoint
    const apiUrl = process.env.FROGWIGAL_SMS_API_URL || "https://frogapi.wigal.com.gh/api/v3/sms/send";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "API-KEY": apiKey,
        "USERNAME": username || apiKey, // Ensure username is always a string
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: "SMS sent successfully" };
    } else {
      return { success: false, error: data.message || data.error || "Failed to send SMS" };
    }
  } catch (error: any) {
    console.error("Frog Wigal SMS error:", error);
    return { success: false, error: error.message };
  }
};

// Send Email via Frog Wigal
export const sendEmail = async (
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Use single API key for both SMS and Email
    // Try multiple possible variable names
    const apiKey = process.env.FROGWIGAL_API_KEY || process.env.FROG_API_KEY || process.env.FROGWIGAL_KEY;
    const username = process.env.FROGWIGAL_USERNAME || process.env.FROG_USERNAME || apiKey; // Fallback to API key if username not set
    const senderEmail = process.env.FROGWIGAL_SENDER_EMAIL || "noreply@cediman.com";

    // Debug logging
    console.log("Frog Wigal Email Config Check:", {
      hasApiKey: !!apiKey,
      hasUsername: !!username,
      apiKeyLength: apiKey?.length || 0,
      usernameLength: username?.length || 0,
      envVars: {
        FROGWIGAL_API_KEY: !!process.env.FROGWIGAL_API_KEY,
        FROG_API_KEY: !!process.env.FROG_API_KEY,
        FROGWIGAL_KEY: !!process.env.FROGWIGAL_KEY,
        FROGWIGAL_USERNAME: !!process.env.FROGWIGAL_USERNAME,
        FROG_USERNAME: !!process.env.FROG_USERNAME,
      },
    });

    // If API key is not configured, skip sending (optional feature)
    if (!apiKey) {
      console.warn("Frog Wigal API key not configured, skipping email");
      console.warn("Checked env vars: FROGWIGAL_API_KEY, FROG_API_KEY, FROGWIGAL_KEY");
      return { success: true, message: "Email skipped (API not configured)" };
    }

    // Frog Wigal Email API payload format
    const payload: FrogWigalEmailPayload = {
      from: senderEmail,
      to: to,
      subject: subject,
      html: htmlBody,
      text: textBody || stripHtml(htmlBody),
    };

    // Frog Wigal Email API endpoint
    const apiUrl = process.env.FROGWIGAL_EMAIL_API_URL || "https://frogapi.wigal.com.gh/api/v3/email/send";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "API-KEY": apiKey,
        "USERNAME": username || apiKey, // Ensure username is always a string
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: "Email sent successfully" };
    } else {
      return { success: false, error: data.message || data.error || "Failed to send email" };
    }
  } catch (error: any) {
    console.error("Frog Wigal Email error:", error);
    return { success: false, error: error.message };
  }
};

// Format Ghana phone number to Frog Wigal format (233XXXXXXXXX)
export const formatGhanaPhone = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading 0 if present
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Add 233 prefix if not present
  if (!cleaned.startsWith("233")) {
    cleaned = "233" + cleaned;
  }

  return cleaned;
};

// Strip HTML tags for plain text version
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};

// Order Confirmation SMS Template
export const getOrderConfirmationSMS = (orderId: string, trackingLink: string): string => {
  return `Thank you for your order! Order #${orderId} confirmed. Track your order: ${trackingLink}`;
};

// Order Status Update SMS Template
export const getOrderStatusSMS = (
  orderId: string,
  status: string,
  trackingLink: string
): string => {
  const statusMessages: Record<string, string> = {
    processing: "Your order is being processed",
    in_transit: "Your order is on the way",
    out_for_delivery: "Your order is out for delivery today",
    delivered: "Your order has been delivered. Thank you!",
  };

  const message = statusMessages[status] || "Order status updated";
  return `Order #${orderId}: ${message}. Track: ${trackingLink}`;
};

// Order Confirmation Email Template
export const getOrderConfirmationEmail = (
  customerName: string,
  orderId: string,
  orderTotal: number,
  trackingLink: string,
  items: any[]
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; }
    .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Hi ${customerName},</h2>
      <p>Thank you for your order! We've received your order and will process it shortly.</p>
      
      <div class="order-details">
        <h3>Order #${orderId}</h3>
        ${items.map((item) => `
          <div class="item">
            <strong>${item.name}</strong><br>
            Quantity: ${item.quantity} × ₵${item.price.toFixed(2)}
          </div>
        `).join("")}
        <div class="total">
          Total: ₵${orderTotal.toFixed(2)}
        </div>
      </div>
      
      <a href="${trackingLink}" class="button">Track Your Order</a>
      
      <p>You'll receive updates via email and SMS as your order progresses.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Order Status Update Email Template
export const getOrderStatusEmail = (
  customerName: string,
  orderId: string,
  status: string,
  trackingLink: string
): string => {
  const statusTitles: Record<string, string> = {
    processing: "Order is Being Processed",
    in_transit: "Order is On the Way",
    out_for_delivery: "Order Out for Delivery",
    delivered: "Order Delivered",
  };

  const statusMessages: Record<string, string> = {
    processing: "We're carefully preparing your items for shipment.",
    in_transit: "Your order is on its way to you!",
    out_for_delivery: "Your order is out for delivery and will arrive today.",
    delivered: "Your order has been successfully delivered. Thank you for shopping with us!",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; }
    .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusTitles[status] || "Order Update"}</h1>
    </div>
    <div class="content">
      <h2>Hi ${customerName},</h2>
      <div class="status-box">
        <h3>Order #${orderId}</h3>
        <p>${statusMessages[status] || "Your order status has been updated."}</p>
      </div>
      <a href="${trackingLink}" class="button">Track Your Order</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

