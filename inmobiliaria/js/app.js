// ============================================================
//  APP.JS — Lógica del sitio público
// ============================================================

let allProperties = [];
let activeColonia = 'todas';

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- WhatsApp links ----
function setWhatsappLinks() {
  const url = getWhatsAppURL();
  document.getElementById('heroWhatsapp').href = url;
  document.getElementById('agentWhatsapp').href = url;
  document.getElementById('fabWhatsapp').href = url;
}

// ---- Animación de números en hero ----
function animateCount(el, target, duration = 1200) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start + (target > 10 ? '+' : '');
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ---- Cargar propiedades desde Supabase ----
async function loadProperties() {
  try {
    const { data, error } = await sb
      .from('properties')
      .select(`*, property_images(url, is_cover, order_index)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    allProperties = data || [];
    initFilters(allProperties);
    renderProperties(allProperties);
    updateStats(allProperties);
  } catch (err) {
    console.error('Error cargando propiedades:', err);
    renderDemoProperties();
  }
}

// ---- Datos demo si Supabase no está configurado ----
function renderDemoProperties() {
  allProperties = [
    {
      id: '1', title: 'Casa en Jardines de Catedral', colonia: 'Jardines de Catedral',
      property_type: 'casa', status: 'disponible', price: 2800000,
      bedrooms: 3, bathrooms: 2, area_m2: 180, has_credit: true,
      address: 'Calle Magnolia 45', description: 'Hermosa casa en una de las colonias más tranquilas de Morelia.',
      latitude: 19.706, longitude: -101.195, property_images: []
    },
    {
      id: '2', title: 'Departamento en Chapultepec', colonia: 'Chapultepec',
      property_type: 'departamento', status: 'disponible', price: 1450000,
      bedrooms: 2, bathrooms: 1, area_m2: 90, has_credit: true,
      address: 'Av. Camelinas 312', description: 'Departamento moderno con excelente ubicación.',
      latitude: 19.700, longitude: -101.180, property_images: []
    },
    {
      id: '3', title: 'Terreno en Altozano', colonia: 'Altozano',
      property_type: 'terreno', status: 'disponible', price: 3500000,
      bedrooms: null, bathrooms: null, area_m2: 350, has_credit: false,
      address: 'Fracc. Altozano lote 14', description: 'Terreno en zona residencial de alto valor.',
      latitude: 19.690, longitude: -101.170, property_images: []
    },
    {
      id: '4', title: 'Casa en Las Américas', colonia: 'Las Américas',
      property_type: 'casa', status: 'en_proceso', price: 1900000,
      bedrooms: 4, bathrooms: 3, area_m2: 220, has_credit: true,
      address: 'Calle Independencia 87', description: 'Casa amplia ideal para familia grande.',
      latitude: 19.715, longitude: -101.190, property_images: []
    },
    {
      id: '5', title: 'Local Comercial en Centro', colonia: 'Centro Histórico',
      property_type: 'local', status: 'disponible', price: 2100000,
      bedrooms: null, bathrooms: 1, area_m2: 120, has_credit: false,
      address: 'Portal Hidalgo 22', description: 'Local en pleno centro histórico con alto flujo peatonal.',
      latitude: 19.702, longitude: -101.192, property_images: []
    },
    {
      id: '6', title: 'Casa en Torrecillas', colonia: 'Torrecillas',
      property_type: 'casa', status: 'disponible', price: 2250000,
      bedrooms: 3, bathrooms: 2, area_m2: 160, has_credit: true,
      address: 'Priv. Los Pinos 8', description: 'Casa en privada con excelente seguridad y acabados modernos.',
      latitude: 19.698, longitude: -101.200, property_images: []
    },
  ];

  // Banner de demo
  const grid = document.getElementById('propertiesGrid');
  grid.insertAdjacentHTML('beforebegin', `
    <div style="background:var(--gold-light);border-radius:var(--radius);padding:14px 20px;margin-bottom:16px;font-size:0.85rem;color:var(--green-deep);display:flex;align-items:center;gap:10px;">
      <span>⚙️</span>
      <strong>Modo Demo</strong> — Conecta Supabase en <code>js/config.js</code> para usar propiedades reales
    </div>
  `);

  initFilters(allProperties);
  renderProperties(allProperties);
  updateStats(allProperties);
}

// ---- Inicializar filtros ----
function initFilters(properties) {
  const colonias = [...new Set(properties.map(p => p.colonia).filter(Boolean))].sort();
  const container = document.getElementById('filtrosColonias');
  
  // Mantener botón "Todas"
  colonias.forEach(colonia => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.dataset.colonia = colonia;
    btn.textContent = colonia;
    btn.addEventListener('click', () => setColoniaFilter(colonia));
    container.appendChild(btn);
  });

  // Evento botón "Todas"
  container.querySelector('[data-colonia="todas"]')
    .addEventListener('click', () => setColoniaFilter('todas'));

  // Filtros de select
  ['filterTipo', 'filterEstado', 'filterCredito'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  document.getElementById('filterSearch').addEventListener('input', applyFilters);
}

function setColoniaFilter(colonia) {
  activeColonia = colonia;
  document.querySelectorAll('[data-colonia]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.colonia === colonia);
  });
  applyFilters();
}

function applyFilters() {
  const tipo   = document.getElementById('filterTipo').value;
  const estado = document.getElementById('filterEstado').value;
  const credito = document.getElementById('filterCredito').value;
  const search  = document.getElementById('filterSearch').value.toLowerCase();

  const filtered = allProperties.filter(p => {
    if (activeColonia !== 'todas' && p.colonia !== activeColonia) return false;
    if (tipo   && p.property_type !== tipo)   return false;
    if (estado && p.status !== estado)         return false;
    if (credito === 'true' && !p.has_credit)   return false;
    if (search && !p.title.toLowerCase().includes(search) && 
        !(p.address || '').toLowerCase().includes(search)) return false;
    return true;
  });

  renderProperties(filtered);
}

// ---- Render de propiedades ----
function renderProperties(properties) {
  const grid = document.getElementById('propertiesGrid');
  const count = document.getElementById('propertiesCount');
  
  count.innerHTML = `Mostrando <span>${properties.length}</span> propiedad${properties.length !== 1 ? 'es' : ''}`;

  if (!properties.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Sin resultados</div>
        <p>Prueba con otros filtros o <a href="${getWhatsAppURL()}" style="color:var(--green-mid);">contáctame</a> para buscar algo especial.</p>
      </div>`;
    return;
  }

  grid.innerHTML = properties.map(p => createPropertyCard(p)).join('');
  
  // Evento click en cada tarjeta
  grid.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `propiedad.html?id=${card.dataset.id}`;
    });
  });
}

