import { useState, useRef } from 'react';
import {
    Avatar, Box, IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import { supabase } from '../supabaseClient';

const MAX_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * ProfilePhotoUpload — clickable avatar with camera overlay for photo upload.
 * Props:
 *   userId   {string}   — the auth user id (used as folder name in storage)
 *   name     {string}   — display name for initials fallback
 *   avatarUrl{string}   — current avatar URL from profile
 *   size     {number}   — avatar diameter in px (default 80)
 *   onSuccess{function} — called with new public URL after upload
 *   onError  {function} — called with error message string
 */
const ProfilePhotoUpload = ({ userId, name, avatarUrl, size = 80, onSuccess, onError }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        // Validate type
        if (!file.type.startsWith('image/')) {
            onError?.('Only image files are allowed (JPG, PNG, WEBP).');
            return;
        }
        // Validate size (1MB)
        if (file.size > MAX_SIZE) {
            onError?.('Profile photo must be under 1MB.');
            return;
        }

        setUploading(true);

        try {
            // ── Step 1: Delete ALL existing files in this user's folder ──────
            // This guarantees the old photo is removed regardless of its extension,
            // preventing stale files from accumulating in Supabase Storage.
            const { data: existingFiles } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (existingFiles && existingFiles.length > 0) {
                const pathsToDelete = existingFiles.map(f => `${userId}/${f.name}`);
                await supabase.storage.from('avatars').remove(pathsToDelete);
            }

            // ── Step 2: Upload new avatar ────────────────────────────────────
            const ext = file.name.split('.').pop().toLowerCase();
            const filePath = `${userId}/avatar.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust

            // Save to profile
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlData.publicUrl })
                .eq('id', userId);

            if (dbError) throw dbError;

            setPreviewUrl(publicUrl);
            onSuccess?.(urlData.publicUrl);
        } catch (err) {
            onError?.(err.message || 'Failed to upload photo.');
        } finally {
            setUploading(false);
        }
    };

    const initials = (name || '?').charAt(0).toUpperCase();

    return (
        <Box position="relative" display="inline-block">
            <Avatar
                src={previewUrl || undefined}
                sx={{ width: size, height: size, bgcolor: 'primary.main', fontSize: size * 0.4 }}
            >
                {!previewUrl && initials}
            </Avatar>

            {/* Upload overlay */}
            <Tooltip title="Change photo">
                <IconButton
                    size="small"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        width: size * 0.38,
                        height: size * 0.38,
                        '&:hover': { bgcolor: 'primary.50' },
                    }}
                >
                    {uploading
                        ? <CircularProgress size={size * 0.2} color="primary" />
                        : <CameraAlt sx={{ fontSize: size * 0.22 }} color="primary" />}
                </IconButton>
            </Tooltip>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </Box>
    );
};

export default ProfilePhotoUpload;
