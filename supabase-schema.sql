-- ============================================================
--  ESQUEMA DE BASE DE DATOS — INMOBILIARIA
--  Ejecuta esto en el SQL Editor de tu proyecto Supabase
--  supabase.com → Tu proyecto → SQL Editor → New query
-- ============================================================

-- 1. TABLA DE PROPIEDADES
CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  price         DECIMAL(14, 2) NOT NULL,
  colonia       TEXT NOT NULL,
  address       TEXT,
  bedrooms      INTEGER,
  bathrooms     INTEGER,
  area_m2       DECIMAL(10, 2),
  property_type TEXT NOT NULL DEFAULT 'casa'
                  CHECK (property_type IN ('casa','departamento','terreno','local','bodega')),
  status        TEXT NOT NULL DEFAULT 'disponible'
                  CHECK (status IN ('disponible','en_proceso','vendida')),
  has_credit        BOOLEAN DEFAULT false,
  has_legal_issues  BOOLEAN DEFAULT false,
  latitude      DECIMAL(10, 7),
  longitude     DECIMAL(10, 7),
  video_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE IMÁGENES DE PROPIEDADES
CREATE TABLE IF NOT EXISTS property_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  is_cover     BOOLEAN DEFAULT false,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_properties_colonia ON properties(colonia);
CREATE INDEX IF NOT EXISTS idx_properties_status  ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type    ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_images_property    ON property_images(property_id);

-- 4. PERMISOS DE LECTURA PÚBLICA (visitantes del sitio)
ALTER TABLE properties      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Todos pueden VER propiedades
CREATE POLICY "Public read properties"
  ON properties FOR SELECT TO anon USING (true);

CREATE POLICY "Public read images"
  ON property_images FOR SELECT TO anon USING (true);

-- Solo usuarios autenticados (la asesora) pueden MODIFICAR
CREATE POLICY "Auth full access properties"
  ON properties FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth full access images"
  ON property_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. BUCKET DE STORAGE PARA FOTOS
-- (Hacer esto desde Supabase Dashboard → Storage → New Bucket)
-- Nombre: property-images
-- Public: Sí (para que las fotos sean visibles en el sitio)

-- 6. DATOS DE EJEMPLO (OPCIONAL — puedes borrar esto si quieres empezar limpio)
INSERT INTO properties (title, description, price, colonia, address, bedrooms, bathrooms, area_m2, property_type, status, has_credit)
VALUES
  ('Casa en Jardines de Catedral', 'Hermosa casa en una de las colonias más tranquilas de Morelia. Cuenta con amplio jardín, cocina equipada y excelente ventilación natural.', 2800000, 'Jardines de Catedral', 'Calle Magnolia 45', 3, 2, 180, 'casa', 'disponible', true),
  ('Departamento en Chapultepec', 'Departamento moderno con excelente ubicación cerca de los principales centros comerciales. Ideal para parejas o personas solas.', 1450000, 'Chapultepec', 'Av. Camelinas 312 Int. 4B', 2, 1, 90, 'departamento', 'disponible', true),
  ('Terreno en Altozano', 'Terreno en zona residencial de alto valor con todos los servicios. Ideal para construir tu casa de ensueño.', 3500000, 'Altozano', 'Fracc. Altozano Lote 14', null, null, 350, 'terreno', 'disponible', false),
  ('Casa en Las Américas', 'Casa amplia ideal para familia grande. Cuenta con cuarto de servicio, garage para 2 autos y patio trasero.', 1900000, 'Las Américas', 'Calle Independencia 87', 4, 3, 220, 'casa', 'en_proceso', true)
ON CONFLICT DO NOTHING;
