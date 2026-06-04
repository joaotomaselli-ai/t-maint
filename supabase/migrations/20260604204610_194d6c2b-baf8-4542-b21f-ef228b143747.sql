
INSERT INTO storage.buckets (id, name, public) VALUES ('client-contracts', 'client-contracts', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Contracts permissive insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-contracts');

CREATE POLICY "Contracts permissive select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-contracts');

CREATE POLICY "Contracts permissive update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'client-contracts');

CREATE POLICY "Contracts permissive delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-contracts');

