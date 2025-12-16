import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    confirmPasswordReset as firebaseConfirmPasswordReset,
    onAuthStateChanged,
    type User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile as updateFirestoreProfile,
    type UserProfile
} from './firestore';

// Auth User Interface (matches the existing AuthUser interface)
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'customer' | 'delivery';
    phone?: string;
}

/**
 * Sign up a new user
 */
export const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
) => {
    try {
        // Create Firebase auth user
        const { user: firebaseUser } = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Update Firebase auth profile
        await updateProfile(firebaseUser, {
            displayName: `${firstName} ${lastName}`,
        });

        // Send email verification with custom action handler
        try {
            await sendEmailVerification(firebaseUser, {
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cediman.com'}/auth/action`,
                handleCodeInApp: false,
            });
        } catch (emailError) {
            console.warn('Could not send verification email:', emailError);
            // Don't fail signup if email sending fails
        }

        // Create user profile in Firestore
        const profileData: Omit<UserProfile, 'uid' | 'createdAt'> = {
            email,
            firstName,
            lastName,
            role: 'customer',
            emailVerified: firebaseUser.emailVerified,
            // Only include phone if it's provided (not undefined)
            ...(phone && { phone }),
        };

        const profileResult = await createUserProfile(firebaseUser.uid, profileData);

        // Send welcome email via SendGrid
        if (profileResult.success) {
            try {
                await fetch('/api/notifications/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: 'Welcome to Cediman - Verify Your Email',
                        htmlBody: `
                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #2563eb; margin: 0;">Welcome to Cediman!</h1>
                                </div>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                    <p>Hi ${firstName},</p>
                                    <p>Thank you for creating an account with <strong>Cediman</strong>! We're excited to have you join our community.</p>
                                    <p>Your account has been successfully created. To complete your registration and start shopping for premium jerseys, please verify your email address by clicking the link below:</p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/verify-email?email=${encodeURIComponent(email)}" 
                                           style="display: inline-block; background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                            Verify Your Email
                                        </a>
                                    </div>
                                    
                                    <p style="font-size: 13px; color: #666; margin-top: 20px;">
                                        If the button above doesn't work, copy and paste this link in your browser:<br>
                                        <span style="word-break: break-all;">${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/verify-email?email=${encodeURIComponent(email)}</span>
                                    </p>
                                </div>
                                
                                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                                    <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
                                    <ul style="color: #666; line-height: 1.8;">
                                        <li><strong>Explore Teams</strong> - Browse jerseys from your favorite teams</li>
                                        <li><strong>Shop Premium Jerseys</strong> - Discover authentic and stylish jerseys</li>
                                        <li><strong>Track Orders</strong> - Keep an eye on your purchases</li>
                                        <li><strong>Save to Wishlist</strong> - Mark items for later</li>
                                    </ul>
                                </div>
                                
                                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center;">
                                    <p style="margin: 0; font-size: 13px; color: #999;">
                                        Need help? Contact our support team at <a href="mailto:support@cediman.com" style="color: #2563eb; text-decoration: none;">support@cediman.com</a>
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="font-size: 12px; color: #999; margin: 0;">
                                        © 2025 Cediman. All rights reserved.<br>
                                        <a href="https://www.cediman.com" style="color: #2563eb; text-decoration: none;">Visit our website</a>
                                    </p>
                                </div>
                            </div>
                        `,
                        textBody: `
                            Welcome to Cediman!
                            
                            Hi ${firstName},
                            
                            Thank you for creating an account with Cediman! We're excited to have you join our community.
                            
                            Your account has been successfully created. To complete your registration and start shopping for premium jerseys, please verify your email address by visiting the link below:
                            
                            ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/verify-email?email=${encodeURIComponent(email)}
                            
                            What's Next?
                            - Explore Teams - Browse jerseys from your favorite teams
                            - Shop Premium Jerseys - Discover authentic and stylish jerseys
                            - Track Orders - Keep an eye on your purchases
                            - Save to Wishlist - Mark items for later
                            
                            Need help? Contact our support team at support@cediman.com
                            
                            © 2025 Cediman. All rights reserved.
                            Visit our website: https://www.cediman.com
                        `,
                    }),
                });
            } catch (sendgridError) {
                console.warn('Failed to send welcome email via SendGrid:', sendgridError);
                // Don't fail signup if SendGrid email fails
            }
        }

        if (!profileResult.success) {
            // If profile creation fails, delete the auth user
            await firebaseUser.delete();
            return { success: false, error: profileResult.error || 'Failed to create user profile' };
        }

        // Get the created profile
        const profile = await getUserProfile(firebaseUser.uid);

        return {
            success: true,
            user: profile ? {
                id: profile.uid,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                phone: profile.phone,
            } as AuthUser : null,
        };
    } catch (error: any) {
        console.error('Error signing up:', error);
        return {
            success: false,
            error: error.message || 'Sign up failed',
        };
    }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string) => {
    try {
        const { user: firebaseUser } = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Get user profile from Firestore
        let profile = await getUserProfile(firebaseUser.uid);

        // If profile doesn't exist, create it from auth metadata
        if (!profile) {
            const displayName = firebaseUser.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const profileData: Omit<UserProfile, 'uid' | 'createdAt'> = {
                email: firebaseUser.email!,
                firstName,
                lastName,
                role: 'customer',
                emailVerified: firebaseUser.emailVerified,
            };

            await createUserProfile(firebaseUser.uid, profileData);
            profile = await getUserProfile(firebaseUser.uid);
        }

        if (!profile) {
            return { success: false, error: 'Failed to load user profile' };
        }

        return {
            success: true,
            user: {
                id: profile.uid,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                phone: profile.phone,
            } as AuthUser,
        };
    } catch (error: any) {
        console.error('Error signing in:', error);
        return {
            success: false,
            error: error.message || 'Sign in failed',
        };
    }
};

