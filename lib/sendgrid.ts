/**
 * SendGrid Email Service
 * Uses Twilio SendGrid API for sending emails
 * Official package: @sendgrid/mail
 */

import sgMail from '@sendgrid/mail';

// Set API key from environment variable
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, "");
};

export const sendEmail = async (
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_SENDER_EMAIL || "noreply@cediman.com";
        const fromName = process.env.SENDGRID_FROM_NAME || process.env.SENDGRID_SENDER_NAME || "Cediman";

        if (!apiKey) {
            throw new Error("SendGrid API key not configured");
        }

        // Ensure API key is set (in case it wasn't set at module load)
        sgMail.setApiKey(apiKey);

        // Prepare email message with proper headers to reduce spam score
        const msg: any = {
            to: to,
            from: {
                email: fromEmail,
                name: fromName,
            },
            replyTo: fromEmail, // Add reply-to header
            subject: subject,
            html: htmlBody,
            text: textBody || stripHtml(htmlBody),
            // Add headers to improve deliverability
            headers: {
                'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            // Add categories for tracking (helps with reputation)
            categories: ['order-confirmation', 'transactional'],
        };

        console.log("Sending email via SendGrid:", {
            to: to ? `${to.substring(0, 3)}***@${to.split('@')[1] || '***'}` : 'N/A',
            subject,
        });

        // Send email using SendGrid SDK
        await sgMail.send(msg);

        console.log("SendGrid email sent successfully");
        return { success: true, message: "Email sent successfully" };
    } catch (error: any) {
        console.error("SendGrid Email error:", error.message || "Unknown error");

        // Handle SendGrid-specific error responses
        if (error.response) {
            const errorBody = error.response.body;
            const errorMessage = errorBody?.errors?.[0]?.message || errorBody?.message || "Failed to send email";
            return {
                success: false,
                error: errorMessage
            };
        }

        return {
            success: false,
            error: error.message || "Unknown error"
        };
    }
};

