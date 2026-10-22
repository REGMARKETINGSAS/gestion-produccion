-- ==========================================================
-- REG Marketing - Tallas de niño 4, 6, 8, 10, 12, 14, 16
-- Ejecutar UNA sola vez en Supabase:  SQL Editor > New query > Run
-- Agrega la columna donde se guardan las tallas de niño de
-- Pantaloneta, Pijama, Sudadera/Jogger, Chaqueta, Jeans y Top.
-- No modifica ni borra ninguna orden existente.
-- ==========================================================
ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS tallas_nino JSONB DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
