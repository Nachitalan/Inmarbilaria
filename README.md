#  Sitio Web Inmobiliario — Guía de Configuración

## ¿Qué incluye este sitio?

-  **Página principal** con catálogo de propiedades filtrado por Colonias
-  **Página de detalle** con galería de fotos, video, mapa y botón de WhatsApp
-  **Panel de administración** para agregar, editar y eliminar propiedades (fácil de usar)
-  **Diseño moderno** en verde con tipografía elegante
-  **Botón flotante de WhatsApp** en todas las páginas

---

## Paso 1: Crear cuenta en Supabase (base de datos gratis)

1. Ve a **supabase.com** y crea una cuenta gratis
2. Haz clic en "New Project"
3. Ponle el nombre: `inmobiliaria-morelia`
4. Elige una contraseña segura (guárdala)
5. Región: `South America (São Paulo)` — la más cercana a México
6. Espera 2 minutos a que se cree el proyecto

### Copiar tus credenciales:
En tu proyecto de Supabase:
- Ve a **Settings → API**
- Copia el **Project URL** (se ve como `https://xxxxx.supabase.co`)
- Copia el **anon public key**

---

## Paso 2: Configurar la base de datos

1. En Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Copia todo el contenido del archivo `supabase-schema.sql` y pégalo
4. Haz clic en **Run** 
5. ¡Listo! Se crearán las tablas y datos de ejemplo

### Crear el bucket de imágenes:
1. En Supabase ve a **Storage**
2. Haz clic en **New Bucket**
3. Nombre: `property-images`
4. Activa **Public bucket** (para que las fotos sean visibles)
5. Clic en **Create bucket**

---

## Paso 3: Personalizar el sitio

Abre el archivo `js/config.js` y cambia estas líneas:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';  //  URL del Supabase
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';                 //  anon key

const WHATSAPP_NUMBER = '524433960807';  // Número de WhatsApp con código de país (en mi caso 52 de mexico)
const AGENT_NAME = 'Patricia González';  // Nombre de la asesora
```

---

## Paso 4: Crear cuenta de administrador

Para que la asesora pueda entrar al panel:

1. En Supabase ve a **Authentication → Users**
2. Haz clic en **Add user**
3. Ingresa el correo y contraseña de la asesora
4. Haz clic en **Create user**

El correo y contraseña serán lo que la asesora usa para entrar en `/admin/login.html`

---

## Paso 5: Subir a Netlify (hosting gratis)

### Opción A — Subir archivos directamente (más fácil):
1. Ve a **netlify.com** y crea una cuenta gratis
2. En el Dashboard, arrastra la carpeta del proyecto al área "Drop your site folder here"
3. ¡Listo! Netlify te dará una URL como `https://tu-sitio.netlify.app`

### Opción B — Conectar con GitHub (recomendado para actualizaciones):
1. Sube la carpeta a GitHub como repositorio
2. En Netlify: New site → Import from Git → GitHub
3. Selecciona tu repositorio
4. Haz clic en Deploy

### Agregar dominio personalizado (opcional):
En Netlify → Domain Management → Add custom domain
Por ejemplo: `propiedadespatricia.com` (se compra en Namecheap ~$10/año)

---

## Cómo usar el panel de administración

La asesora puede acceder en: `tusitio.netlify.app/admin/login.html`

### Agregar una propiedad:
1. Entra con su correo y contraseña
2. Haz clic en **➕ Agregar Propiedad**
3. Llena el formulario:
   - **Nombre**: Ej. "Casa en Jardines de Catedral"
   - **Colonia**: Ej. "Chapultepec"
   - **Precio**: Solo números, ej. 1500000
   - **Fotos**: Haz clic y selecciona las fotos (la primera es la portada)
   - **Video**: Pega el link de YouTube o Facebook
   - **Mapa**: Abre Google Maps, clic derecho en el lugar → "¿Qué hay aquí?" → copia los números de latitud y longitud
4. Haz clic en ** Guardar Propiedad**

### Editar o eliminar:
- En la lista de propiedades, usa los botones ** Editar** o **🗑 Eliminar**

---

## Estructura de archivos

```
inmobiliaria/
├── index.html          ← Página principal del sitio
├── propiedad.html      ← Detalle de cada propiedad
├── css/
│   └── main.css        ← Todos los estilos del sitio
├── js/
│   ├── config.js       ←  CONFIGURACIÓN (editar aquí)
│   ├── app.js          ← Lógica de la página principal
│   └── property.js     ← Lógica de detalle de propiedad
├── admin/
│   ├── login.html      ← Página de acceso para la asesora
│   └── panel.html      ← Panel de administración
├── supabase-schema.sql ← Esquema de base de datos
└── netlify.toml        ← Configuración de Netlify
```

---

## Costos (todo gratis)

| Servicio | Plan | Costo |
|----------|------|-------|
| Supabase | Free tier: 500MB DB, 1GB storage | $0/mes |
| Netlify  | Free tier: 100GB tráfico, deploys ilimitados | $0/mes |
| OpenStreetMap | Mapas libres | $0 siempre |

El único costo posible es un dominio personalizado (~$10/año), pero no es obligatorio.

---

## Soporte

Si tienes dudas, el panel de administración está diseñado para ser muy sencillo. Si algo no funciona, revisa que los valores en `js/config.js` estén correctos.
