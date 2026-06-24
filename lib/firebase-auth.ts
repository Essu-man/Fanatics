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
    role: 'admin' | 'customer' | 'delivery' | 'vendor';
    phone?: string;
    /** Present when role is vendor */
    vendorId?: string;
}

/**
 * Sign up a new user
 */
export const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'customer' | 'vendor' = 'customer',
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

        // OTP-based email verification will be triggered after profile creation

        // Create user profile in Firestore
        const profileData: Omit<UserProfile, 'uid' | 'createdAt'> = {
            email,
            firstName,
            lastName,
            role,
            emailVerified: false,
            // Only include phone if it's provided (not undefined)
            ...(phone && { phone }),
        };

        const profileResult = await createUserProfile(firebaseUser.uid, profileData);

        // After profile creation, trigger OTP email verification
        if (profileResult.success) {
            try {
                const idToken = await firebaseUser.getIdToken();
                // Fire-and-forget: send OTP email via server API
                fetch("/api/auth/send-verification", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${idToken}` },
                }).catch((err) => console.warn("OTP send failed:", err));
            } catch (otpErr) {
                console.warn("Could not trigger OTP send:", otpErr);
            }
        }

        // Also send welcome email
        if (profileResult.success) {
            try {
                const isVendor = role === "vendor";
                const welcomeSubject = isVendor
                    ? "Welcome to Cediman - Seller Account Created"
                    : "Welcome to Cediman!";

                const welcomeHtml = isVendor
                    ? `
                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #10b981; margin: 0;">Welcome to Cediman Seller Portal!</h1>
                                </div>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                    <p>Hi ${firstName},</p>
                                    <p>Thank you for registering a seller account with <strong>Cediman</strong>! We're excited to have you join our marketplace community.</p>
                                    <p>Your account has been successfully created. You can now access your seller dashboard to manage your applications and storefront:</p>
                                     
                                    <div style="text-align: center; margin: 30px 0;">
                                         <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/vendor" 
                                            style="display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                             Go to Seller Dashboard
                                         </a>
                                    </div>
                                    
                                    <p style="font-size: 13px; color: #666; margin-top: 20px;">
                                         If the button above doesn't work, copy and paste this link in your browser:<br>
                                         <span style="word-break: break-all;">${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/vendor</span>
                                     </p>
                                </div>
                                
                                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                                    <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
                                    <ul style="color: #666; line-height: 1.8;">
                                        <li><strong>Submit/Review Application</strong> - Submit store details and bank details for approval</li>
                                        <li><strong>Set Up Your Storefront</strong> - Customize your logo, banner, and descriptions</li>
                                        <li><strong>List Products</strong> - Upload premium jersey listings for buyers to see</li>
                                        <li><strong>Receive Payouts</strong> - Withdraw earnings to your bank or mobile money wallet</li>
                                    </ul>
                                </div>
                                
                                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center;">
                                    <p style="margin: 0; font-size: 13px; color: #999;">
                                         Need help? Contact our seller support team at <a href="mailto:support@cediman.com" style="color: #2563eb; text-decoration: none;">support@cediman.com</a>
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="font-size: 12px; color: #999; margin: 0;">
                                         © 2025 Cediman. All rights reserved.<br>
                                         <a href="https://www.cediman.com" style="color: #2563eb; text-decoration: none;">Visit our website</a>
                                    </p>
                                </div>
                            </div>
                        `
                    : `
                            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #2563eb; margin: 0;">Welcome to Cediman!</h1>
                                </div>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                    <p>Hi ${firstName},</p>
                                    <p>Thank you for creating an account with <strong>Cediman</strong>! We're excited to have you join our community.</p>
                                    <p>Your account has been successfully created. You can start shopping for premium jerseys right away:</p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                         <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/" 
                                            style="display: inline-block; background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                             Start Shopping
                                         </a>
                                    </div>
                                    
                                    <p style="font-size: 13px; color: #666; margin-top: 20px;">
                                        If the button above doesn't work, copy and paste this link in your browser:<br>
                                        <span style="word-break: break-all;">${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/</span>
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
                        `;

                const welcomeText = isVendor
                    ? `
                            Welcome to Cediman Seller Portal!
                            
                            Hi ${firstName},
                            
                            Thank you for registering a seller account with Cediman! We're excited to have you join our marketplace community.
                            
                            Your account has been successfully created. To set up your store and dashboard, visit your seller dashboard:
                            
                            ${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/vendor
                            
                            What's Next?
                            - Submit/Review Application - Submit store details and bank details for approval
                            - Set Up Your Storefront - Customize your logo, banner, and descriptions
                            - List Products - Upload premium jersey listings for buyers to see
                            - Receive Payouts - Withdraw earnings to your bank or mobile money wallet
                            
                            Need help? Contact our seller support team at support@cediman.com
                            
                            © 2025 Cediman. All rights reserved.
                            Visit our website: https://www.cediman.com
                        `
                    : `
                            Welcome to Cediman!
                            
                            Hi ${firstName},
                            
                            Thank you for creating an account with Cediman! We're excited to have you join our community.
                            
                            Your account has been successfully created. Start shopping for premium jerseys now:
                            
                            ${process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com"}/
                            
                            What's Next?
                            - Explore Teams - Browse jerseys from your favorite teams
                            - Shop Premium Jerseys - Discover authentic and stylish jerseys
                            - Track Orders - Keep an eye on your purchases
                            - Save to Wishlist - Mark items for later
                            
                            Need help? Contact our support team at support@cediman.com
                            
                            © 2025 Cediman. All rights reserved.
                            Visit our website: https://www.cediman.com
                        `;

                await fetch("/api/notifications/send-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: welcomeSubject,
                        htmlBody: welcomeHtml,
                        textBody: welcomeText,
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
                ...(profile.vendorId ? { vendorId: profile.vendorId } : {}),
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
                ...(profile.vendorId ? { vendorId: profile.vendorId } : {}),
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
        // Call our custom API route which uses Firebase Admin to generate the link
        // and SendGrid to send the custom HTML email
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send reset email');
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
                ...(profile.vendorId ? { vendorId: profile.vendorId } : {}),
            };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Listen to auth state changes
 */
async function loadAuthUserViaApi(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
    try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
            return data.user as AuthUser;
        }
    } catch {
        /* use Firestore fallback */
    }
    return null;
}

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const fromApi = await loadAuthUserViaApi(firebaseUser);
                if (fromApi) {
                    callback(fromApi);
                    return;
                }

                const profile = await getUserProfile(firebaseUser.uid);
                if (profile) {
                    callback({
                        id: profile.uid,
                        email: profile.email,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        role: profile.role,
                        phone: profile.phone,
                        ...(profile.vendorId ? { vendorId: profile.vendorId } : {}),
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
        if (updates.vendorId !== undefined) firestoreUpdates.vendorId = updates.vendorId;

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