/**
 * Send password reset email via Firebase
 */
export const sendPasswordResetEmailToUser = async (email: string) => {
    try {
        // Get production URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cediman.com';

        // Send Firebase password reset email
        await sendPasswordResetEmail(auth, email, {
            url: `${baseUrl}/reset-password`,
            handleCodeInApp: false,
        });

        // Also send beautiful email via SendGrid with manual instructions
        try {
            const response = await fetch('/api/notifications/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Reset Your Cediman Password',
                    htmlBody: `
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
                                    <a href="${baseUrl}/reset-password" 
                                       style="display: inline-block; background: linear-gradient(135deg, #c41e3a 0%, #a01630 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);">
                                        Reset Your Password
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0; font-size: 14px; color: #6b7280; text-align: center;">
                                    Or copy this link to your browser:
                                </p>
                                <p style="margin: 10px 0 30px 0; font-size: 12px; word-break: break-all; color: #7c3aed; background-color: #f3f4f6; padding: 10px; border-radius: 4px; border-left: 4px solid #7c3aed;">
                                    ${baseUrl}/reset-password
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
                                    © 2025 Cediman. All rights reserved.<br>
                                    <a href="https://www.cediman.com" style="color: #c41e3a; text-decoration: none;">www.cediman.com</a>
                                </p>
                            </div>
                        </div>
                    `,
                    textBody: `
                        Password Reset Request
                        
                        Hello,
                        
                        We received a request to reset your password for your Cediman account. Visit this link to create a new password:
                        
                        ${baseUrl}/reset-password
                        
                        This link will expire in 24 hours.
                        
                        If you didn't request this, please ignore this email and your password will remain unchanged.
                        
                        Once you reset your password, you can:
                        • Log in with your new password
                        • Browse our premium jersey collection
                        • Track your orders and manage your account
                        
                        Need help? Contact us at support@cediman.com
                        
                        © 2025 Cediman. All rights reserved.
                        www.cediman.com
                    `,
                }),
            });

            if (!response.ok) {
                console.warn('SendGrid email sent but with warning:', await response.text());
            }
        } catch (sendgridError) {
            console.warn('Failed to send email via SendGrid:', sendgridError);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error sending password reset email:', error);
        return {
            success: false,
            error: error.message || 'Failed to send password reset email'
        };
    }
};

