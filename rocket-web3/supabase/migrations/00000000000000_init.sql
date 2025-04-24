-- Create bets table
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users,
  contract_address TEXT,
  resolution_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  category TEXT,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  options JSONB,
  total_stake BIGINT DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policy for reading bets (anyone can read)
CREATE POLICY "Anyone can read bets"
  ON bets FOR SELECT
  USING (true);

-- Create policy for inserting bets (only authenticated users)
CREATE POLICY "Authenticated users can insert bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for updating bets (only the creator)
CREATE POLICY "Users can update their own bets"
  ON bets FOR UPDATE
  USING (auth.uid() = creator_id);

-- Create policy for deleting bets (only the creator)
CREATE POLICY "Users can delete their own bets"
  ON bets FOR DELETE
  USING (auth.uid() = creator_id);

-- Create an index for efficient queries
CREATE INDEX bets_creator_id_idx ON bets (creator_id);
CREATE INDEX bets_category_idx ON bets (category);
CREATE INDEX bets_status_idx ON bets (status);

-- Set up Realtime subscription
ALTER PUBLICATION supabase_realtime ADD TABLE bets; 