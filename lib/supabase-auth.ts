import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase Authentication Helper Functions

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'admin' | 'delivery';
    phone?: string;
}

/**
 * Sign up a new user with Supabase Auth
 */
export const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'customer' | 'admin' | 'delivery' = 'customer'
) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                },
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'Failed to create user' };
        }

        // Create user profile in users table
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
            role: role,
        });

        if (profileError) {
            console.error('Error creating user profile:', profileError);
        }

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email!,
                firstName,
                lastName,
                role,
            } as AuthUser,
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Sign up failed' };
    }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'Invalid credentials' };
        }

        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            // If profile doesn't exist or can't be read, try to create it
            // Use upsert to handle case where profile exists but RLS blocks read
            const metadata = data.user.user_metadata;
            const { data: upsertedProfile, error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: data.user.id,
                    email: data.user.email,
                    first_name: metadata.first_name || '',
                    last_name: metadata.last_name || '',
                    role: metadata.role || 'customer',
                }, {
                    onConflict: 'id',
                })
                .select()
                .single();

            if (upsertError) {
                console.error('Error upserting user profile:', upsertError);
                // If upsert fails, try to get profile again (might have been created)
                const { data: retryProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (retryProfile) {
                    return {
                        success: true,
                        user: {
                            id: retryProfile.id,
                            email: retryProfile.email,
                            firstName: retryProfile.first_name,
                            lastName: retryProfile.last_name,
                            role: retryProfile.role,
                            phone: retryProfile.phone,
                        } as AuthUser,
                    };
                }

                // Fallback to metadata if all else fails
                return {
                    success: true,
                    user: {
                        id: data.user.id,
                        email: data.user.email!,
                        firstName: metadata.first_name || '',
                        lastName: metadata.last_name || '',
                        role: metadata.role || 'customer',
                    } as AuthUser,
                };
            }

            // Use upserted profile if available
            if (upsertedProfile) {
                return {
                    success: true,
                    user: {
                        id: upsertedProfile.id,
                        email: upsertedProfile.email,
                        firstName: upsertedProfile.first_name,
                        lastName: upsertedProfile.last_name,
                        role: upsertedProfile.role,
                        phone: upsertedProfile.phone,
                    } as AuthUser,
                };
            }

            // Final fallback
            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    firstName: metadata.first_name || '',
                    lastName: metadata.last_name || '',
                    role: metadata.role || 'customer',
                } as AuthUser,
            };
        }

        return {
            success: true,
            user: {
                id: profile.id,
                email: profile.email,
                firstName: profile.first_name,
                lastName: profile.last_name,
                role: profile.role,
                phone: profile.phone,
            } as AuthUser,
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Sign in failed' };
    }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    try {
        // Sign out from all sessions
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
            console.error('Supabase signOut error:', error);
            return { success: false, error: error.message };
        }

        // Clear any cached session data
        try {
            // Force clear session storage
            if (typeof window !== 'undefined') {
                sessionStorage.clear();
            }
        } catch (e) {
            console.warn('Error clearing sessionStorage:', e);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Sign out exception:', error);
        return { success: false, error: error.message || 'Sign out failed' };
    }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.warn('Profile not found or error:', profileError);
            // Fallback to metadata
            const metadata = user.user_metadata;
            return {
                id: user.id,
                email: user.email!,
                firstName: metadata.first_name || '',
                lastName: metadata.last_name || '',
                role: metadata.role || 'customer',
            };
        }

        // Log the role for debugging
        console.log('User profile loaded:', {
            id: profile.id,
            email: profile.email,
            role: profile.role
        });

        return {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role as 'admin' | 'customer' | 'delivery',
            phone: profile.phone,
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: Partial<AuthUser>) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Update users table
        const { error } = await supabase
            .from('users')
            .update({
                first_name: updates.firstName,
                last_name: updates.lastName,
                phone: updates.phone,
            })
            .eq('id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Update failed' };
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
    try {
        // Get the base URL (use domain for production, or env variable)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (typeof window !== 'undefined' ? window.location.origin : 'https://www.cediman.com');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${baseUrl}/reset-password`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Password reset failed' };
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const user = await getCurrentUser();
            callback(user);
        } else {
            callback(null);
        }
    });
};