/**
 * Confirm password reset with action code
 */
export const confirmPasswordReset = async (actionCode: string, newPassword: string) => {
    try {
        console.log('confirmPasswordReset: Starting with actionCode length:', actionCode.length);

        const result = await firebaseConfirmPasswordReset(auth, actionCode, newPassword);

        console.log('confirmPasswordReset: Success!', result);
        return { success: true };
    } catch (error: any) {
        console.error('confirmPasswordReset: Error', {
            code: error.code,
            message: error.message,
            fullError: error
        });
        return {
            success: false,
            error: error.message || 'Failed to reset password'
        };
    }
};
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        // Clear session storage (but not all localStorage to preserve other app data)
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            // Only clear auth-related localStorage items, not everything
            // localStorage.clear() is too aggressive and can break other features
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error signing out:', error);
        return {
            success: false,
            error: error.message || 'Sign out failed',
        };
    }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            return null;
        }

        // Get user profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);

        if (!profile) {
            // Fallback to auth metadata
            const displayName = firebaseUser.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            return {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                firstName,
                lastName,
                role: 'customer',
            };
        }

        return {
            id: profile.uid,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            phone: profile.phone,
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const profile = await getUserProfile(firebaseUser.uid);
                if (profile) {
                    callback({
                        id: profile.uid,
                        email: profile.email,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        role: profile.role,
                        phone: profile.phone,
                    });
                } else {
                    // Profile not found, but Firebase user exists - use metadata as fallback
                    const displayName = firebaseUser.displayName || '';
                    const nameParts = displayName.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    const metadata = firebaseUser.metadata;

                    callback({
                        id: firebaseUser.uid,
                        email: firebaseUser.email!,
                        firstName,
                        lastName,
                        role: 'customer', // Default role if profile not found
                    });
                }
            } catch (error) {
                console.error('Error fetching profile in auth state change:', error);
                // On error, still provide user info from Firebase auth
                // Don't clear user on temporary errors
                const displayName = firebaseUser.displayName || '';
                const nameParts = displayName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                callback({
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                    firstName,
                    lastName,
                    role: 'customer',
                });
            }
        } else {
            // Firebase user is null - real logout
            callback(null);
        }
    });
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string, redirectUrl?: string) => {
    try {
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/auth/action`,
            handleCodeInApp: false,
        };

        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        return { success: true };
    } catch (error: any) {
        console.error('Error sending password reset:', error);
        return {
            success: false,
            error: error.message || 'Failed to send password reset email',
        };
    }
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async () => {
    try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            return { success: false, error: 'Not authenticated' };
        }

        if (firebaseUser.emailVerified) {
            return { success: false, error: 'Email already verified' };
        }

        await sendEmailVerification(firebaseUser, {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.cediman.com'}/auth/action`,
            handleCodeInApp: false,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error sending email verification:', error);
        return {
            success: false,
            error: error.message || 'Failed to send verification email',
        };
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: Partial<AuthUser>) => {
    try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Update Firestore profile
        const firestoreUpdates: Partial<UserProfile> = {};
        if (updates.firstName !== undefined) firestoreUpdates.firstName = updates.firstName;
        if (updates.lastName !== undefined) firestoreUpdates.lastName = updates.lastName;
        if (updates.phone !== undefined) firestoreUpdates.phone = updates.phone;
        if (updates.role !== undefined) firestoreUpdates.role = updates.role;

        const result = await updateFirestoreProfile(firebaseUser.uid, firestoreUpdates);

        // Update Firebase auth display name if name changed
        if (updates.firstName || updates.lastName) {
            const currentProfile = await getUserProfile(firebaseUser.uid);
            if (currentProfile) {
                await updateProfile(firebaseUser, {
                    displayName: `${currentProfile.firstName} ${currentProfile.lastName}`,
                });
            }
        }

        return result;
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        return {
            success: false,
            error: error.message || 'Failed to update profile',
        };
    }
};

