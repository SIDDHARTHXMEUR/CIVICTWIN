-- ============================================================
-- CivicTwin V2 — Supabase Migration
-- Phase 2: Full Incident Lifecycle + Ward + Sensor + Dispatch
-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis; -- Enable in Dashboard: Database → Extensions → PostGIS

-- Fix for Supabase lint warning: RLS Disabled in Public for spatial_ref_sys
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spatial_ref_sys is viewable by everyone" ON public.spatial_ref_sys FOR SELECT USING (true);

-- ============================================================
-- WARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wards (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    ward_number  INTEGER,
    city         TEXT DEFAULT 'Jaipur',
    boundary     JSONB,           -- GeoJSON polygon for the ward boundary
    population   INTEGER,
    area_sqkm    NUMERIC(8,3),
    risk_score   NUMERIC(5,2) DEFAULT 0,  -- 0-100, recomputed periodically
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCIDENTS (full lifecycle)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incidents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id             UUID REFERENCES public.wards(id),
    title               TEXT NOT NULL,
    description         TEXT,
    category            TEXT NOT NULL,   -- water|mobility|environment|infrastructure|power
    subcategory         TEXT,
    severity_score      NUMERIC(5,2) DEFAULT 0,   -- 0-100 explainable risk score
    severity_band       TEXT DEFAULT 'low',        -- low|moderate|high|very_high|critical
    lifecycle_state     TEXT NOT NULL DEFAULT 'reported',
    -- reported|ingested|classified|clustered|triaged|confirmed|assigned|dispatched|in_progress|resolved|verified|closed
    report_count        INTEGER DEFAULT 1,
    citizen_count       INTEGER DEFAULT 1,
    affected_population INTEGER DEFAULT 0,
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    ai_category         TEXT,
    ai_confidence       NUMERIC(4,2),
    root_cause          TEXT,
    recommended_action  TEXT,
    ai_summary          TEXT,
    impact_pct          INTEGER DEFAULT 0,
    is_demo_data        BOOLEAN DEFAULT true,  -- label synthetic data clearly
    source              TEXT DEFAULT 'citizen_report', -- citizen_report|sensor_anomaly|ai_prediction|operator
    classified_at       TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    dispatched_at       TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    verified_at         TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCIDENT REPORTS (citizen submissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incident_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id         UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    citizen_device_hash TEXT,
    raw_text            TEXT,
    photo_urls          JSONB DEFAULT '[]',
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    ai_category         TEXT,
    ai_summary          TEXT,
    ai_severity_hint    INTEGER,          -- 1-5
    ai_visible_evidence JSONB DEFAULT '[]',
    processing_status   TEXT DEFAULT 'pending',  -- pending|processed|failed
    language            TEXT DEFAULT 'en',
    submitted_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SENSORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sensors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id         TEXT UNIQUE NOT NULL,  -- e.g. JP-W01
    name            TEXT NOT NULL,
    sensor_type     TEXT NOT NULL,
    -- water_pressure|water_flow|air_quality|traffic|electricity|temperature|flood_level|noise|streetlight|structural
    ward_id         UUID REFERENCES public.wards(id),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    status          TEXT DEFAULT 'active',   -- active|offline|maintenance|anomaly
    last_reading_at TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    is_demo_data    BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SENSOR READINGS (time-series telemetry)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id   UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    value       NUMERIC(12,4) NOT NULL,
    unit        TEXT NOT NULL,
    quality     TEXT DEFAULT 'good',        -- good|degraded|missing
    is_anomaly  BOOLEAN DEFAULT false,
    z_score     NUMERIC(8,4),               -- for anomaly detection
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time
    ON public.sensor_readings(sensor_id, recorded_at DESC);

-- ============================================================
-- ANOMALIES (detected from sensor readings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.anomalies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id       UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    reading_id      UUID REFERENCES public.sensor_readings(id),
    incident_id     UUID REFERENCES public.incidents(id),
    severity        TEXT NOT NULL,   -- low|moderate|high|critical
    z_score         NUMERIC(8,4),
    expected_value  NUMERIC(12,4),
    actual_value    NUMERIC(12,4),
    description     TEXT,
    is_demo_data    BOOLEAN DEFAULT true,
    detected_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESPONSE TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.response_teams (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    specialty     TEXT NOT NULL,  -- water|electrical|roads|environmental|general
    status        TEXT DEFAULT 'available',  -- available|dispatched|busy|offline
    latitude      DOUBLE PRECISION,
    longitude     DOUBLE PRECISION,
    members_count INTEGER DEFAULT 4,
    equipment     JSONB DEFAULT '[]',
    is_demo_data  BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISPATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dispatches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id     UUID NOT NULL REFERENCES public.incidents(id),
    team_id         UUID NOT NULL REFERENCES public.response_teams(id),
    approved_by     TEXT,              -- operator name/id
    status          TEXT DEFAULT 'pending',
    -- pending|approved|en_route|arrived|working|completed|cancelled
    eta_minutes     INTEGER,
    dispatched_at   TIMESTAMPTZ,
    arrived_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PREDICTIONS (AI predictive failure)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.predictions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id           UUID REFERENCES public.incidents(id),
    sensor_id             UUID REFERENCES public.sensors(id),
    failure_probability   NUMERIC(5,2) NOT NULL,  -- 0-100
    horizon_hours         INTEGER NOT NULL,
    risk_level            TEXT NOT NULL,           -- LOW|MODERATE|HIGH|CRITICAL
    contributing_factors  JSONB DEFAULT '[]',
    affected_population   INTEGER DEFAULT 0,
    recommended_window    TEXT,
    is_demo_data          BOOLEAN DEFAULT true,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (immutable action trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type  TEXT NOT NULL,   -- incident|dispatch|sensor|report
    entity_id    UUID,
    action       TEXT NOT NULL,   -- created|state_changed|dispatched|resolved|verified
    old_state    TEXT,
    new_state    TEXT,
    actor        TEXT,            -- user id, system, or 'ai_engine'
    metadata     JSONB DEFAULT '{}',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.wards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_teams     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log          ENABLE ROW LEVEL SECURITY;

-- Public read for operational transparency
CREATE POLICY "public_read_wards"           ON public.wards           FOR SELECT USING (true);
CREATE POLICY "public_read_incidents"       ON public.incidents        FOR SELECT USING (true);
CREATE POLICY "public_read_sensors"         ON public.sensors          FOR SELECT USING (true);
CREATE POLICY "public_read_sensor_readings" ON public.sensor_readings  FOR SELECT USING (true);
CREATE POLICY "public_read_anomalies"       ON public.anomalies        FOR SELECT USING (true);
CREATE POLICY "public_read_teams"           ON public.response_teams   FOR SELECT USING (true);
CREATE POLICY "public_read_dispatches"      ON public.dispatches       FOR SELECT USING (true);
CREATE POLICY "public_read_predictions"     ON public.predictions      FOR SELECT USING (true);

-- Citizens can submit reports
CREATE POLICY "citizen_insert_reports" ON public.incident_reports
    FOR INSERT WITH CHECK (true);

-- Audit log open insert for hackathon demo
CREATE POLICY "insert_audit_log" ON public.audit_log FOR INSERT WITH CHECK (true);

-- Service role can write everything (used by Edge Functions)
CREATE POLICY "service_insert_incidents"    ON public.incidents       FOR INSERT WITH CHECK (true);
CREATE POLICY "service_update_incidents"    ON public.incidents       FOR UPDATE USING (true);
CREATE POLICY "service_insert_readings"     ON public.sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "service_insert_anomalies"    ON public.anomalies       FOR INSERT WITH CHECK (true);
CREATE POLICY "service_update_dispatches"   ON public.dispatches      FOR UPDATE USING (true);
CREATE POLICY "service_insert_dispatches"   ON public.dispatches      FOR INSERT WITH CHECK (true);
CREATE POLICY "service_insert_predictions"  ON public.predictions     FOR INSERT WITH CHECK (true);

-- ============================================================
-- ENABLE REALTIME on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatches;

-- ============================================================
-- SEED DATA — Jaipur Wards (5 major wards)
-- Clearly labeled as DEMO DATA
-- ============================================================
INSERT INTO public.wards (id, name, ward_number, population, area_sqkm, risk_score) VALUES
    ('aa000001-0000-0000-0000-000000000001', 'Mansarovar', 1, 285000, 24.8, 72),
    ('aa000001-0000-0000-0000-000000000002', 'Civil Lines', 2, 125000, 9.2, 45),
    ('aa000001-0000-0000-0000-000000000003', 'Walled City', 3, 320000, 7.6, 88),
    ('aa000001-0000-0000-0000-000000000004', 'Malviya Nagar', 4, 198000, 18.4, 61),
    ('aa000001-0000-0000-0000-000000000005', 'Vaishali Nagar', 5, 165000, 14.1, 53)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Sensors (Jaipur nodes, DEMO DATA)
-- ============================================================
INSERT INTO public.sensors (id, node_id, name, sensor_type, ward_id, latitude, longitude, status, is_demo_data) VALUES
    ('bb000001-0000-0000-0000-000000000001', 'JP-W01', 'Water Main Grid 7', 'water_pressure', 'aa000001-0000-0000-0000-000000000001', 26.9124, 75.7873, 'anomaly', true),
    ('bb000001-0000-0000-0000-000000000002', 'JP-T02', 'MI Road Traffic Counter', 'traffic', 'aa000001-0000-0000-0000-000000000002', 26.9197, 75.7857, 'active', true),
    ('bb000001-0000-0000-0000-000000000003', 'JP-E03', 'AQI Sensor West', 'air_quality', 'aa000001-0000-0000-0000-000000000001', 26.8924, 75.7573, 'active', true),
    ('bb000001-0000-0000-0000-000000000004', 'JP-T04', 'Ajmeri Gate Junction', 'traffic', 'aa000001-0000-0000-0000-000000000003', 26.9250, 75.8191, 'active', true),
    ('bb000001-0000-0000-0000-000000000005', 'JP-W05', 'Mansarovar Water Node', 'water_flow', 'aa000001-0000-0000-0000-000000000001', 26.8600, 75.7750, 'active', true),
    ('bb000001-0000-0000-0000-000000000006', 'JP-E06', 'Vaishali Nagar AQI', 'air_quality', 'aa000001-0000-0000-0000-000000000005', 26.9100, 75.7400, 'active', true),
    ('bb000001-0000-0000-0000-000000000007', 'JP-T07', 'Sindhi Camp Transit', 'traffic', 'aa000001-0000-0000-0000-000000000002', 26.9234, 75.8025, 'active', true)
ON CONFLICT (node_id) DO NOTHING;

-- ============================================================
-- SEED DATA — Incidents (from existing civic_assets, DEMO DATA)
-- ============================================================
INSERT INTO public.incidents (id, ward_id, title, category, severity_score, severity_band, lifecycle_state, latitude, longitude, root_cause, recommended_action, report_count, affected_population, is_demo_data, source) VALUES
    ('cc000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'Water Main Pipe Fracture — Mansarovar Grid 7', 'infrastructure', 92, 'critical', 'confirmed', 26.9124, 75.7873, 'Acoustic sensor drop indicates high-pressure pipe fracture at Grid 7', 'Isolate Valve V-14 and reroute via Secondary Grid 3B', 17, 1840, true, 'sensor_anomaly'),
    ('cc000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000002', 'MI Road Traffic Congestion & Signal Desync', 'mobility', 84, 'very_high', 'dispatched', 26.9197, 75.7857, 'Arterial volume surge with automated signal timer desynchronization', 'Override junction JP-T02 to green-wave & notify transit control', 9, 4200, true, 'citizen_report'),
    ('cc000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000003', 'Ajmeri Gate Power Substation Thermal Overload', 'infrastructure', 75, 'high', 'triaged', 26.9250, 75.8191, 'Peak load spike exceeding transformer rated thermal capacity by 14%', 'Shed non-essential municipal load and dispatch electrical inspection', 4, 980, true, 'sensor_anomaly')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Response Teams (DEMO DATA)
-- ============================================================
INSERT INTO public.response_teams (id, name, specialty, status, latitude, longitude, members_count, is_demo_data) VALUES
    ('dd000001-0000-0000-0000-000000000001', 'Jal Vibhag Crew Alpha', 'water', 'available', 26.9080, 75.7820, 5, true),
    ('dd000001-0000-0000-0000-000000000002', 'Traffic Control Unit 3', 'mobility', 'dispatched', 26.9150, 75.7900, 3, true),
    ('dd000001-0000-0000-0000-000000000003', 'JVVNL Electrical Squad B', 'electrical', 'available', 26.9300, 75.8100, 4, true),
    ('dd000001-0000-0000-0000-000000000004', 'Municipal Roads Team 7', 'roads', 'available', 26.8950, 75.8000, 6, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- UPDATED FUNCTION: auto-update updated_at on incidents
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incidents_updated_at ON public.incidents;
CREATE TRIGGER incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS dispatches_updated_at ON public.dispatches;
CREATE TRIGGER dispatches_updated_at
    BEFORE UPDATE ON public.dispatches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
