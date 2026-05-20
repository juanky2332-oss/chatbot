# ESGAS Chatbot — Sistema de Compra Integrado

## 🎯 Flujo de Trabajo Completo

### 1. **Usuario pregunta por un producto**
```
Usuario: "¿Tienes el NTN 6205-2RS?"
```

### 2. **Chatbot revisa stock/precios ANTES de responder**
- Consulta `catalog.json` automáticamente
- Verifica: stock, precio, especificaciones
- Genera enlace a PrestaShop (ficticio de momento)

### 3. **Respuesta técnica + comercial**
```
Chatbot: "Sí, tenemos **NTN 6205-2RS** (rígido de bolas, 25×52×15 mm) en stock.
- Stock: **87 unidades**
- Precio: **€12,50** por unidad
- [Ver en PrestaShop] [Agregar al carrito]"
```

### 4. **Usuario agrega al carrito (simulado)**
- Botón "Agregar al carrito" → se guarda en localStorage
- Botón "Ver en PrestaShop" → abre enlace ficticio

### 5. **Usuario revisa carrito**
```
Usuario: "¿Cuál es mi carrito?"
Chatbot: "Tu carrito contiene:
- NTN 6205-2RS (1x) — €12,50
- NTN 6206-2RS (2x) — €29,50
---
Total: €42,00

[Ir a pagar] [Seguir comprando]"
```

### 6. **Checkout en PrestaShop**
- Usuario hace clic en "Ir a pagar"
- Se redirige a `https://shop.esgas.es/checkout` (ficticio)
- **NUNCA se paga desde el chatbot**

---

## 📦 Catálogo Actual (catalog.json)

| SKU | Producto | Stock | Precio | Dimesiones |
|-----|----------|-------|--------|------------|
| NTN-6205-2RS | Rígido de bolas | 87 | €12,50 | 25×52×15 |
| NTN-6206-2RS | Rígido de bolas | 156 | €14,75 | 30×62×16 |
| NTN-NU205 | Rodillo cilíndrico | 42 | €18,30 | 25×52×15 |
| SNR-30205 | Rodillo cónico | 29 | €16,95 | 25×52×15 |
| NTN-6308-C3 | Rígido (C3) | 15 | €28,50 | 40×90×23 |
| SNR-UC206 | Inserto rodante | 8 | €35,20 | 30×72×38 |
| CORREA-SPZ-1000 | Correa trapecial | 234 | €8,40 | SPZ 1000 |
| RETEN-TC-30x47x7 | Retén radial | 512 | €5,60 | 30×47×7 |

---

## 🔄 Flujo de Sincronización (n8n + GitHub)

```
┌─────────────────────────────────────────────────────────────────┐
│ Claude Code Web Session                                         │
├─────────────────────────────────────────────────────────────────┤
│ ↓                                                               │
│ SessionStart Hook Ejecuta:                                     │
│   1. git fetch + pull (GitHub)                                 │
│   2. curl → n8n API (sincronizar workflows)                    │
│                                                                 │
│ ↓                                                               │
│ catalog.json cargado en memoria                                │
│                                                                 │
│ ↓                                                               │
│ Chatbot responde consultando catalog.json                      │
│   - Stock real                                                  │
│   - Precios reales                                              │
│   - Enlaces a PrestaShop (ficticios)                            │
│                                                                 │
│ ↓                                                               │
│ Usuario compra (carrito simulado en localStorage)              │
│                                                                 │
│ ↓                                                               │
│ Checkout en PrestaShop (cuando API esté disponible)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `system-prompt.md` | Instrucciones para revisar stock/precios antes de responder |
| `catalog.json` | Base de datos de productos (stock, precios, especificaciones) |
| `product-search.js` | Búsqueda de productos y gestión de carrito |
| `chatbot.html` | Frontend con integración de búsqueda |
| `ChatBot.jsx` | Componente React (usa el mismo system-prompt) |

---

## 🔮 Próximas Integraciones

### Cuando tengas API de PrestaShop:
```bash
# Actualizar .claude/env.local con:
export PRESTASHOP_API_KEY="tu_api_key_aqui"
export PRESTASHOP_HOST="https://tienda.esgas.es"
```

El hook sincronizará:
- ✅ Stock en tiempo real desde PrestaShop
- ✅ Precios dinámicos
- ✅ Enlaces verdaderos (no ficticios)
- ✅ Disponibilidad de referencias

### Cuando tengas datos de n8n Workflows:
Los workflows n8n se ejecutarán automáticamente para:
- Sincronizar inventario
- Procesar órdenes
- Enviar confirmaciones
- Actualizar catálogo

---

## 🧪 Ejemplo de Ejecución

### Usuario 1: Búsqueda técnica + Compra
```
Usuario: "Necesito equivalencia de SKF 6205-2RS en NTN"
Chatbot: "La equivalencia es **NTN-6205-2RS** (mismo número base, mismo sufijo).
Tenemos **87 unidades en stock** a **€12,50** cada una.
[Ver en PrestaShop] [Agregar al carrito]"

