import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/sendgrid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // 1. Generate the password reset link using Admin SDK
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cediman.com';
        const actionCodeSettings = {
            url: `${baseUrl}/reset-password`,
            handleCodeInApp: false,
        };

        const firebaseLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

        // Extract the oobCode from the Firebase link to construct our own direct link
        // preventing the user from seeing the default Firebase UI
        const urlObj = new URL(firebaseLink);
        const oobCode = urlObj.searchParams.get('oobCode');

        if (!oobCode) {
            throw new Error("Failed to extract reset code from Firebase link");
        }

        // Construct direct link to our app
        const link = `${baseUrl}/reset-password?code=${oobCode}`;

        // 2. Prepare the Custom Email HTML
        const htmlBody = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #c41e3a 0%, #a01630 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
                </div>
                
                <!-- Body -->
                <div style="background-color: #f9fafb; padding: 40px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Hello,</p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563;">
                        We received a request to reset your password for your Cediman account. Click the button below to create a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" 
                           style="display: inline-block; background: linear-gradient(135deg, #c41e3a 0%, #a01630 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);">
                            Reset Your Password
                        </a>
                    </div>
                    
                    <p style="margin: 20px 0; font-size: 14px; color: #6b7280; text-align: center;">
                        Or copy this link to your browser:
                    </p>
                    <p style="margin: 10px 0 30px 0; font-size: 12px; word-break: break-all; color: #7c3aed; background-color: #f3f4f6; padding: 10px; border-radius: 4px; border-left: 4px solid #7c3aed;">
                        ${link}
                    </p>
                    
                    <!-- Security Note -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #166534;">
                            <strong>🔒 Security Tip:</strong> This link will expire in 24 hours. If you didn't request this, please ignore this email and your password will remain unchanged.
                        </p>
                    </div>
                </div>
                
                <!-- Features -->
                <div style="background-color: #ffffff; padding: 30px 20px;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #1f2937;">Once you reset your password, you can:</p>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                        <li style="margin: 8px 0; font-size: 14px; color: #4b5563; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0;">✓</span> Log in with your new password
                        </li>
                        <li style="margin: 8px 0; font-size: 14px; color: #4b5563; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0;">✓</span> Browse our premium jersey collection
                        </li>
                        <li style="margin: 8px 0; font-size: 14px; color: #4b5563; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0;">✓</span> Track your orders and manage your account
                        </li>
                    </ul>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #9ca3af;">
                        Need help? Contact us at <a href="mailto:support@cediman.com" style="color: #c41e3a; text-decoration: none;">support@cediman.com</a>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #d1d5db;">
                        © ${new Date().getFullYear()} Cediman. All rights reserved.<br>
                        <a href="https://www.cediman.com" style="color: #c41e3a; text-decoration: none;">www.cediman.com</a>
                    </p>
                </div>
            </div>
        `;

        const textBody = `
            Password Reset Request
            
            Hello,
            
            We received a request to reset your password for your Cediman account. Visit this link to create a new password:
            
            ${link}
            
            This link will expire in 24 hours.
            
            If you didn't request this, please ignore this email and your password will remain unchanged.
            
            Need help? Contact us at support@cediman.com
            
            © ${new Date().getFullYear()} Cediman. All rights reserved.
        `;

        // 3. Send email using SendGrid
        const emailResult = await sendEmail(
            email,
            "Reset Your Cediman Password",
            htmlBody,
            textBody
        );

        if (emailResult.success) {
            return NextResponse.json({ success: true });
        } else {
            throw new Error(emailResult.error || "Failed to send email via SendGrid");
        }

    } catch (error: any) {
        console.error("Reset Password API Error:", error);

        let errorMessage = "Failed to send reset email";
        if (error.code === 'auth/user-not-found') {
            // Silence user-not-found error for security (or decide to show it)
            // But usually we don't want to reveal if email exists. 
            // However, verify-email flows often DO check. 
            // For now, let's just return success or generic error to stay safe.
            // Actually, for better UX in this specific app context, let's log it but return generic error.
            errorMessage = "If an account exists with this email, you will receive a reset link.";
            return NextResponse.json({ success: true, message: errorMessage });
        }

        return NextResponse.json(
            { success: false, error: error.message || errorMessage },
            { status: 500 }
        );
    }
}
