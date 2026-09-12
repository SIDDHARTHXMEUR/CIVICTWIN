-- CivicTwin Supabase Schema Migrations

-- 1. Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Civic Assets Table (Incidents / Infrastructure)
CREATE TABLE public.civic_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    domain TEXT NOT NULL, -- e.g., 'infrastructure', 'mobility', 'environment'
    type TEXT NOT NULL, -- e.g., 'anomaly', 'sensor', 'report'
    severity TEXT NOT NULL, -- e.g., 'critical', 'high', 'medium', 'low'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. Create x402 Payments Table
CREATE TABLE public.x402_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_algorand_address TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    resource_path TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    asset_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'settled', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create minimal Users Table (if not using Supabase Auth directly)
-- Note: If you want to use Supabase Auth, you can just use `auth.users`. 
-- We'll add a profile table that links to it just in case.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    role TEXT DEFAULT 'citizen', -- 'citizen', 'operator'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.civic_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x402_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Civic Assets: Anyone can read, only authenticated or service role can insert
CREATE POLICY "Civic assets are viewable by everyone" ON public.civic_assets FOR SELECT USING (true);
CREATE POLICY "Civic assets can be created by authenticated users" ON public.civic_assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- x402 Payments: Users can view their own payments, service role handles inserts
CREATE POLICY "Users can view their own payments" ON public.x402_payments FOR SELECT USING (payer_algorand_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR auth.role() = 'service_role');
CREATE POLICY "Service role can insert payments" ON public.x402_payments FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Anyone can insert payments client-side for hackathon" ON public.x402_payments FOR INSERT WITH CHECK (true); -- Relaxed for hackathon client-side flow

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Insert Mock Data for Civic Assets
INSERT INTO public.civic_assets (id, title, domain, type, severity, latitude, longitude, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Main St Water Main Break', 'infrastructure', 'anomaly', 'critical', 40.7128, -74.0060, 'Major rupture detected via acoustic sensors.'),
('22222222-2222-2222-2222-222222222222', 'AQI Spike - Downtown', 'environment', 'sensor', 'high', 40.7138, -74.0050, 'PM2.5 exceeded threshold.'),
('33333333-3333-3333-3333-333333333333', 'Traffic Light Sync Failure', 'mobility', 'report', 'medium', 40.7118, -74.0070, 'Multiple citizens reporting signal stuck on red.');
