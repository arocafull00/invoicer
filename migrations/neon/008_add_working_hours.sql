ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS working_hours JSONB;

ALTER TABLE user_settings
  ADD CONSTRAINT user_settings_working_hours_object
  CHECK (working_hours IS NULL OR jsonb_typeof(working_hours) = 'object');
