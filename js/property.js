// ============================================================
//  PROPERTY.JS — Detalle de propiedad
// ============================================================

const params = new URLSearchParams(location.search);
const propertyId = params.get('id');
let images = [];
let currentImg = 0;
let map = null;

// Set WhatsApp button
document.getElementById('fabWhatsapp').href = getWhatsAppURL();

async function loadProperty() {
  if (!propertyId) {
    showError('No se especificó ninguna propiedad.');
    return;
  }

  try {
    const { data: p, error } = await sb
      .from('properties')
      .select(`*, property_images(url, is_cover, order_index)`)
      .eq('id', propertyId)
      .single();

    if (error || !p) throw error || new Error('Not found');
    renderProperty(p);
  } catch (err) {
    console.error(err);
    showError('No se pudo cargar la propiedad.');
  }
}

function renderProperty(p) {
  document.title = `${p.title} — Asesora Inmobiliaria Morelia`;

  // Sort images
  images = (p.property_images || []).sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.order_index - b.order_index;
  });

  // Build gallery HTML
  const hero = document.getElementById('detailHero');
  if (images.length) {
    hero.innerHTML = `
      <div class="gallery-main" id="galleryMain">
        <img id="galleryImg" src="${images[0].url}" alt="${p.title}" />
        ${images.length > 1 ? `
          <button class="gallery-arrow left" onclick="prevImg()">‹</button>
          <button class="gallery-arrow right" onclick="nextImg()">›</button>
          <div class="gallery-counter"><span id="imgCurrent">1</span>/${images.length}</div>
        ` : ''}
      </div>
      ${images.length > 1 ? `
        <div class="gallery-thumbs" id="galleryThumbs">
          ${images.map((img, i) => `
            <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="goToImg(${i})">
              <img src="${img.url}" alt="Foto ${i+1}" loading="lazy" />
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } else {
    hero.innerHTML = `
      <div class="gallery-main">
        <div class="gallery-main-placeholder">${typeEmoji(p.property_type)}</div>
      </div>
    `;
  }

  // Status & colonia
  const status = statusLabel(p.status);
  document.getElementById('dStatus').textContent = status.text;
  document.getElementById('dStatus').className = `card-status ${status.class}`;
  document.getElementById('dColonia').textContent = p.colonia || '';
  document.getElementById('dColoniaTag').textContent = p.colonia || '';
  document.getElementById('dTitle').textContent = p.title;

  if (p.address) {
    document.getElementById('dAddress').innerHTML = `📍 ${p.address}, ${p.colonia}, Morelia, Mich.`;
  }

  // Features
  const feats = [];
  if (p.bedrooms)  feats.push({ icon: '🛏', value: p.bedrooms, label: 'Recámaras' });
  if (p.bathrooms) feats.push({ icon: '🚿', value: p.bathrooms, label: 'Baños' });
  if (p.area_m2)   feats.push({ icon: '📐', value: `${p.area_m2} m²`, label: 'Superficie' });
  feats.push({ icon: '🏷️', value: propertyTypeLabel(p.property_type).replace(/^.*? /, ''), label: 'Tipo' });

  document.getElementById('dFeatures').innerHTML = feats.map(f => `
    <div class="detail-feature">
      <div class="detail-feature-icon">${f.icon}</div>
      <div class="detail-feature-value">${f.value}</div>
      <div class="detail-feature-label">${f.label}</div>
    </div>
  `).join('');

  // Badges
  const badges = [];
  if (p.has_credit) badges.push(`<span class="detail-badge badge-credit">✅ Acepta crédito hipotecario</span>`);
  if (p.has_legal_issues) badges.push(`<span class="detail-badge badge-legal">⚠️ Consultar situación jurídica</span>`);
  else badges.push(`<span class="detail-badge badge-nolegal">✅ Sin problemas jurídicos</span>`);
  document.getElementById('dBadges').innerHTML = badges.join('');

  // Description
  if (p.description) {
    document.getElementById('dDescription').textContent = p.description;
  } else {
    document.getElementById('dDescSection').style.display = 'none';
  }

  // Video
  if (p.video_url) {
    const videoSec = document.getElementById('dVideoSection');
    videoSec.style.display = 'block';
    document.getElementById('dVideo').src = convertVideoUrl(p.video_url);
  }

  // Map
  if (p.latitude && p.longitude) {
    document.getElementById('dMapSection').style.display = 'block';
    setTimeout(() => initMap(p.latitude, p.longitude, p.title), 300);
  }

  // Sidebar
  document.getElementById('sPrice').textContent = formatPrice(p.price);
  document.getElementById('sPriceNote').textContent = p.has_credit ? '✅ Acepta crédito' : 'Solo contado';
  
  const waURL = getWhatsAppURL('', p.title);
  document.getElementById('sWhatsapp').href = waURL;
  document.getElementById('fabWhatsapp').href = waURL;

  const infoItems = [
    { label: 'Colonia', value: p.colonia },
    { label: 'Tipo', value: propertyTypeLabel(p.property_type) },
    { label: 'Estado', value: statusLabel(p.status).text },
    p.bedrooms  ? { label: 'Recámaras', value: p.bedrooms } : null,
    p.bathrooms ? { label: 'Baños', value: p.bathrooms } : null,
    p.area_m2   ? { label: 'Superficie', value: `${p.area_m2} m²` } : null,
  ].filter(Boolean);

  document.getElementById('sInfoList').innerHTML = infoItems.map(item => `
    <div class="sidebar-info-item">
      <span class="sidebar-info-label">${item.label}</span>
      <span class="sidebar-info-value">${item.value}</span>
    </div>
  `).join('');

  // Show body
  document.getElementById('detailLoading').style.display = 'none';
  document.getElementById('detailBody').style.display = 'block';
}

// ---- Gallery controls ----
function goToImg(index) {
  currentImg = index;
  const img = document.getElementById('galleryImg');
  const counter = document.getElementById('imgCurrent');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  
  if (img) {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[currentImg].url;
      img.style.opacity = '1';
    }, 200);
  }
  if (counter) counter.textContent = currentImg + 1;
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentImg));
}
function prevImg() { goToImg((currentImg - 1 + images.length) % images.length); }
function nextImg() { goToImg((currentImg + 1) % images.length); }

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') prevImg();
  if (e.key === 'ArrowRight') nextImg();
});

// ---- Map with Leaflet ----
function initMap(lat, lng, title) {
  if (map) { map.remove(); map = null; }
  map = L.map('propertyMap').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const greenIcon = L.divIcon({
    html: `<div style="background:#1B4332;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #C9A84C;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
            <div style="transform:rotate(45deg);color:white;font-size:14px;">🏠</div>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  L.marker([lat, lng], { icon: greenIcon })
    .addTo(map)
    .bindPopup(`<strong>${title}</strong>`)
    .openPopup();
}

// ---- Convert video URL to embed ----
function convertVideoUrl(url) {
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Facebook (basic)
  if (url.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }
  return url;
}

function typeEmoji(type) {
  const e = { casa: '🏠', departamento: '🏢', terreno: '🌿', local: '🏪', bodega: '🏭' };
  return e[type] || '🏡';
}

function showError(msg) {
  document.getElementById('detailLoading').innerHTML = `
    <div style="text-align:center;color:var(--gold-light);">
      <div style="font-size:3rem;margin-bottom:16px;">😕</div>
      <p>${msg}</p>
      <a href="index.html" style="color:var(--gold-light);text-decoration:underline;margin-top:12px;display:inline-block;">← Regresar al inicio</a>
    </div>
  `;
}

loadProperty();
