CREATE TABLE public.agenda_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL, -- 'task' or 'appointment'
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_all_day boolean DEFAULT false,
  recurrence_rule text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agenda events from their company" ON public.agenda_events
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert agenda events for their company" ON public.agenda_events
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update agenda events for their company" ON public.agenda_events
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete agenda events for their company" ON public.agenda_events
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );


CREATE TABLE public.agenda_event_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.agenda_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.agenda_event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants for events in their company" ON public.agenda_event_participants
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.agenda_events WHERE company_id IN (
        SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage participants for events in their company" ON public.agenda_event_participants
  FOR ALL
  USING (
    event_id IN (
      SELECT id FROM public.agenda_events WHERE company_id IN (
        SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
      )
    )
  );


CREATE TABLE public.agenda_task_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.agenda_events(id) ON DELETE CASCADE,
  completed_date text NOT NULL,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, completed_date)
);

ALTER TABLE public.agenda_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view completions for events in their company" ON public.agenda_task_completions
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.agenda_events WHERE company_id IN (
        SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage completions for events in their company" ON public.agenda_task_completions
  FOR ALL
  USING (
    event_id IN (
      SELECT id FROM public.agenda_events WHERE company_id IN (
        SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()
      )
    )
  );
