    <style>
        /* --- CONTENEDOR PRINCIPAL --- */
        .main-container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 1.2fr 1fr; /* Izquierda un poco más ancha */
            gap: 60px;
        }

        /* --- COLUMNA IZQUIERDA (Info) --- */
        .product-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 20px;
        }

        .prod-title { font-size: 36px; font-weight: 700; line-height: 1.2; margin-bottom: 5px; }
        .prod-subtitle { font-size: 20px; color: #333; font-weight: 400; margin-bottom: 15px; }
        
        .prod-price { font-size: 48px; font-weight: 300; color: #333; margin-bottom: 5px; }
        .shipping-tag { font-size: 20px; color: #333; font-weight: 400; }

        .like-btn {
            background: none; border: none; cursor: pointer;
            font-size: 40px; color: #000;
            margin-top: 10px;
        }

        /* Descripción */
        .section-header { font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 15px; }
        
        .description-box {
            border: 1px solid #888;
            border-radius: 12px;
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
        }

        /* Reseñas */
        .reviews-container { margin-top: 20px; }
        
        .stars-row {
            display: flex; gap: 5px; color: var(--star-color); font-size: 24px; margin-bottom: 20px;
        }

        .rating-bars { display: flex; flex-direction: column; gap: 12px; max-width: 400px; }
        
        .bar-row { display: flex; align-items: center; gap: 15px; }
        .stars-label { display: flex; gap: 2px; color: var(--star-color); font-size: 14px; width: 80px; }
        
        .progress-track {
            flex: 1; height: 12px;
            border: 1px solid #000; border-radius: 10px;
            background: transparent;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%; background-color: #000; border-radius: 10px;
        }
        
        .count-label { width: 30px; text-align: right; font-weight: 500; font-size: 14px; }


        /* --- COLUMNA DERECHA (Imágenes y Acciones) --- */
        .gallery-container {
            display: flex; flex-direction: column; gap: 20px;
        }

        .main-image-card {
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 40px;
            display: flex; justify-content: center; align-items: center;
            height: 500px; /* Altura fija para estabilidad */
            background: #fff;
        }
        .main-img {
            max-width: 100%; max-height: 100%; object-fit: contain;
            transition: opacity 0.3s;
        }

        .thumbnails-row {
            display: flex; gap: 15px; justify-content: flex-start;
        }
        .thumb-box {
            width: 70px; height: 80px;
            border: 1px solid #ccc; border-radius: 8px;
            padding: 5px; cursor: pointer;
            display: flex; justify-content: center; align-items: center;
            transition: border-color 0.2s;
        }
        .thumb-box:hover, .thumb-box.active { border-color: var(--primary-blue); border-width: 2px; }
        .thumb-img { max-width: 100%; max-height: 100%; object-fit: contain; }

        /* Botones de Compra */
        .actions-col {
            margin-top: 30px;
            display: flex; flex-direction: column; gap: 15px;
        }

        .btn-buy {
            width: 100%; padding: 15px;
            border-radius: 6px; border: none;
            font-size: 18px; font-weight: 700; cursor: pointer;
            transition: opacity 0.2s;
        }
        .btn-primary { background-color: var(--primary-blue); color: white; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); }
        .btn-secondary { background-color: var(--secondary-grey); color: #333; }
        
        .btn-buy:hover { opacity: 0.9; }
        iframe {
            position: fixed; top: 50%; 
            left: 50%; 
            display: block; 
            overflow: hidden;
            background-color: white; 
            border-radius: 20px; 
            box-shadow: 0 8px 10px rgba(0, 0, 0, 0.199);
            transform: translate(-50%, -50%); 
            z-index: 100;
            height: 321px;
            width: 361px;
        }
        .modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5); /* Fondo semitransparente */
            display: none; /* Oculto por defecto */
            justify-content: center; align-items: center;
            z-index: 99;
        }
        /* Responsive */
        @media (max-width: 900px) {
            .main-container { grid-template-columns: 1fr; gap: 40px; }
            .product-header { flex-direction: column; }
            .like-btn { position: absolute; right: 20px; top: 100px; } /* Ajuste simple móvil */
            .rating-bars { max-width: 100%; }
        }
    </style>
    <div class="main-container">

        <div class="product-info-col">
            
            <div class="product-header">
                <div>
                    <h1 class="prod-title" id="product-title">Samsung Galaxy A36 5G</h1>
                    <div class="prod-subtitle">Nuevo</div>
                    <div class="prod-price" id="product-price">$4,500</div>
                    <div class="shipping-tag" id="product-exist">Solo queda 1</div>
                </div>
                <button class="like-btn" onclick="toggleHeart(this)">
                    <ion-icon name="heart-outline"></ion-icon>
                </button>
            </div>

            <h2 class="section-header">Descripción</h2>
            <div class="description-box" id="product-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et lorem vestibulum, ultricies lacus a, euismod risus. Quisque lacinia augue arcu, sed ullamcorper nisl ultricies sed. Praesent mattis, lorem ac convallis interdum, augue eros dapibus ante, vitae efficitur diam libero vel leo. Maecenas luctus, dolor sit amet suscipit efficitur, nisl magna congue lacus, et posuere velit ligula ac urna. Curabitur sit amet justo sit amet ipsum egestas viverra. Morbi non dolor libero. Praesent at feugiat neque. Nulla.
            </div>
            <div class="actions-col">
                <button class="btn-buy btn-primary" onclick="buyNow()">Comprar ahora</button>
                <button class="btn-buy btn-secondary" onclick="addToCart()">Añadir al carro</button>
            </div>
        </div>

        <div class="product-gallery-col">
            
            <div class="gallery-container">
                <div class="main-image-card">
                    <img id="mainImage" src="https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgaltm/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgaltm-536063688?$684_547_PNG$" class="main-img">
                </div>
            </div>
            <h2 class="section-header">Reseñas</h2>
            <div class="reviews-container">
                <div class="stars-row">
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star-half"></ion-icon>
                </div>

                <div class="rating-bars">
                    <div class="bar-row">
                        <div class="stars-label">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width: 75%;"></div></div>
                        <div class="count-label">37</div>
                    </div>
                    <div class="bar-row">
                        <div class="stars-label">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width: 50%;"></div></div>
                        <div class="count-label">25</div>
                    </div>
                    <div class="bar-row">
                        <div class="stars-label">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width: 10%;"></div></div>
                        <div class="count-label">3</div>
                    </div>
                    <div class="bar-row">
                        <div class="stars-label">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width: 15%;"></div></div>
                        <div class="count-label">4</div>
                    </div>
                    <div class="bar-row">
                        <div class="stars-label">
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width: 25%;"></div></div>
                        <div class="count-label">13</div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="modal" onclick="exitModal()">
        <iframe src="addCart.html" id="addCart1" frameborder="0"></iframe>
    </div>
    <script>
        // --- 1. INICIALIZACIÓN ---
        window.addEventListener('load', () => {
            initApp();
        });
        var producto;
        function initApp() {
            producto = getProductFromURL();
            if (producto) {
                RenderData(producto);
            } else {
                console.warn("No se pudo cargar el producto desde la URL.");
            }
        }
        function getProductFromURL() {
            try {
                // 1. Obtener el parámetro 'product' de la URL
                const urlParams = new URLSearchParams(window.location.search);
                const param = urlParams.get('product');
                if (!param) return null;
                // 2. Decodificar el componente de la URL (deshace el encodeURIComponent)
                const decodedParam = decodeURIComponent(param);
                // 3. Decodificar de Base64 a texto (deshace el btoa)
                const jsonString = atob(decodedParam);
                // 4. Convertir el texto JSON de nuevo a objeto (deshace el stringify)
                return JSON.parse(jsonString);
            } catch (error) {
                console.error("Error al desempaquetar el producto:", error);
                return null;
            }
        }
        function RenderData(producto) {
            if (producto.tipe == 'ambulante') {
                var activo = producto.activo == 1 ? true : false;console.log(activo);
                
                document.getElementById('product-title').textContent = producto.title;
                document.getElementById('product-price').textContent = `$${producto.price}`;
                document.getElementById('product-description').textContent = producto.descripcion;
                document.getElementById('product-exist').textContent = 'hasta que el vendedor se quede sin stock \no decida retirar el producto, actualmente ' + (activo ? 'está en '+producto.ubicacion : 'no está disponible.');
                document.getElementById('mainImage').src = producto.image; // Asumiendo que 'images' es un array de URLs
                return;
            }
            document.getElementById('product-title').textContent = producto.title;
            document.getElementById('product-price').textContent = `$${producto.price}`;
            document.getElementById('product-description').textContent = producto.descripcion;
            document.getElementById('product-exist').textContent = producto.existencia > 0 ? `Solo quedan ${producto.existencia}` : 'Agotado';
            document.getElementById('mainImage').src = producto.image; // Asumiendo que 'images' es un array de URLs
        }
        function RenderUser(user) {
            document.getElementById('user-name').querySelector('span').textContent = user.nombre;
            document.getElementById('user-avatar').src = user.avatar;
        }
        // Lógica de Galería
        function changeImage(element, src) {
            // Animación suave
            const mainImg = document.getElementById('mainImage');
            mainImg.style.opacity = 0;
            
            setTimeout(() => {
                mainImg.src = src;
                mainImg.style.opacity = 1;
            }, 200);

            // Active state
            document.querySelectorAll('.thumb-box').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        // Lógica Favoritos
        function toggleHeart(btn) {
            const icon = btn.querySelector('ion-icon');
            if (icon.name === 'heart-outline') {
                icon.name = 'heart';
                icon.style.color = '#e91e63';
            } else {
                icon.name = 'heart-outline';
                icon.style.color = '#000';
            }
        }

        // Acciones de Compra
        function buyNow() {
            alert("Iniciando proceso de compra...");
            window.location.href = 'carrito.html'; // Próxima pantalla lógica
        }

        function addToCart() {
            const iframe =
            document.getElementById('addCart1');
            const url = ToCard(producto);
            iframe.src = url;
            const modal = document.querySelector('.modal');
            modal.style.display = 'flex';
        }

        function ToCard() {
            const urlParams = new URLSearchParams(window.location.search);
            const param = urlParams.get('product');
            return `addCart.html?product=${param}`;
        }
        function exitModal() {
            const modal = document.querySelector('.modal');
            modal.style.display = 'none';
        }
  window.addEventListener("message", function(event) {
    // Opcional: validar el origen con event.origin
    if (event.data.type === "carrito_actualizado") {
      console.log("El carrito fue actualizado:", event.data.data);
      // Aquí puedes actualizar tu UI, mostrar un contador, etc.
      exitModal(); // Cerrar el modal después de agregar al carrito
    }
  });

    </script>