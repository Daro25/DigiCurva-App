
    <style>
        /* --- BODY --- */
        .create-ad-btn {
            margin: 20px 0;
            background-color: var(--primary-color);
            padding: 10px 15px;
            border-radius: 8px;
            border: none;
            color: white;
            font-weight: bold;
            cursor: pointer;
            display: inline-block;
        }

        /* --- CARRUSEL (BANNER) --- */
        .banner-container {
            width: 100%;
            height: 300px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden; /* Ocultar lo que se sale */
            border-radius: 12px;
        }

        .carousel-track {
            display: flex;
            height: 100%;
            transition: transform 0.5s ease-in-out;
            /* El ancho se calcula dinámicamente en JS */
        }

        .hero-card {
            width: 540px; /* Ocupa todo el contenedor */
            height: 300px;
            position: relative;
            background-color: #eee;
            border-radius: 25px;
            overflow: hidden;
        }

        .hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .hero-overlay {
            position: absolute;
            top: 40px; right: 40px;
            text-align: right;
        }

        .hero-title {
            font-size: 32px; color: #fff; font-weight: bold;
            text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
            margin-bottom: 5px;
        }
        .hero-subtitle {
            font-size: 24px; color: #eee;
            text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
        }

        /* --- GRID DE PRODUCTOS --- */
        .section-title {
            font-size: 20px; font-weight: 600; color: #333;
            margin: 15px 0;
        }

        .grid-container {
            display: grid;
            /* Lógica responsive del numColumns */
            grid-template-columns: repeat(1, 1fr); 
            gap: 20px;
            margin-bottom: 30px;
        }

        /* Responsive Breakpoints simulando useWindowDimensions */
        @media (min-width: 600px) {
            .grid-container { grid-template-columns: repeat(2, 1fr); }
            .user-details { display: block; }
            .nav-links { display: flex; }
            .menu-icon { display: none; }
        }
        @media (min-width: 1024px) {
            .grid-container { grid-template-columns: repeat(4, 1fr); }
        }

        .card {
            background: #fff;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #f0f0f0;
            display: flex;
            flex-direction: column;
        }

        .card-image-container {
            width: 100%;
            aspect-ratio: 1 / 1;
            position: relative;
            margin-bottom: 10px;
        }

        .card-image {
            width: 100%; height: 100%;
            object-fit: cover;
            border-radius: 8px;
        }

        .heart-icon {
            position: absolute; top: 0; left: 0;
            background: rgba(255,255,255,0.7);
            border-radius: 50%; padding: 5px;
            cursor: pointer;
        }

        .card-title {
            font-size: 14px; font-weight: 700; color: #000;
            margin-bottom: 2px;
            height: 40px; /* Limite de lineas visual */
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .card-price {
            font-size: 22px; font-weight: 300; color: #333;
        }

        .add-button {
            margin-top: 10px;
            background: transparent;
            border: none;
            color: var(--primary-color);
            font-size: 12px;
            cursor: pointer;
            text-align: left;
            padding: 0;
        }

        /* --- FOOTER --- */
        .footer {
            margin-top: 40px;
            border-top: 1px solid #eee;
            padding: 40px 20px;
            background-color: #fff;
        }

        .footer-content {
            max-width: var(--max-width);
            margin: 0 auto;
            display: flex;
            flex-direction: column; /* Mobile first */
            gap: 30px;
        }

        .footer-brand h3 { font-size: 20px; font-weight: 900; margin-bottom: 10px; }
        .footer-brand p { font-size: 12px; color: #666; margin-bottom: 15px; }
        .social-icons { display: flex; gap: 15px; align-items: center; color: #666; font-size: 20px; }

        .footer-links-container {
            display: flex; gap: 40px; flex-wrap: wrap;
        }
        .footer-col { min-width: 120px; }
        .footer-col-title { font-weight: bold; margin-bottom: 15px; font-size: 14px; display: block; }
        .footer-link { font-size: 12px; color: #555; margin-bottom: 8px; display: block; text-decoration: none; cursor: pointer; }

        @media (min-width: 1024px) {
            .footer-content { flex-direction: row; justify-content: space-between; }
        }

    </style>
        <div class="content-wrapper">

            <h2 class="section-title">Ofertas</h2>
            <div id="ofertas-grid" class="grid-container"></div>

            <h2 class="section-title">Productos</h2>
            <div id="nuevos-grid" class="grid-container"></div>
        </div>
<script>
const urlParams = new URLSearchParams(window.location.search);
const search = urlParams.get('search');
console.log(search);
loquesea();
function loquesea() {
    let container = document.getElementById('search-container');
    container.innerHTML= `<input type="text" id="search-input" class="search-input" placeholder="Buscar" value="${search}" onchange="handleSearch()">
                                <ion-icon name="search" style="font-size:20px; color:black; cursor:pointer;" onclick="handleSearch()"></ion-icon>`;
}
        function handleSearch() {
            const text = document.getElementById('search-input').value;
            if (text.trim()) {
                window.location.href = `buscar.html?search=${encodeURIComponent(text)}`;
            }
        }
        const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';
        const MOCK_PHONE_IMG = 'https://via.placeholder.com/300x300.png?text=Sin+Imagen';

        // ESTADO GLOBAL
        let state = {
            productos: [],
            ofertas: [],
            userProfile: null,
            loading: true,
            bannerIndex: 0
        };

        // --- 1. INICIALIZACIÓN ---
        window.addEventListener('load', () => {
            initApp(); 
        });

        async function initApp() {
            // Esperar 3 segundos (Lógica visual solicitada)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Simular SesionUsuario.getId() -> Asumimos ID 1 para la demo
            const userId = "1"; // Cambia esto si tienes lógica real de localStorage

            if (!userId) {
                alert("No hay usuario. Redirigiendo a Login...");
                window.location.href = '/login'; 
                return;
            }

            console.log(`Usuario autenticado: ${userId}. Cargando datos remotos...`);
            
            // Cargar datos
            await fetchRemoteData(userId);

            // Ocultar loading y mostrar app
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }

        // --- 2. FETCH DE DATOS ---
        async function fetchRemoteData(userId) {
            try {
                // A. PERFIL
                /*try {
                    const data = {
                        usuario_id: userId
                    }
                    const resPerfil = await fetch(`${API_BASE_URL}obtener_perfil.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if(resPerfil.ok) {
                        const data = await resPerfil.json();
                        state.userProfile = {
                            nombre: data.perfil?.nombre || 'Usuario',
                            avatar: data.perfil?.foto_perfil_url || DEFAULT_AVATAR
                        };
                        updateHeaderUI();
                    }
                } catch (e) { console.warn("Fallo perfil", e); }
*/
                // B. PRODUCTOS
                try {
                    let formData = new FormData();
                    formData.append('search', search);
                    const resProd = await fetch(`${API_BASE_URL}search.php`,{
                        method: 'POST',
                        body: formData
                    });
                    if(resProd.ok) {
                        const data = await resProd.json();
                        // Mapeo
                        state.productos = Array.isArray(data.productos) ? data.productos.map(item => ({
                            producto_id: item.producto_id || 0,
                            title: item.titulo || item.nombre,
                            price: parseFloat(item.precio) || 0,
                            image: item.imagen_url || item.imagen || MOCK_PHONE_IMG,
                            descripcion: item.descripcion || '',
                            existencia: item.cantidad_existencia || 0
                        })) : [];
                        state.ofertas = Array.isArray(data.ofertas) ? data.ofertas.map(item => ({ 
                            producto_id: item.producto_id || 0,
                            title: item.titulo || item.nombre,
                            price: parseFloat(item.precio) || 0,
                            descuento: parseFloat(item.descuento) || 0,
                            fin: item.fecha_finalizacion || '',
                            image: item.imagen_url || item.imagen || MOCK_PHONE_IMG,
                            descripcion: item.descripcion || '',
                            existencia: item.cantidad_existencia || 0
                        })) : [];
                        console.log(data);
                        
                        renderProductSections();
                    }
                } catch (e) { console.warn("Fallo productos", e.message); }

            } catch (error) {
                console.error("Error general:", error);
            }
        }

        // --- 3. RENDERIZADO UI ---

        function updateHeaderUI() {
            if (state.userProfile) {
                document.getElementById('user-name').textContent = state.userProfile.nombre;
                document.getElementById('user-avatar').src = state.userProfile.avatar;
            } else {
                document.getElementById('user-avatar').src = DEFAULT_AVATAR;
            }
        }

        // Lógica de productos
        function createProductCardHTML(product) {
            return `
                <div class="card">
                    <div class="card-image-container">
                        <img src="${product.image}" class="card-image" onerror="this.src='${MOCK_PHONE_IMG}'"
                         onclick='handleToProduct("${empaquetado(product)}")'>
                        <div class="heart-icon"><ion-icon name="heart-outline"></ion-icon></div>
                    </div>
                    <div class="card-title">${product.title}</div>
                    <div class="card-price">$${product.price.toLocaleString()}</div>
                    <button class="add-button" onclick="handleAddToCart('${product.title}')">Ver detalles</button>
                </div>
            `;
        }
        function createOfertaCardHTML(product) {
            return `
                <div class="card">
                    <div class="card-image-container">
                        <img src="${product.image}" class="card-image" onerror="this.src='${MOCK_PHONE_IMG}'"
                         onclick='handleToProduct("${empaquetado(product)}")'>
                        <div class="heart-icon"><ion-icon name="heart-outline"></ion-icon></div>
                    </div>
                    <div class="card-title">${product.title}</div>
                    <div class="card-price"><s>$${product.price.toLocaleString()}</s> <b>$${(product.price * (1 - product.descuento / 100)).toLocaleString()}</b>(${product.descuento}%)</div>
                    <p>Oferta válida hasta: ${new Date(product.fin).toLocaleDateString()}</p>
                    <button class="add-button" onclick="handleAddToCart('${product.title}')">Ver detalles</button>
                </div>
            `;
        }
        function renderProductSections() {
            if (state.ofertas.length == 0) {
                document.getElementById('ofertas-grid').innerHTML = '<p>Sin resultados.</p>';
            }
            if (state.productos.length == 0) {
                document.getElementById('nuevos-grid').innerHTML = '<p>Sin resultados.</p>';
            }
            if (state.ofertas.length > 0 && state.productos.length > 0) {
                const ofertas = state.ofertas;
                // Simular nuevos tomando otros o los mismos si hay pocos
                const nuevos = state.productos;
                
                document.getElementById('ofertas-grid').innerHTML = ofertas.map(createOfertaCardHTML).join('');
                document.getElementById('nuevos-grid').innerHTML = nuevos.map(createProductCardHTML).join('');
            }
        }
</script>