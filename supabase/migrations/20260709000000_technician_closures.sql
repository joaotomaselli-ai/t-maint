CREATE TABLE technician_monthly_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  reference_month varchar(7) NOT NULL, -- Format YYYY-MM
  hours_amount numeric(10,2) NOT NULL DEFAULT 0,
  km_amount numeric(10,2) NOT NULL DEFAULT 0,
  extra_amount numeric(10,2) NOT NULL DEFAULT 0,
  complement_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, technician_id, reference_month)
);

ALTER TABLE technician_monthly_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view technician closures of their company" ON technician_monthly_closures
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage technician closures" ON technician_monthly_closures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND company_id = technician_monthly_closures.company_id AND role IN ('admin', 'master')
    )
  );
