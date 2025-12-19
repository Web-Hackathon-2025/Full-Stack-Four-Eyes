// Supabase configuration for storage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload profile image
export const uploadProfileImage = async (file, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { data, error } = await supabase.storage
        .from('karigar-images')
        .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from('karigar-images')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
};

export default supabase;
