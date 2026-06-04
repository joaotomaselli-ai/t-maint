
DROP POLICY IF EXISTS "Users upload own activity files" ON storage.objects;
CREATE POLICY "Users upload own activity files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'activity-attachments');

