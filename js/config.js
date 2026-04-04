// ============================================================
//  CONFIGURACIÓN DE SUPABASE
//  Reemplaza estos valores con los de tu proyecto en supabase.com
// ============================================================
const SUPABASE_URL = 'https://txqxgrafbrdgbtkfpsuh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cXhncmFmYnJkZ2J0a2Zwc3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODIyNjcsImV4cCI6MjA5MDg1ODI2N30.SfqihtHcT6Kkbvv-jT-UYyGIWta5eTP2vWDTw7GOt8YE';

// WhatsApp de la asesora (con código de país)
const WHATSAPP_NUMBER = '524433960807'; // Numero de la asesora 
const WHATSAPP_MESSAGE = '¡Hola! Vi una propiedad en tu página y me gustaría más información';

// Nombre de la asesora
const AGENT_NAME = 'Marcela Silva';
const AGENT_TITLE = 'Asesora Inmobiliaria Certificada';

// ============================================================
//  INICIALIZACIÓN DE SUPABASE
// ============================================================
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: URL de WhatsApp
function getWhatsAppURL(message = WHATSAPP_MESSAGE, propertyTitle = '') {
  const msg = propertyTitle
    ? `¡Hola! Vi la propiedad *"${propertyTitle}"* en tu página y me gustaría más información 🏡`
    : message;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// Helper: Formatear precio en pesos mexicanos
function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Helper: Tipo de propiedad legible
function propertyTypeLabel(type) {
  const labels = {
    casa: '🏠 Casa',
    departamento: '🏢 Departamento',
    terreno: '🌿 Terreno',
    local: '🏪 Local Comercial',
    bodega: '🏭 Bodega'
  };
  return labels[type] || type;
}

// Helper: Estado de propiedad
function statusLabel(status) {
  const labels = {
    disponible: { text: 'Disponible', class: 'status-available' },
    en_proceso: { text: 'En Proceso', class: 'status-process' },
    vendida: { text: 'Vendida', class: 'status-sold' }
  };
  return labels[status] || { text: status, class: '' };
}
