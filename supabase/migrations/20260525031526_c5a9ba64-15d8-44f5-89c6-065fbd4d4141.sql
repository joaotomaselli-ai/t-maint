
-- Activity attachments (photos before/after for preventive activities)
CREATE TABLE public.activity_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('mechanical_before','mechanical_after','electrical_before','electrical_after')),
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_attachments_activity ON public.activity_attachments(activity_id);
ALTER TABLE public.activity_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attachments" ON public.activity_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attachments" ON public.activity_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attachments" ON public.activity_attachments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own attachments" ON public.activity_attachments FOR DELETE USING (auth.uid() = user_id);

-- Multiple technicians per activity (up to 4 for preventive)
CREATE TABLE public.activity_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 4),
  overtime_weekday_hours NUMERIC NOT NULL DEFAULT 0,
  overtime_weekend_hours NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, position)
);
CREATE INDEX idx_activity_technicians_activity ON public.activity_technicians(activity_id);
ALTER TABLE public.activity_technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own act_techs" ON public.activity_technicians FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own act_techs" ON public.activity_technicians FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own act_techs" ON public.activity_technicians FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own act_techs" ON public.activity_technicians FOR DELETE USING (auth.uid() = user_id);

-- Future replacement requests for preventive activities
ALTER TABLE public.service_reports ADD COLUMN future_replacements TEXT NOT NULL DEFAULT '';

-- Storage bucket for attachments (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-attachments', 'activity-attachments', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own activity files" ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own activity files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own activity files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own activity files" ON storage.objects FOR DELETE
  USING (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
