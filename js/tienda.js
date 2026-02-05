document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando sistema de Maggie's Selects...");
    
    // 1. Cargamos carteras y perfumes por defecto al inicio
    const fuentesIniciales = ['carteras.json', 'perfumes.json'];
    cargarCategoria(fuentesIniciales);

    // 2. Activamos la escucha de clics en el menú
    configurarMenu();
});

/**
 * Función para cargar productos desde archivos JSON
 */
async function cargarCategoria(archivos) {
    const contenedor = document.getElementById('contenedor-productos');
    const splash = document.getElementById('splash-screen');
    const listaArchivos = Array.isArray(archivos) ? archivos : [archivos];

    // Seguridad: Si la carga falla o se bloquea localmente, el Splash se quita tras 2.5 segundos
    const fallbackSplash = setTimeout(() => {
        if (splash && !splash.classList.contains('hidden-splash')) {
            console.warn("Forzando cierre de Splash Screen por tiempo de espera.");
            splash.classList.add('hidden-splash');
        }
    }, 2500);

    try {
        console.log("Cargando archivos:", listaArchivos);
        
        // Peticiones asíncronas en paralelo para optimizar velocidad
        const promesas = listaArchivos.map(archivo => 
            fetch(archivo).then(res => {
                if (!res.ok) throw new Error(`No se pudo leer el archivo: ${archivo}`);
                return res.json();
            })
        );
        
        const resultados = await Promise.all(promesas);
        const productos = resultados.flat(); // Unificamos carteras y perfumes
        
        if (contenedor) {
            contenedor.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

            if (productos.length === 0) {
                contenedor.innerHTML = '<p class="loading">Próximamente: Nuevos ingresos exclusivos.</p>';
            } else {
                productos.forEach(p => {
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
        }
    } catch (error) {
        console.error("Error crítico en la carga de datos:", error);
        if (contenedor) {
            contenedor.innerHTML = '<p class="loading">Error al cargar el catálogo. Asegúrate de usar Live Server o subirlo a GitHub.</p>';
        }
    } finally {
        // Limpiamos el temporizador y ocultamos el Splash elegantemente
        clearTimeout(fallbackSplash);
        setTimeout(() => {
            if (splash) splash.classList.add('hidden-splash');
        }, 800);
    }
}

/**
 * Configura los filtros del menú de navegación
 */
function configurarMenu() {
    const links = {
        'nav-inicio': ['carteras.json', 'perfumes.json'],
        'nav-carteras': 'carteras.json',
        'nav-perfumes': 'perfumes.json'
    };

    Object.keys(links).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`Filtrando por: ${id}`);
                cargarCategoria(links[id]);
            });
        }
    });
}

/**
 * Lógica de compra y redirección a WhatsApp de Maggie's Selects
 */
function procesarCompra(id, nombre, precio, marca) {
    const stockElement = document.getElementById(`stock-${id}`);
    let stockActual = parseInt(stockElement.innerText);

    if (stockActual > 0) {
        stockActual--;
        stockElement.innerText = stockActual;

        // Reemplaza con el número de WhatsApp de tu mamá (formato internacional)
        const telefono = "593981724457"; 
        const mensaje = encodeURIComponent(
            `¡Hola Maggie's Selects! 👋\nMe interesa este artículo de lujo:\n\n` +
            `🏷️ Marca: ${marca}\n` +
            `👜 Producto: ${nombre}\n` +
            `💰 Precio: $${precio}\n\n` +
            `¿Cómo puedo realizar el pago?`
        );
        
        const urlWhatsapp = `https://wa.me/${telefono}?text=${mensaje}`;

        // Abrir en pestaña nueva
        setTimeout(() => {
            window.open(urlWhatsapp, '_blank');
        }, 300);
    } else {
        alert("Este producto se ha agotado. Consulta con nosotros por nuevas existencias.");
    }
}

/* =========================================
   FUNCIONALIDAD DE MÉTODOS DE PAGO

   ========================================= */
function infoPago(metodo) {
    // Usamos un 'alert' sencillo, pero con texto profesional
    alert(
        `💳 Pago con ${metodo}:\n\n` +
        `Para tu seguridad, procesamos los pagos con ${metodo} mediante enlace de pago seguro (PayPhone / Deuna) o transferencia bancaria directa.\n\n` +
        `¡Contáctanos por WhatsApp para enviarte el link!`
    );
}
