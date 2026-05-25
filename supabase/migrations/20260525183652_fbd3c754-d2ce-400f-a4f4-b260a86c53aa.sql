CREATE TABLE public.service_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_id uuid NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  technician_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  travel_out_start text NOT NULL DEFAULT '',
  travel_out_end text NOT NULL DEFAULT '',
  service_start text NOT NULL DEFAULT '',
  service_end text NOT NULL DEFAULT '',
  travel_back_start text NOT NULL DEFAULT '',
  travel_back_end text NOT NULL DEFAULT '',
  km numeric NOT NULL DEFAULT 0,
  overtime_weekday_hours numeric NOT NULL DEFAULT 0,
  overtime_weekend_hours numeric NOT NULL DEFAULT 0,
  activities_done text NOT NULL DEFAULT '',
  observation text,
  position integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_sessions_activity_id_idx ON public.service_sessions(activity_id);
CREATE INDEX service_sessions_user_id_idx ON public.service_sessions(user_id);

ALTER TABLE public.service_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.service_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.service_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.service_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.service_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER service_sessions_touch_updated_at
  BEFORE UPDATE ON public.service_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial sessions from existing service_reports
INSERT INTO public.service_sessions (
  user_id, activity_id, technician_id, date,
  travel_out_start, travel_out_end, service_start, service_end,
  travel_back_start, travel_back_end, km,
  overtime_weekday_hours, overtime_weekend_hours,
  activities_done, observation, position
)
SELECT
  sr.user_id, sr.id,
  (SELECT t.id FROM public.technicians t
    WHERE t.user_id = sr.user_id AND t.name = sr.technician LIMIT 1),
  sr.date,
  sr.travel_out_start, sr.travel_out_end, sr.service_start, sr.service_end,
  sr.travel_back_start, sr.travel_back_end, sr.km,
  sr.overtime_weekday_hours, sr.overtime_weekend_hours,
  sr.summary, sr.observation, 1
FROM public.service_reports sr;