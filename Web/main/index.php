
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
    </style>
    <div class="content-wrapper">
            <button class="create-ad-btn" onclick="navigateTo('./Anuncio.html')">+ Crear anuncio</button>

            <div id="banner-section" class="banner-container">
                <div id="carousel-track" class="carousel-track">
                    </div>
            </div>

            <h2 class="section-title">Ofertas</h2>
            <div id="ofertas-grid" class="grid-container"></div>

            <h2 class="section-title">Recomendados para ti</h2>
            <div id="recomendados-grid" class="grid-container"></div>

            <h2 class="section-title">Productos nuevos</h2>
            <div id="nuevos-grid" class="grid-container"></div>
        </div>
<script>
        const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';
        const MOCK_PHONE_IMG = 'https://via.placeholder.com/300x300.png?text=Sin+Imagen';

        // ESTADO GLOBAL
        let state = {
            banners: [],
            productos: [],
            ofertas: [],
            userProfile: null,
            loading: true,
            bannerIndex: 0
        };

        // --- 1. INICIALIZACIÓN ---
        window.addEventListener('load', () => {
            setInterval(() => {
                //animacion de perfil cada 5000
                const userAnimated = document.getElementById('user-animated');
                if (userAnimated) {
                    userAnimated.classList.add('animate__rubberBand');
                    setTimeout(() => {//removedor
                        userAnimated.classList.remove('animate__rubberBand');
                    }, 2000);
                }
            }, 5000);
            initApp();
        });

        async function initApp() {
            // Esperar 2 segundos (Lógica visual solicitada)
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Cargar datos
            await fetchRemoteData();

            // Ocultar loading y mostrar app
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';

            // Iniciar carrusel automático si hay banners
            if (state.banners.length > 1) {
                startCarousel();
            }
        }

        // --- 2. FETCH DE DATOS ---
        async function fetchRemoteData() {
            try {
                // A. PERFIL
                /*try {
                    const resPerfil = await fetch(`${API_BASE_URL}obtener_perfil.php`);
                    if(resPerfil.ok) {
                        const data = await resPerfil.json();
                        if(!data.success) {
                            console.warn("Error al obtener perfil:", data);
                            alert(data.error+'\nRedirigiendo al login.');
                            window.location.href = 'login.html';
                        }
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
                    const resProd = await fetch(`${API_BASE_URL}Listar_productos.php`);
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
                        console.log(state.productos);
                    }
                } catch (e) { console.warn("Fallo productos", e.message); }
                try {
                    const resProd = await fetch(`${API_BASE_URL}obtener_feed.php?is_consulta_vendedor=true`);
                    if(resProd.ok) {
                        const data = await resProd.json();
                        // Mapeo
                        state.productos = [
                            ...state.productos,
                            ...(Array.isArray(data.productos) 
                                ? data.productos.map(item => ({
                                    producto_id: item.id || 0,
                                    title: item.nombre || 'title',
                                    price: parseFloat(item.precio) || 0,
                                    image: item.imagen || MOCK_PHONE_IMG,
                                    descripcion: item.descripcion || '',
                                    ubicacion: item.ubicacion || 'nil',
                                    existencia: 'infinite',
                                    tipe: 'ambulante',
                                    categoria: item.categoria,
                                    activo: item.activo || "1",
                                    idubic: item.id_ubicacion
                                }))
                                : [])
                            ];
                        console.log(state.productos);
                    }
                } catch (e) { console.warn("Fallo productos Ambulantes", e.message); }
                // B2. Ofertas
                try {
                    const resProd = await fetch(`${API_BASE_URL}obtener_Ofertas.php`);
                    if(resProd.ok) {
                        const data = await resProd.json();
                        // Mapeo
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
                        renderProductSections();
                    }
                } catch (e) { console.warn("Fallo productos", e.message); }
                // C. BANNERS
                try {
                    const resBanners = await fetch(`${API_BASE_URL}obtener_anuncios.php`);
                    if(resBanners.ok) {
                        const data = await resBanners.json();
                        state.banners = Array.isArray(data.anuncios_activos) ? data.anuncios_activos.map(item => ({
                            id: item.anuncio_id || item.id,
                            imageUrl: item.url_imagen || item.imagen,
                            title: item.titulo || '',
                            subtitle: item.mensaje || ''
                        })) : [];
                        renderBanners();
                        console.log(data);
                    }
                } catch (e) { console.warn("Fallo banners", e); }

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

        function renderBanners() {
            const track = document.getElementById('carousel-track');
            if (state.banners.length === 0) {
                document.getElementById('banner-section').style.display = 'none';
                return;
            }

            track.innerHTML = state.banners.map(banner => `
                <div class="hero-card">
                    <img src="${banner.imageUrl || MOCK_PHONE_IMG}" class="hero-image" onerror="this.src='${MOCK_PHONE_IMG}'">
                    <div class="hero-overlay">
                        <div class="hero-title">${banner.title}</div>
                        <div class="hero-subtitle">${banner.subtitle}</div>
                    </div>
                </div>
            `).join('');
        }

        // Lógica de productos
        function createProductCardHTML(product) {
            return `
                <div class="card">
                    <div class="card-image-container">
                        <img src="${product.image}" class="card-image" onerror="this.src='${MOCK_PHONE_IMG}'" onclick='handleToProduct("${empaquetado(product)}")'>
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
                        <img src="${product.image}" class="card-image" onerror="this.src='${MOCK_PHONE_IMG}'" onclick='handleToProduct("${empaquetado(product)}")'>
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
            const ofertas = state.ofertas.slice(0, 4);
            const recomendados = state.productos.slice(4, 8);
            // Simular nuevos tomando otros o los mismos si hay pocos
            const nuevos = state.productos.length > 8 ? state.productos.slice(8, 12) : state.productos.slice(0, 4);

            document.getElementById('ofertas-grid').innerHTML = ofertas.map(createOfertaCardHTML).join('');
            document.getElementById('recomendados-grid').innerHTML = recomendados.map(createProductCardHTML).join('');
            document.getElementById('nuevos-grid').innerHTML = nuevos.map(createProductCardHTML).join('');
        }

        // --- 4. LÓGICA CARRUSEL ---
        function startCarousel() {
            const track = document.getElementById('carousel-track');
            setInterval(() => {
                state.bannerIndex++;
                if (state.bannerIndex >= state.banners.length) {
                    state.bannerIndex = 0;
                }
                const translateX = -(state.bannerIndex * 100);
                track.style.transform = `translateX(${translateX}%)`;
            }, 4000);
        }
    </script>