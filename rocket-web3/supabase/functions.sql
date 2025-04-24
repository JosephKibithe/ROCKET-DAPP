-- Functions for web3 wallet authentication

-- Function to register or update a wallet user
CREATE OR REPLACE FUNCTION register_wallet_user(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_jwt_token TEXT;
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

-- Function to verify a wallet signature
-- Note: This is a placeholder function - in a real implementation,
-- you would verify the signature cryptographically
CREATE OR REPLACE FUNCTION verify_wallet_signature(
  p_wallet_address TEXT,
  p_message TEXT,
  p_signature TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- In a real implementation, you would use cryptographic functions to verify
  -- that the signature was created by the private key corresponding to p_wallet_address
  -- and that it's a valid signature for p_message
  
  -- For now, we'll just return true for testing purposes
  -- WARNING: Do not use this in production!
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 