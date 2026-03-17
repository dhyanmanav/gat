-- Create KV Store Table for GAT Certificate Management System
CREATE TABLE IF NOT EXISTS kv_store_b46b7a19 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE kv_store_b46b7a19 ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
DROP POLICY IF EXISTS "Allow service role full access" ON kv_store_b46b7a19;
CREATE POLICY "Allow service role full access" ON kv_store_b46b7a19
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
