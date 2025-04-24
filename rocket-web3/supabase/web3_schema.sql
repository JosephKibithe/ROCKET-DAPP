-- Create wallet_users table for web3 authentication
CREATE TABLE wallet_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sign_in TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE wallet_users ENABLE ROW LEVEL SECURITY;

-- Create policy for reading wallet users
CREATE POLICY "Anyone can read wallet users"
  ON wallet_users FOR SELECT
  USING (true);

-- Create policy for inserting wallet users (self-registration)
CREATE POLICY "Users can register their own wallet"
  ON wallet_users FOR INSERT
  WITH CHECK (true);

-- Create policy for updating wallet users (only own data)
CREATE POLICY "Users can update their own wallet data"
  ON wallet_users FOR UPDATE
  USING (auth.uid() = id);

-- Create index for wallet lookups
CREATE INDEX wallet_users_address_idx ON wallet_users (wallet_address);

-- Modify bets table to reference wallet_users
ALTER TABLE bets ADD COLUMN creator_wallet TEXT REFERENCES wallet_users(wallet_address);

-- Create wallet_stakes table to track user predictions
CREATE TABLE wallet_stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE,
  wallet_address TEXT REFERENCES wallet_users(wallet_address),
  option_id TEXT NOT NULL,
  stake_amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_claimed BOOLEAN DEFAULT false,
  transaction_hash TEXT
);

-- Enable Row Level Security
ALTER TABLE wallet_stakes ENABLE ROW LEVEL SECURITY;

-- Create policy for reading stakes (anyone can read)
CREATE POLICY "Anyone can read stakes"
  ON wallet_stakes FOR SELECT
  USING (true);

-- Create policy for inserting stakes (wallet owner only)
CREATE POLICY "Wallet owners can place stakes"
  ON wallet_stakes FOR INSERT
  WITH CHECK (true); -- This will be enforced by application logic with wallet signature

-- Create policy for updating stakes (wallet owner only)
CREATE POLICY "Wallet owners can update their stakes"
  ON wallet_stakes FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create indexes for efficient queries
CREATE INDEX wallet_stakes_bet_id_idx ON wallet_stakes (bet_id);
CREATE INDEX wallet_stakes_wallet_address_idx ON wallet_stakes (wallet_address);

-- Update RLS policies for bets table to work with wallet authentication
DROP POLICY IF EXISTS "Users can update their own bets" ON bets;
DROP POLICY IF EXISTS "Users can delete their own bets" ON bets;
DROP POLICY IF EXISTS "Authenticated users can insert bets" ON bets;

CREATE POLICY "Wallet users can insert bets"
  ON bets FOR INSERT
  WITH CHECK (true); -- This will be enforced by application logic with wallet signature

CREATE POLICY "Wallet users can update their own bets"
  ON bets FOR UPDATE
  USING (creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Wallet users can delete their own bets"
  ON bets FOR DELETE
  USING (creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Set up Realtime subscription for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_users;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_stakes; 