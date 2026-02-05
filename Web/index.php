<?php
if(!isset($_COOKIE['token'])){
    header("Location: login.html");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigiCurva</title>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    <style>
        /* --- ESTILOS GLOBAL Y RESET --- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            background-color: #fff;
            overflow-x: hidden; /* Evitar scroll horizontal global */
        }

        /* Variables basadas en tus constantes */
        :root {
            --primary-color: #2196F3;
            --header-bg-color: rgba(56, 189, 248, 0.4);
            --text-dark: #333;
            --text-light: #666;
            --max-width: 1200px;
        }

        /* --- PANTALLA DE CARGA --- */
        #loading-screen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        .spinner {
            width: 50px; height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* --- HEADER --- */
        .header-background {
            background-image: url('assets/fondoHome.jpg');
            background-size: cover;
            background-position: center;
        }
        
        .header-container {
            background-color: var(--header-bg-color);
            width: 100%;
            padding-bottom: 10px;
        }

        .content-wrapper {
            max-width: var(--max-width);
            margin: 0 auto;
            width: 100%;
            padding: 0 20px;
        }

        .header-top {
            display: flex;
            align-items: center;
            padding: 10px 0;
        }

        .logo-group {
            display: flex;
            align-items: center;
        }
        .logo-img { width: 30px; height: 30px; margin-right: 10px; }
        .logo-text {
            font-size: 24px;
            font-weight: 900;
            color: #fff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            font-family: 'Arial Black', sans-serif;
        }

        .spacer { flex: 1; }

        .user-info {
            display: flex;
            align-items: center;
        }
        .avatar {
            width: 32px; height: 32px;
            border-radius: 50%;
            margin-right: 8px;
            border: 2px solid #fff;
            background-color: #ccc;
            object-fit: cover;
        }
        .user-details { display: none; } /* Oculto en móvil por defecto */
        .user-name { font-size: 12px; font-weight: bold; color: #fff; display: block;}
        .user-link { font-size: 10px; color: #fff; cursor: pointer; }

        /* --- NAVBAR --- */
        .nav-bar { width: 100%; }
        .nav-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px 0;
        }
        
        .nav-links { display: none; gap: 20px; align-items: center; } /* Desktop only */
        .nav-link-text {
            font-size: 14px; font-weight: 600; color: #fff; text-decoration: none; cursor: pointer;
        }
        
        .menu-icon { font-size: 28px; color: #fff; cursor: pointer; }

        .search-container {
            flex: 1;
            display: flex;
            align-items: center;
            background: #fff;
            border-radius: 4px;
            height: 36px;
            margin: 0 20px;
            max-width: 400px;
            padding: 0 10px;
            border: 1px solid #ccc;
        }
        .search-input {
            flex: 1;
            border: none;
            outline: none;
            height: 100%;
            font-size: 14px;
        }

        .header-icons { display: flex; gap: 15px; }
        .header-icon-btn { color: #fff; font-size: 24px; cursor: pointer; background: none; border: none; }

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
            min-width: 100%; /* Ocupa todo el contenedor */
            height: 300px;
            position: relative;
            background-color: #eee;
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
</head>
<body>

    <div id="loading-screen">
        <div class="spinner"></div>
        <p style="margin-top: 10px; color: #666;">Cargando DigiCurva...</p>
    </div>

    <div id="app-container" style="display: none;">
        
        <div class="header-background">
            <div class="header-container">
                <div class="content-wrapper">
                    <div class="header-top">
                        <div class="logo-group">
                            <img src="assets/icon.png" class="logo-img" alt="Logo">
                            <span class="logo-text">DigiCurva</span>
                        </div>
                        <div class="spacer"></div>
                        <div class="user-info">
                            <img id="user-avatar" src="" class="avatar">
                            <div class="user-details">
                                <span id="user-name" class="user-name">Usuario</span>
                                <span class="user-link">Ajustes</span>
                            </div>
                        </div>
                    </div>

                    <div class="nav-bar">
                        <div class="nav-content">
                            <ion-icon name="menu" class="menu-icon"></ion-icon>
                            
                            <div class="nav-links">
                                <ion-icon name="home-outline" style="color:white; font-size:20px;"></ion-icon>
                                <a class="nav-link-text">Ofertas</a>
                                <a class="nav-link-text">Nuevo</a>
                                <a class="nav-link-text">Más vendido</a>
                                <div style="display:flex; align-items:center;">
                                    <a class="nav-link-text">Categorías</a>
                                    <ion-icon name="caret-down" style="font-size:12px; color:white; margin-left:4px;"></ion-icon>
                                </div>
                            </div>

                            <div class="search-container">
                                <input type="text" id="search-input" class="search-input" placeholder="Buscar">
                                <ion-icon name="search" style="font-size:20px; color:black; cursor:pointer;" onclick="handleSearch()"></ion-icon>
                            </div>

                            <div class="header-icons">
                                <button class="header-icon-btn"><ion-icon name="heart-outline"></ion-icon></button>
                                <button class="header-icon-btn"><ion-icon name="cart-outline"></ion-icon></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wrapper">
            <button class="create-ad-btn" onclick="navigateTo('./Anuncio.html')">+ Crear anuncio</button>

            <div id="banner-section" class="banner-container">
                <div id="carousel-track" class="carousel-track">
                    </div>
            </div>

            <h2 class="section-title">Ofertas de Navidad</h2>
            <div id="ofertas-grid" class="grid-container"></div>

            <h2 class="section-title">Recomendados para ti</h2>
            <div id="recomendados-grid" class="grid-container"></div>

            <h2 class="section-title">Productos nuevos</h2>
            <div id="nuevos-grid" class="grid-container"></div>
        </div>

        <footer class="footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3 style="color:#2196F3">DigiCurva</h3>
                    <p>De la comunidad, para la comunidad.</p>
                    <div class="social-icons">
                        <ion-icon name="logo-instagram"></ion-icon>
                        <ion-icon name="logo-linkedin"></ion-icon>
                        <span style="font-weight:bold; font-size:18px;">X</span>
                    </div>
                </div>
                <div class="footer-links-container">
                    <div class="footer-col">
                        <span class="footer-col-title">Funciones</span>
                        <a class="footer-link">Envío a domicilio</a>
                        <a class="footer-link">Vender</a>
                        <a class="footer-link">Pagos</a>
                    </div>
                    <div class="footer-col">
                        <span class="footer-col-title">Información</span>
                        <a class="footer-link">Acerca de nosotros</a>
                        <a class="footer-link">Preguntas frecuentes</a>
                    </div>
                    <div class="footer-col">
                        <span class="footer-col-title">Soporte</span>
                        <a class="footer-link">Contacto</a>
                        <a class="footer-link">Paquetería</a>
                        <a class="footer-link">Legal</a>
                    </div>
                </div>
            </div>
        </footer>

    </div>

    <script>
        // CONFIGURACIÓN
        const API_BASE_URL = 'http://xampp.local/DigiCurvaServer/'//'https://ljusstudie.site/DigiCurvaServer';
        const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';
        const MOCK_PHONE_IMG = 'https://via.placeholder.com/300x300.png?text=Sin+Imagen';

        // ESTADO GLOBAL
        let state = {
            banners: [],
            productos: [],
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

            // Iniciar carrusel automático si hay banners
            if (state.banners.length > 1) {
                startCarousel();
            }
        }

        // --- 2. FETCH DE DATOS ---
        async function fetchRemoteData(userId) {
            try {
                // A. PERFIL
                try {
                    const resPerfil = await fetch(`${API_BASE_URL}/obtener_perfil.php?usuario_id=${userId}`);
                    if(resPerfil.ok) {
                        const data = await resPerfil.json();
                        state.userProfile = {
                            nombre: data.perfil?.nombre || 'Usuario',
                            avatar: data.perfil?.foto_perfil_url || DEFAULT_AVATAR
                        };
                        updateHeaderUI();
                    }
                } catch (e) { console.warn("Fallo perfil", e); }

                // B. PRODUCTOS
                try {
                    const resProd = await fetch(`${API_BASE_URL}/Listar_productos.php`);
                    if(resProd.ok) {
                        const data = await resProd.json();
                        // Mapeo
                        state.productos = Array.isArray(data.producto) ? data.producto.map(item => ({
                            id: item.anuncio_id || item.id,
                            title: item.titulo || item.nombre,
                            price: parseFloat(item.costo) || 0,
                            image: item.url_imagen || item.imagen || MOCK_PHONE_IMG
                        })) : [];
                        renderProductSections();
                    }
                } catch (e) { console.warn("Fallo productos", e); }

                // C. BANNERS
                try {
                    const resBanners = await fetch(`${API_BASE_URL}/obtener_anuncios.php`);
                    if(resBanners.ok) {
                        const data = await resBanners.json();
                        state.banners = Array.isArray(data.anuncios_activos) ? data.anuncios_activos.map(item => ({
                            id: item.anuncio_id || item.id,
                            imageUrl: item.url_imagen || item.imagen,
                            title: item.titulo || '',
                            subtitle: item.mensaje || ''
                        })) : [];
                        renderBanners();
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
                        <img src="${product.image}" class="card-image" onerror="this.src='${MOCK_PHONE_IMG}'">
                        <div class="heart-icon"><ion-icon name="heart-outline"></ion-icon></div>
                    </div>
                    <div class="card-title">${product.title}</div>
                    <div class="card-price">$${product.price.toLocaleString()}</div>
                    <button class="add-button" onclick="handleAddToCart('${product.title}')">Ver detalles</button>
                </div>
            `;
        }

        function renderProductSections() {
            const ofertas = state.productos.slice(0, 4);
            const recomendados = state.productos.slice(4, 8);
            // Simular nuevos tomando otros o los mismos si hay pocos
            const nuevos = state.productos.length > 8 ? state.productos.slice(8, 12) : state.productos.slice(0, 4);

            document.getElementById('ofertas-grid').innerHTML = ofertas.map(createProductCardHTML).join('');
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

        // --- 5. EVENTOS ---
        function handleSearch() {
            const text = document.getElementById('search-input').value;
            if (text.trim()) alert(`Buscando: ${text}`);
        }

        function handleAddToCart(title) {
            alert(`Agregado: ${title}`);
        }

        function navigateTo(path) {
            console.log("Navegando a:", path);
            window.location.href = path; // O la lógica que prefieras
        }

    </script>
</body>
</html>