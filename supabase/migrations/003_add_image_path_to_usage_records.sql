-- Add image_path column to usage_records table
-- This stores the file path in Supabase Storage (e.g., {user_id}/{timestamp}.png)
-- Not a full URL since we use signed URLs for private bucket access

ALTER TABLE public.usage_records
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add index for faster queries when filtering by image_path
CREATE INDEX IF NOT EXISTS idx_usage_records_image_path ON public.usage_records(image_path)
WHERE image_path IS NOT NULL;

