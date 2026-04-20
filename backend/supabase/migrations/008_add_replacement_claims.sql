-- Migration 008: Add replacement_claims table for in-app returns/replacement requests

CREATE TABLE replacement_claims (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  order_reference VARCHAR(120) NOT NULL,
  issue_type      VARCHAR(30) NOT NULL CHECK (issue_type IN ('damaged', 'wrong_item', 'quality_issue', 'other')),
  description     TEXT NOT NULL,
  evidence_urls   TEXT[] NOT NULL DEFAULT '{}',
  contact_name    VARCHAR(100) NOT NULL,
  contact_email   VARCHAR(255) NOT NULL,
  contact_phone   VARCHAR(20),
  status          VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'approved', 'rejected', 'resolved')),
  admin_notes     TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replacement_claims_user ON replacement_claims (user_id);
CREATE INDEX idx_replacement_claims_status ON replacement_claims (status);
CREATE INDEX idx_replacement_claims_order_reference ON replacement_claims (order_reference);
CREATE INDEX idx_replacement_claims_created ON replacement_claims (created_at DESC);

-- RLS
ALTER TABLE replacement_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON replacement_claims
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own claims" ON replacement_claims
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Admins can manage claims" ON replacement_claims
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger for updated_at
CREATE TRIGGER update_replacement_claims_updated_at
BEFORE UPDATE ON replacement_claims
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE replacement_claims IS 'User replacement/refund issue claims submitted from Returns page';
