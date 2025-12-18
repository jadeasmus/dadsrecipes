-- Enable RLS on storage.objects (if not already enabled)
-- Note: This is typically enabled by default in Supabase, but included for completeness

-- Allow anonymous users to insert objects into recipe-images bucket
CREATE POLICY "Allow public insert on recipe-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'recipe-images');

-- Allow anonymous users to read objects from recipe-images bucket
CREATE POLICY "Allow public read on recipe-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'recipe-images');

-- Allow anonymous users to update objects in recipe-images bucket
CREATE POLICY "Allow public update on recipe-images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'recipe-images')
WITH CHECK (bucket_id = 'recipe-images');

-- Allow anonymous users to delete objects from recipe-images bucket
CREATE POLICY "Allow public delete on recipe-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'recipe-images');

