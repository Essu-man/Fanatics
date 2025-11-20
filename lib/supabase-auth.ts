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
            // If profile doesn't exist, create it from metadata
            const metadata = data.user.user_metadata;
            const { error: insertError } = await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email,
                first_name: metadata.first_name || '',
                last_name: metadata.last_name || '',
                role: metadata.role || 'customer',
            });

            if (insertError) {
                console.error('Error creating user profile:', insertError);
            }

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
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error: any) {
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
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
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

        return {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
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
