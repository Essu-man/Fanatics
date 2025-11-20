// Arkesel SMS and Email notification service
// Documentation: https://developers.arkesel.com

interface ArkeselSMSPayload {
    sender: string;
    message: string;
    recipients: string[]; // Phone numbers in format: 233XXXXXXXXX
    sandbox?: boolean;
}

interface ArkeselEmailPayload {
    sender: string;
    recipient: string;
    subject: string;
    body_text?: string;
    body_html?: string;
}

// Send SMS via Arkesel
export const sendSMS = async (
    phoneNumber: string,
    message: string,
    sandbox: boolean = false
): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const apiKey = process.env.ARKESEL_API_KEY;
        const senderId = process.env.ARKESEL_SENDER_ID || "Cediman";

        if (!apiKey) {
            throw new Error("Arkesel API key not configured");
        }

        // Format phone number (remove spaces, dashes, ensure 233 prefix)
        const formattedPhone = formatGhanaPhone(phoneNumber);

        const payload: ArkeselSMSPayload = {
            sender: senderId,
            message: message,
            recipients: [formattedPhone],
            sandbox: sandbox,
        };

        const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.code === "ok") {
            return { success: true, message: "SMS sent successfully" };
        } else {
            return { success: false, error: data.message || "Failed to send SMS" };
        }
    } catch (error: any) {
        console.error("Arkesel SMS error:", error);
        return { success: false, error: error.message };
    }
};

// Send Email via Arkesel
export const sendEmail = async (
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const apiKey = process.env.ARKESEL_API_KEY;
        const senderEmail = process.env.ARKESEL_SENDER_ID || "noreply@cediman.com";

        if (!apiKey) {
            throw new Error("Arkesel API key not configured");
        }

        const payload: ArkeselEmailPayload = {
            sender: senderEmail,
            recipient: to,
            subject: subject,
            body_html: htmlBody,
            body_text: textBody || stripHtml(htmlBody),
        };

        const response = await fetch("https://sms.arkesel.com/api/v2/email/send", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.code === "ok") {
            return { success: true, message: "Email sent successfully" };
        } else {
            return { success: false, error: data.message || "Failed to send email" };
        }
    } catch (error: any) {
        console.error("Arkesel Email error:", error);
        return { success: false, error: error.message };
    }
};

// Format Ghana phone number to Arkesel format (233XXXXXXXXX)
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
