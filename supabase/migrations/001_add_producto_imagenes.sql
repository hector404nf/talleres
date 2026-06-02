-- Agregar columna imagenes (array JSON) a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagenes JSONB DEFAULT '[]'::jsonb;

-- Crear bucket de storage para imagenes de productos si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('producto-imagenes', 'producto-imagenes', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Policy para permitir uploads autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imagenes de productos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir imagenes de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'producto-imagenes');

-- Policy para permitir lectura publica
DROP POLICY IF EXISTS "Imagenes de productos son publicas" ON storage.objects;
CREATE POLICY "Imagenes de productos son publicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'producto-imagenes');

-- Policy para permitir delete autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar imagenes de productos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden eliminar imagenes de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'producto-imagenes');
