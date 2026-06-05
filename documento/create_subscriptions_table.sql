-- Crear tabla de suscripciones para almacenar compras procesadas por el webhook
-- Ejecutar en la base de datos de Supabase

-- Drop existing table and recreate (DESTRUCTIVE - backup first!)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  plan text NOT NULL,
  product_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,
  metadata jsonb NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indices for performance
CREATE UNIQUE INDEX subscriptions_email_product_idx ON subscriptions (email, product_id);
CREATE INDEX subscriptions_email_idx ON subscriptions (email);
CREATE INDEX subscriptions_plan_idx ON subscriptions (plan);
CREATE INDEX subscriptions_expires_at_idx ON subscriptions (expires_at);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for webhook)
CREATE POLICY "service_role_access" ON subscriptions
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Create view for active subscriptions (helper)
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT *
FROM subscriptions
WHERE expires_at IS NULL OR expires_at > now();

-- Create view for expired subscriptions
CREATE OR REPLACE VIEW expired_subscriptions AS
SELECT *
FROM subscriptions
WHERE expires_at IS NOT NULL AND expires_at <= now();