// Email template functions
export const getOrderConfirmationEmail = (
    customerName: string,
    orderId: string,
    orderTotal: number,
    trackingLink: string,
    items: any[],
    shippingCost: number = 0,
    orderDate?: string
): string => {
    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const safeName = escapeHtml(customerName);
    const safeOrderId = escapeHtml(orderId);
    const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Confirmation - ${safeOrderId}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f5f5f5;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header {
      background: #dc2626;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .content { 
      padding: 30px 20px; 
      background: #ffffff;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
      color: #111827;
    }
    .cost-summary {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .cost-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .cost-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
      padding-top: 16px;
      margin-top: 8px;
      border-top: 2px solid #e5e7eb;
    }
    .cost-label {
      color: #6b7280;
    }
    .cost-value {
      color: #111827;
      font-weight: 500;
    }
    .cost-row:last-child .cost-value {
      color: #dc2626;
      font-weight: 600;
    }
    .track-button { 
      display: block;
      background: #dc2626; 
      color: #ffffff !important; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 30px 0; 
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .order-info-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #dc2626;
      font-weight: 500;
    }
    .customer-service {
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      line-height: 1.6;
    }
    .footer { 
      text-align: center; 
      color: #6b7280; 
      font-size: 12px; 
      margin-top: 40px; 
      padding: 20px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      .cost-row {
        font-size: 14px;
      }
      .track-button {
        padding: 14px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN GHANA</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hi ${safeName},</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
      </div>
      
      <!-- Product Details -->
      ${items && items.length > 0 ? `
      <div class="order-info-card" style="margin-bottom: 20px;">
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #111827; font-size: 18px;">Order Items</h3>
        ${items.map((item: any) => `
          <div style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; display: flex; gap: 16px;">
            ${item.image ? `
            <div style="flex-shrink: 0;">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || 'Product')}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
            </div>
            ` : ''}
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; align-items: flex-start;">
                <strong style="color: #111827; font-size: 16px; line-height: 1.4;">${escapeHtml(item.name || 'Product')}</strong>
                <span style="color: #dc2626; font-weight: 600; font-size: 16px; margin-left: 12px; flex-shrink: 0;">₵${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
              <div style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                ${item.size ? `<span style="display: inline-block; margin-right: 8px;">Size: <strong>${escapeHtml(String(item.size))}</strong></span>` : ""}
                ${item.colorId ? `<span style="display: inline-block; margin-right: 8px;">Color: <strong>${escapeHtml(String(item.colorId))}</strong></span>` : ""}
                <span>Quantity: <strong>${item.quantity || 1}</strong> × ₵${(item.price || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
      ` : ''}
      
      <!-- Cost Summary Card -->
      <div class="cost-summary">
        <div class="cost-row">
          <span class="cost-label">Shipping:</span>
          <span class="cost-value">₵${shippingCost.toFixed(2)}</span>
        </div>
        <div class="cost-row">
          <span class="cost-label">Total:</span>
          <span class="cost-value">₵${orderTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <!-- Track Your Order Button -->
      <a href="${trackingLink}" class="track-button">Track Your Order</a>
      
      <!-- Order Details Card -->
      <div class="order-info-card">
        <div class="order-info-row">
          <span>Order Number:</span>
          <span>${safeOrderId}</span>
        </div>
        <div class="order-info-row">
          <span>Order Date:</span>
          <span>${formattedDate}</span>
        </div>
      </div>
      
      <!-- Customer Service Message -->
      <div class="customer-service">
        <p>If you have any questions about your order, please don't hesitate to contact our customer service.</p>
      </div>
    </div>
    <div class="footer">
      <p><strong>Cediman</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getOrderStatusEmail = (
    customerName: string,
    orderId: string,
    status: string,
    trackingLink: string,
    orderDate?: string,
    orderTotal?: number,
    items?: any[]
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

    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const safeName = escapeHtml(customerName);
    const safeOrderId = escapeHtml(orderId);
    const safeTitle = escapeHtml(statusTitles[status] || "Order Update");
    const safeMessage = escapeHtml(statusMessages[status] || "Your order status has been updated.");
    const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle} - ${safeOrderId}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f5f5f5;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: #dc2626; 
      color: #ffffff; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 600;
    }
    .header-brand {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
      font-weight: 400;
    }
    .content { 
      padding: 30px 20px; 
      background: #ffffff;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .status-box { 
      background: #f9fafb; 
      padding: 30px 20px; 
      margin: 20px 0; 
      border-radius: 8px; 
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .status-box h3 {
      margin-top: 0;
      color: #111827;
      font-size: 18px;
      margin-bottom: 12px;
    }
    .status-box p {
      color: #6b7280;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .order-details-info {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: left;
    }
    .order-details-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .order-details-row:last-child {
      border-bottom: none;
    }
    .order-details-label {
      color: #6b7280;
      font-size: 14px;
    }
    .order-details-value {
      color: #111827;
      font-weight: 500;
      font-size: 14px;
    }
    .items-summary {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .items-summary-title {
      color: #111827;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .items-summary-list {
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    }
    .button { 
      display: inline-block; 
      background: #dc2626; 
      color: #ffffff !important; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 20px 0; 
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background: #b91c1c;
    }
    .footer { 
      text-align: center; 
      color: #6b7280; 
      font-size: 12px; 
      margin-top: 30px; 
      padding: 20px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      .header {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>${safeTitle}</h1>
      <div class="header-brand">CEDIMAN GHANA</div>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hi ${safeName},</p>
      </div>
      <div class="status-box">
        <h3>Order #${safeOrderId}</h3>
        <p>${safeMessage}</p>
      </div>
      
      <!-- Order Details -->
      <div class="order-details-info">
        <div class="order-details-row">
          <span class="order-details-label">Order Number:</span>
          <span class="order-details-value">${safeOrderId}</span>
        </div>
        <div class="order-details-row">
          <span class="order-details-label">Order Date:</span>
          <span class="order-details-value">${formattedDate}</span>
        </div>
        ${orderTotal ? `
        <div class="order-details-row">
          <span class="order-details-label">Order Total:</span>
          <span class="order-details-value" style="color: #dc2626; font-weight: 600;">₵${orderTotal.toFixed(2)}</span>
        </div>
        ` : ''}
        ${items && items.length > 0 ? `
        <div class="items-summary">
          <div class="items-summary-title">Items in this order:</div>
          <div class="items-summary-list">
            ${items.map((item: any, index: number) => `
              ${index + 1}. ${escapeHtml(item.name || 'Product')} ${item.quantity ? `(Qty: ${item.quantity})` : ''}
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center;">
        <a href="${trackingLink}" class="button">Track Your Order</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>Cediman</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
      <p style="margin-top: 12px;">
        <a href="${trackingLink}" style="color: #dc2626; text-decoration: none;">View Order Details</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
