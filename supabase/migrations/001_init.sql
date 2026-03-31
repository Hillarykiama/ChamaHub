-- ChamaHub initial schema

CREATE TABLE chamas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id   uuid REFERENCES chamas(id) ON DELETE CASCADE,
  full_name  text NOT NULL,
  phone      text NOT NULL,
  role       text DEFAULT 'member',
  joined_at  date DEFAULT now(),
  status     text DEFAULT 'active'
);

CREATE TABLE contributions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid REFERENCES members(id) ON DELETE CASCADE,
  chama_id            uuid REFERENCES chamas(id) ON DELETE CASCADE,
  amount              integer NOT NULL,
  period              text NOT NULL,
  status              text DEFAULT 'pending',
  mpesa_ref           text,
  checkout_request_id text,
  paid_at             timestamptz,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE loans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid REFERENCES members(id) ON DELETE CASCADE,
  chama_id     uuid REFERENCES chamas(id) ON DELETE CASCADE,
  amount       integer NOT NULL,
  balance      integer NOT NULL,
  rate         numeric DEFAULT 5,
  purpose      text,
  status       text DEFAULT 'pending',
  disbursed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE meetings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id         uuid REFERENCES chamas(id) ON DELETE CASCADE,
  meeting_date     date NOT NULL,
  meeting_time     text,
  venue            text,
  agenda           text[],
  attendance       text,
  minutes_recorded boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE chamas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings     ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_members_chama       ON members(chama_id);
CREATE INDEX idx_contributions_chama ON contributions(chama_id);
CREATE INDEX idx_contributions_period ON contributions(period);
CREATE INDEX idx_loans_chama         ON loans(chama_id);
CREATE INDEX idx_meetings_chama      ON meetings(chama_id);