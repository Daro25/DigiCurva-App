<?php
if(!isset($_COOKIE['token'])){
    //echo "<script>alert('".$_COOKIE['token']."'); window.location.href = '/login';</script>";
    header("Location: login.html");
    exit();
}
function imprime ($value) : string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); // técnica maldita anti hackers "bloqueo XXS"
}
// 1. Leer y decodificar el archivo JSON desde el servidor
$rutaConfig = 'config.json?v=1.0';
$configures = [];

if (file_exists($rutaConfig)) {
    $contenido = file_get_contents($rutaConfig);
    $configures = json_decode($contenido, true) ?: [];
}

// 2. Definir la URL base con un valor por defecto si no existe en el JSON
$defaultUrl = 'http://localhost:80/DigiCurvaServer/'; // 'https://ljusstudie.site/DigiCurvaServer';
$apiBaseUrl = !empty($configures['base_url']) ? $configures['base_url'] : $defaultUrl;
// URL de la API
$apiUrlperfil = $apiBaseUrl . 'obtener_perfil.php';
$cookieName = 'token'; // Cambia esto a tu nombre de cookie
$cookieValue = $_COOKIE[$cookieName];
// Configuración de curl
$ch = curl_init();

// Establecer la URL
curl_setopt($ch, CURLOPT_URL, $apiUrlperfil);

// Configurar curl para devolver el contenido del servidor en lugar de imprimirlo
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Configurar curl para enviar la cookie
curl_setopt($ch, CURLOPT_COOKIE, $cookieName . '=' . urlencode($cookieValue));
// Ejecutar la petición
$response_perfil = curl_exec($ch);
// Verificar si la petición fue exitosa
if ($response_perfil === false) {
    echo 'Error al realizar la petición HTTP';
    exit;
}
// Parsear la respuesta como JSON
$data_perfil = json_decode($response_perfil, true);
// Verificar si la respuesta es un array asociativo (true)
if (is_array($data_perfil)) {
    // Acceder a los datos del JSON
    $perfil = $data_perfil['perfil'];
    $solicitudes_compra = $data_perfil['solicitudes'];
} else {
    echo 'Respuesta no válida como JSON';
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet">
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
            --bg-checkout: #f9fafb;
            --border-checkout: #e5e7eb;
            --primary-blue: #3b82f6;
            --dark-blue: #1d4ed8;
        }

        /* --- PANTALLA DE CARGA --- */
        #loading-screen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: white;
            display: none;/* iniciando en flex */
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

        .header-top .user-info { display: flex; align-items: center; }
        .header-top .user-name > a { font-size: 12px; font-weight: bold; color: #fff; display: block; text-decoration: none; }

        .avatar {
            width: 32px; height: 32px;
            border-radius: 50%;
            margin-right: 8px;
            border: 2px solid #fff;
            background-color: #ccc;
            object-fit: cover;
        }
        .user-details { display: none; } /* Oculto en móvil por defecto */
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
            max-width: 300px;
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
    </style>
    <script>
        var configures = <?php echo json_encode($configures, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;
        var API_BASE_URL = <?php echo json_encode($apiBaseUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;
        // EVENTOS
        function handleSearch() {
            const text = document.getElementById('search-input').value;
            if (text.trim()) {
                window.location.href = `?page=search&search=${encodeURIComponent(text)}`;
            }
        }
        
        function handleAddToCart() {
            window.location.href = `?page=carrito`;
        }

        function navigateTo(path) {
            console.log("Navegando a:", path);
            window.location.href = path; // O la lógica que prefieras
        }
        function handleToProduct(parameter) {
            let param1 = encodeURIComponent(parameter);
            let param2 = encodeURIComponent(empaquetado(state.userProfile));
            window.location.href = `?page=producto&product=${param1}&user=${param2}`;
        }
        function empaquetado(producto) {
            let product = JSON.stringify(producto);
            let base64Product = btoa(product);
            return base64Product.toString();
        }
    </script>
</head>
<body>
    <!-- spinner loading -->
    <div id="loading-screen">
        <div class="spinner"></div>
        <p style="margin-top: 10px; color: #666;">Cargando DigiCurva...</p>
    </div>

    <div id="app-container" style="display: block;"><!-- iniciando en none -->
        <!-- encabezado de pagina -->
        <header class="header-background">
            <div class="header-container">
                <div class="content-wrapper">
                    <div class="header-top">
                        <div class="logo-group">
                            <img src="assets/icon.png" class="logo-img" alt="Logo">
                            <span class="logo-text">DigiCurva</span>
                        </div>
                        <div class="spacer"></div>
                        <div class="user-info animate__animated" id="user-animated">
                            <img id="user-avatar" src="<?= $perfil['foto_perfil_url']; ?>" class="avatar" onclick="window.location.href='./?page=user'" alt="Avatar">
                            <div class="user-details">
                                <span class="user-name"><a id="user-name" href="./?page=user"><?= $perfil['nombre']; ?></a></span>
                                <span class="user-link">Ajustes</span>
                            </div>
                        </div>
                    </div>

                    <div class="nav-bar">
                        <div class="nav-content">
                            <ion-icon name="menu" class="menu-icon"></ion-icon>
                            
                            <div class="nav-links">
                                <a href="./?page=home">
                                <ion-icon name="home-outline" style="color:white; font-size:20px; display: <?php
                                $page = filter_input(INPUT_GET,'page',FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                                if (!$page || $page == 'home') echo 'none';
                                else echo 'block';
                                ?>;"></ion-icon></a>
                                <a class="nav-link-text">Ofertas</a>
                                <a class="nav-link-text">Nuevo</a>
                                <a class="nav-link-text">Más vendido</a>
                                <div style="display:flex; align-items:center;">
                                    <a class="nav-link-text">Categorías</a>
                                    <ion-icon name="caret-down" style="font-size:12px; color:white; margin-left:4px;"></ion-icon>
                                </div>
                            </div>

                            <div class="search-container">
                                <input type="text" id="search-input" class="search-input" placeholder="Buscar" onchange="handleSearch()">
                                <ion-icon name="search" style="font-size:20px; color:black; cursor:pointer;" onclick="handleSearch()"></ion-icon>
                            </div>

                            <div class="header-icons">
                                <button class="header-icon-btn"><ion-icon name="heart-outline"></ion-icon></button>
                                <button class="header-icon-btn" onclick="handleAddToCart(title)"><ion-icon name="cart-outline"></ion-icon></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <!-- cuerpo -->
        <?php 
        $page = filter_input(INPUT_GET,'page',FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if ($page) {
            switch ($page) {
                case 'home':
                    include './main/index.php';
                    break;
                case 'user':
                    include './main/perfil.php';
                    break;
                case 'anuncio':
                    include './Anuncio.html';
                    break;
                case 'carrito':
                    include './main/carrito.php';
                    break;
                case 'search':
                    include './main/search.php';
                    break;
                case 'producto':
                    include './main/producto.php';
                    break;
                default:
                    include './main/index.php';
                    break;
            }
        } else {
            include './main/index.php';
        }
        
        ?>
        <!-- pie de pagina -->
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
</body>
</html>