-- Migration: Web3 Wallet Authentication
-- Description: Add support for web3 wallet authentication

-- Create wallet_users table
CREATE TABLE IF NOT EXISTS wallet_users (
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
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create index for wallet lookups
CREATE INDEX IF NOT EXISTS wallet_users_address_idx ON wallet_users (wallet_address);

-- Alter bets table to add creator_wallet column if it doesn't exist
ALTER TABLE bets 
ADD COLUMN IF NOT EXISTS creator_wallet TEXT REFERENCES wallet_users(wallet_address);

-- Create wallet_stakes table
CREATE TABLE IF NOT EXISTS wallet_stakes (
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

-- Create indexes for wallet_stakes
CREATE INDEX IF NOT EXISTS wallet_stakes_bet_id_idx ON wallet_stakes (bet_id);
CREATE INDEX IF NOT EXISTS wallet_stakes_wallet_address_idx ON wallet_stakes (wallet_address);

-- Add creator_wallet-based policies for the bets table
CREATE POLICY "Wallet users can insert bets"
  ON bets FOR INSERT
  WITH CHECK (creator_wallet IS NOT NULL);

-- Update the existing policy for updating bets
DROP POLICY IF EXISTS "Users can update their own bets" ON bets;
CREATE POLICY "Users can update their own bets"
  ON bets FOR UPDATE
  USING (
    (auth.uid() = creator_id) OR 
    (creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  );

-- Update the existing policy for deleting bets
DROP POLICY IF EXISTS "Users can delete their own bets" ON bets;
CREATE POLICY "Users can delete their own bets"
  ON bets FOR DELETE
  USING (
    (auth.uid() = creator_id) OR 
    (creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  );

-- Create index for creator_wallet
CREATE INDEX IF NOT EXISTS bets_creator_wallet_idx ON bets (creator_wallet);

-- Set up Realtime subscriptions for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_users;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_stakes;

-- Create or replace wallet registration function
CREATE OR REPLACE FUNCTION register_wallet_user(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user JSONB;
BEGIN
  -- Check if user exists
  SELECT id INTO v_user_id FROM wallet_users WHERE wallet_address = p_wallet_address;
  
  IF v_user_id IS NULL THEN
    -- Insert new user
    INSERT INTO wallet_users (wallet_address, username, last_sign_in)
    VALUES (p_wallet_address, COALESCE(p_username, 'User_' || substr(p_wallet_address, 3, 8)), now())
    RETURNING id INTO v_user_id;
  ELSE
    -- Update existing user's last sign in
    UPDATE wallet_users
    SET last_sign_in = now(),
        username = COALESCE(p_username, username)
    WHERE id = v_user_id;
  END IF;
  
  -- Get user info
  SELECT json_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'username', username,
    'avatar_url', avatar_url,
    'created_at', created_at
  ) INTO v_user
  FROM wallet_users
  WHERE id = v_user_id;
  
  -- Return user info
  RETURN jsonb_build_object(
    'user', v_user,
    'message', 'Wallet authenticated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 