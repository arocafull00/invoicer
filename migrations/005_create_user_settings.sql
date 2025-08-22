-- Migration: 005_create_user_settings.sql
-- Description: Create user_settings table to store per-user configuration

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
	default_currency TEXT NOT NULL DEFAULT 'eur',
	date_format TEXT NOT NULL DEFAULT 'dd/mm/yyyy',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	CONSTRAINT user_settings_user_id_unique UNIQUE (user_id),
	CONSTRAINT user_settings_default_currency_check CHECK (default_currency IN ('eur','usd','gbp')),
	CONSTRAINT user_settings_date_format_check CHECK (date_format IN ('dd/mm/yyyy','mm/dd/yyyy','yyyy-mm-dd'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_settings_updated_at 
	BEFORE UPDATE ON user_settings 
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS
-- =====================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their settings" ON user_settings
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings" ON user_settings
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings" ON user_settings
	FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their settings" ON user_settings
	FOR DELETE USING (auth.uid() = user_id);


