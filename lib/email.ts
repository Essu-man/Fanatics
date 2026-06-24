import nodemailer from 'nodemailer';

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP credentials (SMTP_USER and SMTP_PASSWORD) are not configured");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || "Cediman";

    if (!fromEmail) {
      throw new Error("SMTP_FROM_EMAIL or SMTP_USER is required to send emails");
    }

    const client = getTransporter();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: textBody || stripHtml(htmlBody),
      html: htmlBody,
    };

    console.log("Sending email via SMTP:", {
      to: to ? `${to.substring(0, 3)}***@${to.split('@')[1] || '***'}` : 'N/A',
      subject,
    });

    await client.sendMail(mailOptions);

    console.log("SMTP email sent successfully");
    return { success: true, message: "Email sent successfully" };
  } catch (error: any) {
    console.error("SMTP Email error:", error.message || "Unknown error");
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
};

// Email template functions

export const getOtpVerificationEmail = (
  firstName: string,
  otp: string
): string => {
  const digits = otp.split("");
  const digitBoxes = digits
    .map(
      (d) =>
        `<span style="display:inline-block;width:44px;height:54px;line-height:54px;text-align:center;font-size:28px;font-weight:700;background:#f4f4f5;border:2px solid #e4e4e7;border-radius:10px;margin:0 4px;color:#18181b;letter-spacing:0;">${d}</span>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cediman Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#c41e3a 0%,#a01630 100%);padding:32px 24px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);">CEDIMAN CO.</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Email Verification</h1>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;">
      <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi ${firstName},</p>
      <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
        Use the code below to verify your email address. It expires in <strong style="color:#18181b;">15 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div style="background:#fafafa;border:1.5px solid #e4e4e7;border-radius:12px;padding:28px 16px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Your verification code</p>
        <div style="display:flex;justify-content:center;gap:6px;">
          ${digitBoxes}
        </div>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
        ⏱ This code expires in <strong>15 minutes</strong>
      </p>
      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Didn't request this? You can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        © ${new Date().getFullYear()} Cediman. All rights reserved.<br>
        <a href="https://www.cediman.com" style="color:#c41e3a;text-decoration:none;">www.cediman.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

export const getOrderConfirmationEmail = (
  customerName: string,

  orderId: string,
  orderTotal: number,
  trackingLink: string,
  items: any[],
  shippingCost: number = 0,
  orderDate?: string,
  subtotal?: number
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
  const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate breakdown
  const CUSTOMIZATION_FEE = 35;
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const customizationDetails = items.reduce((acc, item) => {
    if (item.customization && (item.customization.playerName || item.customization.playerNumber)) {
      return {
        count: acc.count + item.quantity,
        total: acc.total + (CUSTOMIZATION_FEE * item.quantity)
      };
    }
    return acc;
  }, { count: 0, total: 0 });

  const calculatedSubtotal = subtotal !== undefined ? subtotal : (itemsSubtotal + customizationDetails.total);

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
          <span class="cost-label">Items Subtotal:</span>
          <span class="cost-value">₵${itemsSubtotal.toFixed(2)}</span>
        </div>
        ${customizationDetails.count > 0 ? `
        <div class="cost-row">
          <span class="cost-label">Customization (${customizationDetails.count} ${customizationDetails.count === 1 ? 'jersey' : 'jerseys'}):</span>
          <span class="cost-value">₵${customizationDetails.total.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="cost-row">
          <span class="cost-label">Shipping:</span>
          <span class="cost-value">${shippingCost > 0 ? `₵${shippingCost.toFixed(2)}` : 'FREE'}</span>
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
  const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-GB', {
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

export const getVendorApplicationReceivedEmail = (
  contactName: string,
  businessName: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - ${businessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #dc2626; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-title { font-weight: 700; color: #111827; margin-bottom: 10px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>Thank you for submitting your seller application to Cediman!</p>
      </div>
      <div class="info-box">
        <div class="info-title">Application Status: Under Review</div>
        <p style="margin: 0; color: #4b5563;">We have successfully received your application for <strong>${businessName}</strong>. Our administration team is reviewing your registration details, payout information, and documents.</p>
      </div>
      <p>This process typically takes 2 to 3 business days. Once your application is processed, you will receive an email letting you know if you've been approved.</p>
      <p>If you have any questions in the meantime, please reply to this email or contact support at support@cediman.com.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getVendorApplicationApprovedEmail = (
  contactName: string,
  businessName: string
): string => {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/vendor`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Approved - Welcome to Cediman!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .success-title { font-weight: 700; color: #15803d; margin-bottom: 10px; }
    .button { display: block; background: #10b981; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>Congratulations! We are thrilled to welcome you to the Cediman Co. Marketplace.</p>
      </div>
      <div class="success-box">
        <div class="success-title">Application Approved!</div>
        <p style="margin: 0; color: #166534;">Your seller application for <strong>${businessName}</strong> has been officially approved. Your seller status is now active.</p>
      </div>
      <p>You can now sign in to your vendor dashboard, start posting your products, and manage your inventory and sales.</p>
      <a href="${loginUrl}" class="button">Go to Seller Dashboard</a>
      <p>If you have any questions or need help setting up your store, please contact our seller support team at support@cediman.com.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getVendorApplicationRejectedEmail = (
  contactName: string,
  businessName: string,
  reason: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update - ${businessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #ef4444; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .reject-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .reject-title { font-weight: 700; color: #991b1b; margin-bottom: 10px; }
    .reason-text { font-style: italic; color: #374151; background: #ffffff; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>Thank you for your interest in selling on Cediman Co. Marketplace.</p>
      </div>
      <div class="reject-box">
        <div class="reject-title">Application Status: Not Approved</div>
        <p style="margin: 0; color: #7f1d1d;">After reviewing your application for <strong>${businessName}</strong>, we regret to inform you that we cannot approve it at this time.</p>
        <div class="reason-text">
          <strong>Reason for decision:</strong><br/>
          ${reason}
        </div>
      </div>
      <p>If you believe there has been a misunderstanding or if you can resolve the issue listed above, you are welcome to contact our administration team at support@cediman.com to discuss your application.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getVendorWelcomeEmail = (
  contactName: string,
  businessName: string
): string => {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/vendor`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cediman Co. Seller Portal!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .welcome-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .welcome-title { font-weight: 700; color: #15803d; margin-bottom: 10px; }
    .button { display: block; background: #10b981; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>Your seller registration for <strong>${businessName}</strong> is complete and active!</p>
      </div>
      <div class="welcome-box">
        <div class="welcome-title">Your Seller Portal is Ready!</div>
        <p style="margin: 0; color: #166534;">Your login account is now officially linked to your store. You can manage your store inventory, upload new products, track sales, and check your payout history directly in your Seller Dashboard.</p>
      </div>
      <p>Click below to sign in and access your store:</p>
      <a href="${loginUrl}" class="button">Go to Seller Dashboard</a>
      <p>If you have any questions or need support as you manage your store, please email us at support@cediman.com.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getProductWithheldEmail = (
  contactName: string,
  businessName: string,
  productName: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Pending Review - ${productName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #dc2626; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-title { font-weight: 700; color: #111827; margin-bottom: 10px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>This email is to confirm that your new product has been successfully posted to your shop on Cediman.</p>
      </div>
      <div class="info-box">
        <div class="info-title">Product Pending Review: Withheld From Public Store</div>
        <p style="margin: 0; color: #4b5563;">Your product <strong>"${productName}"</strong> has been created. In accordance with marketplace rules, new listings are temporarily withheld and kept pending review by the admin team before they are published to the public catalog.</p>
      </div>
      <p>The admin team will verify the listing details soon. Once approved, the product will automatically go live on the storefront.</p>
      <p>Thank you for selling on Cediman Co.!</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getProductApprovedEmail = (
  contactName: string,
  productName: string
): string => {
  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/shop`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Approved - Live on Storefront!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .success-title { font-weight: 700; color: #15803d; margin-bottom: 10px; }
    .button { display: block; background: #10b981; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>We are pleased to inform you that your product listing has been approved and is now live on the Cediman marketplace!</p>
      </div>
      <div class="success-box">
        <div class="success-title">Product Approved & Live!</div>
        <p style="margin: 0; color: #166534;">Your product <strong>"${productName}"</strong> passed review and is visible to customers on the storefront.</p>
      </div>
      <a href="${shopUrl}" class="button">View Marketplace Shop</a>
      <p>Thank you for partnering with us!</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getProductRejectedEmail = (
  contactName: string,
  productName: string,
  reason?: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Update - Not Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #ef4444; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .reject-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .reject-title { font-weight: 700; color: #991b1b; margin-bottom: 10px; }
    .reason-text { font-style: italic; color: #374151; background: #ffffff; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN CO.</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${contactName},</p>
        <p>Thank you for submitting your product listing to the Cediman marketplace.</p>
      </div>
      <div class="reject-box">
        <div class="reject-title">Product Listing: Not Approved</div>
        <p style="margin: 0; color: #7f1d1d;">After reviewing your product <strong>"${productName}"</strong>, we regret to inform you that we cannot approve it for the storefront at this time.</p>
        ${reason ? `
        <div class="reason-text">
          <strong>Reason for decision:</strong><br/>
          ${reason}
        </div>
        ` : ''}
      </div>
      <p>If you have any questions or would like to resolve the concerns and update the listing details, please reach out to our team at support@cediman.com.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getAdminNewApplicationEmail = (
  adminName: string,
  businessName: string,
  contactName: string,
  contactEmail: string
): string => {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/admin/vendors`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Seller Application Pending Review</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #dc2626; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-title { font-weight: 700; color: #111827; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 500; }
    .button { display: block; background: #dc2626; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN ADMIN</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hello ${adminName},</p>
        <p>A new seller application has been submitted and is currently pending review.</p>
      </div>
      <div class="details-box">
        <div class="details-title">Application Details</div>
        <div class="detail-row">
          <span class="detail-label">Business Name:</span>
          <span class="detail-value">${businessName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact Person:</span>
          <span class="detail-value">${contactName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email Address:</span>
          <span class="detail-value">${contactEmail}</span>
        </div>
      </div>
      <a href="${adminUrl}" class="button">Review Applications</a>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Admin Panel</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getAdminNewProductEmail = (
  adminName: string,
  businessName: string,
  productName: string
): string => {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/admin/products`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Product Submission Awaiting Approval</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #dc2626; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-title { font-weight: 700; color: #111827; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 500; }
    .button { display: block; background: #dc2626; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN ADMIN</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hello ${adminName},</p>
        <p>A seller has posted a new product listing that is currently withheld pending your review.</p>
      </div>
      <div class="details-box">
        <div class="details-title">Listing Details</div>
        <div class="detail-row">
          <span class="detail-label">Product Name:</span>
          <span class="detail-value">${productName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Seller Shop:</span>
          <span class="detail-value">${businessName}</span>
        </div>
      </div>
      <a href="${adminUrl}" class="button">Review Listings</a>
    </div>
    <div class="footer">
      <p><strong>Cediman Co. Admin Panel</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getAdminPayoutRequestEmail = (
  vendorBusinessName: string,
  amount: number,
  payoutMethod: string,
  payoutDetails: string
): string => {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/admin/payouts`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Payout Request - ${vendorBusinessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #1f2937; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-title { font-weight: 700; color: #111827; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 700; }
    .button { display: block; background: #1f2937; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 30px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN ADMIN</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hello Admin,</p>
        <p>A vendor has requested a withdrawal from their cleared Available Balance.</p>
      </div>
      <div class="details-box">
        <div class="details-title">Withdrawal Request Details</div>
        <div class="detail-row">
          <span class="detail-label">Vendor Store:</span>
          <span class="detail-value">${vendorBusinessName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Requested Amount:</span>
          <span class="detail-value" style="color: #10b981;">GH₵ ${amount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${payoutMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Account details:</span>
          <span class="detail-value" style="font-family: monospace; font-size: 12px;">${payoutDetails}</span>
        </div>
      </div>
      <a href="${adminUrl}" class="button">Go to Payouts Manager</a>
    </div>
    <div class="footer">
      <p><strong>Cediman Marketplace</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getVendorPayoutApprovedEmail = (
  vendorContactName: string,
  amount: number,
  payoutMethod: string,
  payoutAccount: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payout Request Approved - Cediman</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .success-title { font-weight: 700; color: #15803d; margin-bottom: 10px; font-size: 18px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 700; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN MARKETPLACE</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${vendorContactName},</p>
        <p>We are pleased to inform you that your withdrawal request has been approved and successfully processed.</p>
      </div>
      <div class="success-box">
        <div class="success-title">Withdrawal Disbursed</div>
        <p style="margin: 0 0 15px 0; color: #166534; font-size: 14px;">The payout has been dispatched to your designated payment account. Please allow standard bank/MoMo clearance intervals for funds to reflect.</p>
        <div class="detail-row">
          <span class="detail-label" style="color: #166534;">Disbursed Amount:</span>
          <span class="detail-value" style="color: #15803d;">GH₵ ${amount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #166534;">Payment Method:</span>
          <span class="detail-value" style="color: #166534;">${payoutMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #166534;">Destination Account:</span>
          <span class="detail-value" style="color: #166534; font-family: monospace; font-size: 12px;">${payoutAccount}</span>
        </div>
      </div>
      <p>If you have any questions or do not receive the funds within 24 hours, please reply to this email to contact our support team.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Marketplace Seller Services</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getVendorPayoutRejectedEmail = (
  vendorContactName: string,
  amount: number,
  reason: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payout Request Update - Cediman</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: #ef4444; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #111827; }
    .reject-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .reject-title { font-weight: 700; color: #991b1b; margin-bottom: 10px; font-size: 18px; }
    .reason-text { font-style: italic; color: #374151; background: #ffffff; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 10px; font-size: 14px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>CEDIMAN MARKETPLACE</h1>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Dear ${vendorContactName},</p>
        <p>This email is to notify you regarding your recent withdrawal request for **GH₵ ${amount.toFixed(2)}**.</p>
      </div>
      <div class="reject-box">
        <div class="reject-title">Withdrawal Request Refused</div>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px;">Your request has been rejected by our administration team. The requested amount has been fully restored to your Available Balance.</p>
        <div class="reason-text">
          <strong>Reason for decision:</strong><br/>
          ${reason}
        </div>
      </div>
      <p>Please review your payout account details in your storefront settings page to ensure they are correct, or contact support if you need assistance.</p>
    </div>
    <div class="footer">
      <p><strong>Cediman Marketplace Seller Services</strong></p>
      <p>© ${new Date().getFullYear()} Cediman. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

