// ESGAS Product Catalog & Shopping Cart Manager
// Integración de búsqueda de productos y carrito simulado

class ESGASCatalog {
  constructor() {
    this.catalog = null;
    this.cart = JSON.parse(localStorage.getItem('esgas_cart') || '[]');
    this.init();
  }

  async init() {
    try {
      const response = await fetch('./catalog.json');
      this.catalog = await response.json();
      console.log('[ESGAS] Catálogo cargado:', this.catalog.products.length, 'productos');
    } catch (err) {
      console.warn('[ESGAS] Catálogo no disponible (modo offline):', err.message);
      this.catalog = { products: [], status: 'offline' };
    }
  }

  // Buscar producto por SKU, referencia o nombre
  searchProduct(query) {
    if (!this.catalog || !this.catalog.products) return null;

    const q = query.toLowerCase().trim();
    return this.catalog.products.find(p =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.series.toLowerCase().includes(q)
    );
  }

  // Obtener info formateada de producto
  getProductInfo(product) {
    if (!product) return null;

    return {
      sku: product.sku,
      name: product.name,
      price: `€${product.price.toFixed(2)}`,
      stock: product.stock,
      inStock: product.stock > 0,
      dimensions: `${product.dimensions.bore}×${product.dimensions.od}×${product.dimensions.width} mm`,
      prestashopUrl: product.prestashopUrl,
      type: product.type
    };
  }

  // Agregar al carrito
  addToCart(product) {
    if (!product) return false;

    const existing = this.cart.find(item => item.sku === product.sku);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: 1,
        prestashopUrl: product.prestashopUrl
      });
    }

    this.saveCart();
    return true;
  }

  // Guardar carrito en localStorage
  saveCart() {
    localStorage.setItem('esgas_cart', JSON.stringify(this.cart));
  }

  // Obtener carrito
  getCart() {
    return this.cart;
  }

  // Total del carrito
  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Limpiar carrito
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // Generar resumen del carrito
  getCartSummary() {
    if (this.cart.length === 0) return 'Tu carrito está vacío.';

    const items = this.cart
      .map(item => `${item.name} (${item.quantity}x) - €${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const total = `\nTotal: €${this.getCartTotal().toFixed(2)}`;

    return items + total;
  }
}

// Inicializar catálogo global
const esgas = new ESGASCatalog();

// Helper para el chatbot: inyectar búsqueda en respuesta
function injectProductSearch(message) {
  // Detectar referencias comunes (ej. "NTN 6205", "6205-2RS", etc.)
  const refPattern = /\b([A-Z]{2,6}[\s\-]?\d{3,4}(?:[\s\-][A-Z0-9]+)?)\b/gi;
  const matches = message.match(refPattern);

  if (matches) {
    const uniqueRefs = [...new Set(matches)];
    uniqueRefs.forEach(ref => {
      const product = esgas.searchProduct(ref);
      if (product) {
        const info = esgas.getProductInfo(product);
        // Reemplazar referencia con link
        const link = `<a href="${info.prestashopUrl}" target="_blank" class="product-link">${ref}</a>`;
        message = message.replace(
          new RegExp(`\\b${ref}\\b`, 'gi'),
          link
        );
      }
    });
  }

  return message;
}

// Crear botones de acción para productos
function createProductButtons(productSku) {
  const product = esgas.catalog.products.find(p => p.sku === productSku);
  if (!product) return '';

  const info = esgas.getProductInfo(product);

  return `
    <div class="product-actions">
      <button class="btn-prestashop" onclick="window.open('${info.prestashopUrl}', '_blank')">
        🛒 Ver en PrestaShop
      </button>
      <button class="btn-cart" onclick="esgas.addToCart(esgas.searchProduct('${productSku}')); alert('✅ Agregado al carrito');">
        ➕ Agregar al carrito
      </button>
    </div>
  `;
}

console.log('[ESGAS] Sistema de búsqueda y carrito cargado');