Usuario: "Agregar 3 unidades"
Chatbot: "✅ Agregadas 3x NTN-6205-2RS al carrito (€37,50)"

Usuario: "¿Y mi carrito?"
Chatbot: "Tu carrito:
- NTN-6205-2RS (3x) — €37,50
Total: €37,50
[Ir a pagar]"

Usuario: Hace clic → Redirige a PrestaShop → Paga
```

### Usuario 2: Consulta técnica sin compra
```
Usuario: "¿Qué rodamiento uso en un motor de 5 CV a 1500 rpm?"
Chatbot: "Para esa aplicación, recomiendo un **rígido de bolas** de la serie **62xx** 
(rodamientos NTN comunes en motores)...
¿Qué dimensiones necesitas? ¿30 mm de bore?"
```

---

## ⚙️ Configuración del System Prompt

El `system-prompt.md` incluye instrucciones explícitas:

```markdown
## Protocolo de respuesta ante consultas comerciales

Cuando el usuario pregunta por **stock, precio, disponibilidad o enlace a compra**:

1. **Busca en catalog.json** por: SKU/referencia, nombre o serie.
2. **Si encuentras el producto**:
   - Stock: "Tenemos **X unidades en stock**"
   - Precio: "**€Y,ZZ** por unidad"
   - **Enlace PrestaShop**: "Puedes acceder aquí → [URL del producto]"
```

---

## 🎬 Testing del Flujo

### Para probar localmente:
```bash
cd /home/user/chatbot/clientes/esgas

# 1. Abrir chatbot.html en navegador
open chatbot.html

# 2. Preguntar por un producto:
"¿Tienes NTN 6206?"

# 3. Agregar al carrito (botón)

# 4. Revisar carrito (localStorage):
# En DevTools → Application → localStorage → esgas_cart

# 5. Hacer "compra" ficticia → Redirige a PrestaShop (URL ficticia)
```

---

## 📝 Notas Importantes

⚠️ **ACTUAL (Ficticio):**
- URLs de PrestaShop son ficticia: `https://shop.esgas.es/...`
- Stock/precios vienen de `catalog.json` (manual)
- Carrito se guarda en `localStorage` (no sincroniza al servidor)

✅ **CUANDO TENGAS LA API DE PRESTASHOP:**
- URLs reales a tu tienda
- Stock/precios sincronizados en tiempo real
- Carrito guardado en servidor
- Checkout real desde PrestaShop

📌 **FLUJO ACTUAL VS FUTURO:**

| Aspecto | Ahora (Ficticio) | Futuro (Con API) |
|--------|-----------------|-----------------|
| Catálogo | catalog.json | PrestaShop API |
| Stock | Manual | Sincronizado en tiempo real |
| Precios | catalog.json | PrestaShop API |
| Carrito | localStorage | Base de datos |
| Checkout | URL ficticia | PrestaShop real |
| Órdenes | No se procesan | Se crean en PrestaShop |

---

**Autor:** Flownexion (https://flownexion.com/)  
**Última actualización:** 2026-05-20  
**Estado:** Prototipo funcional con datos ficticios
