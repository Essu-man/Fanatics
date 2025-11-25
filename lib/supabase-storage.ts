import { createClient } from '@supabase/supabase-js';

// Supabase Storage configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client for storage operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
const STORAGE_BUCKET = 'product-images';

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param path - The path in the bucket (e.g., 'products/product-id/image.jpg')
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (
    file: File,
    path: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'File must be an image' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { success: false, error: 'File size must be less than 5MB' };
        }

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false, // Don't overwrite existing files
            });

        if (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl,
        };
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image',
        };
    }
};

/**
 * Upload multiple images for a product
 * @param files - Array of files to upload
 * @param productId - The product ID
 * @returns Array of public URLs
 */
export const uploadProductImages = async (
    files: File[],
    productId: string
): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
    try {
        const urls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.name.split('.').pop() || 'jpg';
            const path = `products/${productId}/${i}.${extension}`;

            const result = await uploadImage(file, path);

            if (!result.success || !result.url) {
                return {
                    success: false,
                    error: result.error || `Failed to upload image ${i + 1}`,
                };
            }

            urls.push(result.url);
        }

        return {
            success: true,
            urls,
        };
    } catch (error: any) {
        console.error('Error uploading product images:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload images',
        };
    }
};

/**
 * Delete an image from Supabase Storage
 * @param path - The path of the image to delete
 */
export const deleteImage = async (
    path: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Error deleting image:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting image:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete image',
        };
    }
};

/**
 * Delete all images for a product
 * @param productId - The product ID
 */
export const deleteProductImages = async (
    productId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // List all files in the product folder
        const { data: files, error: listError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(`products/${productId}`);

        if (listError) {
            console.error('Error listing images:', listError);
            return { success: false, error: listError.message };
        }

        if (!files || files.length === 0) {
            return { success: true }; // No images to delete
        }

        // Delete all files
        const paths = files.map((file) => `products/${productId}/${file.name}`);
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(paths);

        if (error) {
            console.error('Error deleting product images:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting product images:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete product images',
        };
    }
};

/**
 * Get public URL for an image
 * @param path - The path of the image
 * @returns The public URL
 */
export const getImageUrl = (path: string): string => {
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
};

/**
 * Check if a storage bucket exists, create if it doesn't
 * Note: This requires admin privileges, so it's best to create the bucket manually in Supabase Dashboard
 */
export const ensureBucketExists = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        // Check if bucket exists by trying to list files
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('', { limit: 1 });

        if (error && error.message.includes('not found')) {
            return {
                success: false,
                error: `Bucket "${STORAGE_BUCKET}" does not exist. Please create it in Supabase Dashboard > Storage.`,
            };
        }

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to check bucket',
        };
    }
};

