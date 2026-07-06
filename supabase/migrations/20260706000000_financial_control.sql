ALTER TABLE service_reports 
ADD COLUMN is_package boolean DEFAULT false,
ADD COLUMN package_value numeric(10,2),
ADD COLUMN package_contract_file text;

CREATE TABLE preventive_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reference_month varchar(7) NOT NULL,
  amount numeric(10,2) NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, client_id, reference_month)
);

ALTER TABLE preventive_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view preventive payments of their company" ON preventive_payments
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage preventive payments" ON preventive_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND company_id = preventive_payments.company_id AND role IN ('admin', 'master')
    )
  );
