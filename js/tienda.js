/* =========================================
   SISTEMA PRINCIPAL: MAGGIE'S SELECTS
   Powered by: NIU SYSTEMS & Cloudflare D1
   ========================================= */

// Variable global para almacenar el catálogo en memoria (más rápido)
let catalogoGlobal = [];
const API_URL = 'https://api-maggies.nauc8778.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando sistema dinámico de Maggie's Selects...");
    
    // 1. Cargamos TODOS los productos desde la API al inicio
    cargarDesdeAPI();
});

/**
 * Función Principal: Conecta con la base de datos Cloudflare D1
 */
async function cargarDesdeAPI() {
    const splash = document.getElementById('splash-screen');
    const fallbackSplash = setTimeout(() => {
        if (splash && !splash.classList.contains('hidden-splash')) {
            splash.classList.add('hidden-splash');
        }
    }, 2500);

    try {
        console.log("Conectando con la base de datos...");
        
        // Petición asíncrona a tu API
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Fallo en la conexión con el servidor.");
        
        // Guardamos todo en la variable global
        catalogoGlobal = await respuesta.json();
        console.log(`Catálogo cargado: ${catalogoGlobal.length} productos.`);
        
        // Pintamos todos los productos (Inicio)
        renderizarProductos(catalogoGlobal);
        
        // Una vez cargados los datos, activamos los botones del menú
        configurarMenu();

    } catch (error) {
        console.error("Error crítico conectando a la API:", error);
        const contenedor = document.getElementById('contenedor-productos');
        if (contenedor) {
            contenedor.innerHTML = '<p class="loading">Error al cargar el catálogo. Por favor, recarga la página.</p>';
        }
    } finally {
        clearTimeout(fallbackSplash);
        setTimeout(() => {
            if (splash) splash.classList.add('hidden-splash');
        }, 800);
    }
}

/**
 * Función para pintar las tarjetas en el HTML
 */
function renderizarProductos(productosFiltrados) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiamos el contenedor

    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = '<p class="loading">Próximamente: Nuevos ingresos exclusivos.</p>';
        return;
    }

    productosFiltrados.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-container">
                <img src="${p.imagen}" alt="${p.nombre}">
            </div>
            <div class="product-info">
                <span class="marca-tag">${p.marca}</span>
                <h3>${p.nombre}</h3>
                <p class="precio">$${p.precio.toFixed(2)}</p>
                <p class="stock">Disponibles: <span id="stock-${p.id}">${p.stock}</span></p>
                <button class="btn-buy" onclick="procesarCompra(${p.id}, '${p.nombre}', ${p.precio}, '${p.marca}')">
                    Comprar ahora
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

/**
 * Configura los filtros del menú (Filtrado en Memoria)
 */
function configurarMenu() {
    const btnInicio = document.getElementById('nav-inicio');
    const btnCarteras = document.getElementById('nav-carteras');
    const btnPerfumes = document.getElementById('nav-perfumes');

    if (btnInicio) {
        btnInicio.addEventListener('click', (e) => {
            e.preventDefault();
            renderizarProductos(catalogoGlobal); // Muestra todo
        });
    }

    if (btnCarteras) {
        btnCarteras.addEventListener('click', (e) => {
            e.preventDefault();
            // Filtramos el array global buscando solo la categoría 'carteras'
            const soloCarteras = catalogoGlobal.filter(p => p.categoria === 'carteras');
            renderizarProductos(soloCarteras);
        });
    }

    if (btnPerfumes) {
        btnPerfumes.addEventListener('click', (e) => {
            e.preventDefault();
            // Filtramos el array global buscando solo la categoría 'perfumes'
            const soloPerfumes = catalogoGlobal.filter(p => p.categoria === 'perfumes');
            renderizarProductos(soloPerfumes);
        });
    }
}

/**
 * Lógica de compra y redirección a WhatsApp
 */
function procesarCompra(id, nombre, precio, marca) {
    const stockElement = document.getElementById(`stock-${id}`);
    let stockActual = parseInt(stockElement.innerText);

    if (stockActual > 0) {
        // En una app real, aquí enviarías un PUT a la API para restar stock.
        // Por ahora, simulamos visualmente:
        stockActual--;
        stockElement.innerText = stockActual;

        const telefono = "593981724457"; 
        const mensaje = encodeURIComponent(
            `¡Hola Maggie's Selects! 👋\nMe interesa este artículo de lujo:\n\n` +
            `🏷️ Marca: ${marca}\n` +
            `👜 Producto: ${nombre}\n` +
            `💰 Precio: $${precio}\n\n` +
            `¿Cómo puedo realizar el pago?`
        );
        
        const urlWhatsapp = `https://wa.me/${telefono}?text=${mensaje}`;

        setTimeout(() => {
            window.open(urlWhatsapp, '_blank');
        }, 300);
    } else {
        alert("Este producto se ha agotado. Consulta con nosotros por nuevas existencias.");
    }
}

/**
 * Métodos de Pago
 */
function infoPago(metodo) {
    alert(
        `💳 Pago con ${metodo}:\n\n` +
        `Para tu seguridad, procesamos los pagos con ${metodo} mediante enlace de pago seguro (PayPhone / Deuna) o transferencia bancaria directa.\n\n` +
        `¡Contáctanos por WhatsApp para enviarte el link!`
    );
}

/**
 * Auto-Scroll Mejorado
 */
document.querySelectorAll('.nav-links a').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        const destino = this.getAttribute('href');

        if (destino.includes('#') && destino !== 'index.html') {
            setTimeout(() => {
                const seccionProductos = document.getElementById('contenedor-productos');
                if (seccionProductos) {
                    seccionProductos.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start'
                    });
                }
            }, 300);
        }
    });
});