function createPropertyCard(p) {
  const coverImg = p.property_images?.find(i => i.is_cover) || p.property_images?.[0];
  const status = statusLabel(p.status);

  const imgHtml = coverImg
    ? `<img class="card-image" src="${coverImg.url}" alt="${p.title}" loading="lazy" />`
    : `<div class="card-image-placeholder">${typeEmoji(p.property_type)}</div>`;

  const features = [];
  if (p.bedrooms)   features.push(`<div class="card-feature"><span class="card-feature-icon">🛏</span> ${p.bedrooms} rec.</div>`);
  if (p.bathrooms)  features.push(`<div class="card-feature"><span class="card-feature-icon">🚿</span> ${p.bathrooms} baño${p.bathrooms > 1 ? 's' : ''}</div>`);
  if (p.area_m2)    features.push(`<div class="card-feature"><span class="card-feature-icon">📐</span> ${p.area_m2} m²</div>`);

  return `
    <div class="property-card" data-id="${p.id}">
      <div class="card-image-wrapper">
        ${imgHtml}
        <span class="card-status ${status.class}">${status.text}</span>
        <span class="card-colonia-badge">📍 ${p.colonia}</span>
      </div>
      <div class="card-body">
        <div class="card-type">${propertyTypeLabel(p.property_type)}</div>
        <h3 class="card-title">${p.title}</h3>
        ${p.address ? `<div class="card-address">📍 ${p.address}</div>` : ''}
        ${features.length ? `<div class="card-features">${features.join('')}</div>` : ''}
        <div class="card-footer">
          <div>
            <div class="card-price">${formatPrice(p.price)}</div>
            ${p.has_credit ? `<div class="card-credit-badge">✅ Acepta crédito</div>` : ''}
          </div>
          <span class="card-btn">Ver más →</span>
        </div>
      </div>
    </div>`;
}

function typeEmoji(type) {
  const e = { casa: '🏠', departamento: '🏢', terreno: '🌿', local: '🏪', bodega: '🏭' };
  return e[type] || '🏡';
}

// ---- Stats del hero ----
function updateStats(properties) {
  const colonias = new Set(properties.map(p => p.colonia).filter(Boolean));
  
  // Observar cuando el hero sea visible para animar
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCount(document.getElementById('statProperties'), properties.length);
      animateCount(document.getElementById('statColonias'), colonias.size);
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  
  const stats = document.getElementById('heroStats');
  if (stats) observer.observe(stats);
}

// ---- Nombres del agente ----
function setAgentName() {
  ['agentNameLogo', 'agentNameSection', 'footerName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = AGENT_NAME;
  });
  const titleEl = document.getElementById('agentTitleSection');
  if (titleEl) titleEl.textContent = `${AGENT_TITLE} • Morelia, Mich.`;
}

// ---- Hamburger (móvil) ----
document.getElementById('hamburger')?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  if (links) {
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'fixed';
    links.style.top = '72px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'var(--green-deep)';
    links.style.padding = '24px 24px';
    links.style.gap = '20px';
    links.style.zIndex = '99';
  }
});

// ---- INIT ----
setAgentName();
setWhatsappLinks();
loadProperties();
