// Supabase Upload Helper
// Uses Firebase UID for file naming (security through naming convention)
import { supabase } from '../config/supabase';

const BUCKET_NAME = 'provider-images';

/**
 * Upload a profile image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - Firebase UID
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export const uploadProfileImage = async (file, userId) => {
    if (!file || !userId) {
        throw new Error('File and userId are required');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Use JPG, PNG, or WebP.');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 2MB.');
    }

    // Generate unique filename using Firebase UID
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
};

/**
 * Delete a profile image from Supabase Storage
 * @param {string} fileUrl - The full URL of the image
 * @param {string} userId - Firebase UID (for verification)
 */
export const deleteProfileImage = async (fileUrl, userId) => {
    if (!fileUrl) return;

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) return;

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Verify the file belongs to this user
    if (!filePath.startsWith(userId)) {
        throw new Error('Unauthorized to delete this file');
    }

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        throw new Error('Failed to delete image');
    }
};

/**
 * Generate a placeholder avatar URL based on name
 * @param {string} name - User's name
 * @param {string} size - Image size (default 128)
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderAvatar = (name, size = 128) => {
    const encodedName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=6366f1&color=fff&bold=true`;
};
