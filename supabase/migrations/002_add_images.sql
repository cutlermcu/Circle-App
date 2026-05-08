-- Circle App v0.1.1 — Add image support

-- Add image_url to questions and prompts
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'circle-images',
  'circle-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: teachers upload to their own folder
CREATE POLICY "teachers_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'circle-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: teachers manage their own files
CREATE POLICY "teachers_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'circle-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: public read
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'circle-images');
