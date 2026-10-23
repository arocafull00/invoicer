CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    notes TEXT NOT NULL DEFAULT '',
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT appointments_end_after_start CHECK (end_at >= start_at)
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_at ON appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
