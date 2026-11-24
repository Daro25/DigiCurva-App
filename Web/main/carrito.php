<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carrito - DigiCurva</title>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

    <style>
        /* Columna Izquierda (Items) */
        .cart-column { width: 65%; background: #fff; padding: 30px; display: flex; flex-direction: column; align-items: center; }
        .column-content { width: 100%; max-width: 800px; }
        .section-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }

        .cart-item { display: flex; align-items: center; margin-bottom: 20px; position: relative;}
        .item-img-container {
            width: 100px; height: 100px; background: #fff; border-radius: 8px; padding: 5px; margin-right: 20px;
            border: 1px solid #f3f4f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .item-img { width: 100%; height: 100%; object-fit: contain; }
        .item-name { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
        .item-price { font-size: 22px; color: #333; }

        /* Columna Derecha (Checkout) */
        .checkout-column {
            width: 35%; background-color: var(--bg-checkout); border-left: 1px solid var(--border-checkout);
            padding: 30px; display: flex; flex-direction: column; align-items: center;
        }

        .total-label { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .total-amount { font-size: 36px; color: #333; margin-bottom: 30px; font-weight: 400; }

        .payment-header { display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 20px; }
        .payment-title { font-size: 20px; font-weight: bold; }

        /* Opciones de Pago */
        .payment-option {
            display: flex; justify-content: space-between; align-items: center; width: 100%;
            padding: 15px 0; cursor: pointer; user-select: none;
        }
        .payment-text h4 { font-size: 16px; font-weight: 500; color: #333; margin-bottom: 2px; }
        .payment-text p { font-size: 14px; color: #666; }

        /* Radio Button Custom */
        .radio-outer {
            width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--primary-blue);
            background: #fff; display: flex; justify-content: center; align-items: center;
        }
        .radio-inner {
            width: 14px; height: 14px; border-radius: 50%; background: var(--dark-blue); display: none;
        }
        .payment-option.selected .radio-outer { border-color: var(--dark-blue); }
        .payment-option.selected .radio-inner { display: block; }

        /* Botón Pagar */
        .pay-btn {
            margin-top: 40px; width: 100%; background-color: var(--dark-blue); color: #fff;
            padding: 15px; border: none; border-radius: 8px; font-size: 18px; font-weight: bold;
            cursor: pointer; box-shadow: 0 4px 5px rgba(29, 78, 216, 0.3); transition: opacity 0.2s;
            display: flex; justify-content: center; align-items: center;
        }
        .pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* --- RESPONSIVE --- */
        @media (max-width: 900px) {
            .main-layout { flex-direction: column; }
            .cart-column, .checkout-column { width: 100%; border-left: none; }
            .search-bar, .user-name, .user-link { display: none; } /* Ocultar en móvil similar a RN */
        }
        .cart-item>div>input[type="checkbox"]{
            position: absolute;
            width: 20px;
            height: 20px;
            right: 15%;
        }
    </style>
</head>
<body>
        <main class="main-layout">
            
            <div class="cart-column">
                <div class="column-content">
                    <div class="section-title">Carrito de compras</div>
                    <div id="total-amount">Todo el carrito cuesta $0.00</div>
                    <div id="cart-items-container"></div>
                </div>
            </div>

            <div class="checkout-column">
                <div class="column-content">
                    <div class="total-label">Total</div><br>
                    <div class="total-amount" id="total-selected">$0.0</div>

                    <div class="payment-header">
                        <div class="payment-title">Metodo de pago</div>
                        <ion-icon name="add" style="font-size: 24px; color: #555;"></ion-icon>
                    </div>

                    <div class="payment-option" id="opt-coins" onclick="selectPayment('coins')">
                        <div class="payment-text">
                            <h4>Usar saldo de cuenta</h4>
                        </div>
                        <div class="radio-outer"><div class="radio-inner"></div></div>
                    </div>

                    <div class="payment-option selected" id="opt-card" onclick="selectPayment('card')">
                        <div class="payment-text">
                            <h4>SANTANDER</h4>
                            <p>XXXX-XXXX-XXXX-XXX</p>
                        </div>
                        <div class="radio-outer"><div class="radio-inner"></div></div>
                    </div>

                    <div class="payment-option" id="opt-cash" onclick="selectPayment('cash')">
                        <div class="payment-text">
                            <h4>Pago en efectivo</h4>
                        </div>
                        <div class="radio-outer"><div class="radio-inner"></div></div>
                    </div>

                    <button class="pay-btn" id="pay-btn" onclick="processPayment()">
                        <span id="btn-text">Finalizar Compra</span>
                        <div id="btn-spinner" class="spinner" style="width: 20px; height: 20px; border-width: 2px; border-top-color: #fff; display: none;"></div>
                    </button>
                </div>
            </div>
        </main>

    <script>
        async function cargarConfiguracion() {
        const respuesta = await fetch('config.json');
        const config = await respuesta.json();
        return config;
    }

    var configures = [];
        var API_BASE_URL = 'http://xampp.local/DigiCurvaServer/'//'https://ljusstudie.site/DigiCurvaServer';
        const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';
        const MOCK_PHONE_IMG = 'https://via.placeholder.com/300x300.png?text=Sin+Imagen';
        const MOCK_CART_ITEMS = [
            {
                id: '0',
                name: '00000',
                price: 0.00,
                quantity: 0,
                sku: '0000',
                image: MOCK_PHONE_IMG
            }
        ];
        
        // ESTADO
        var cartItems = [];
        var userProfile = null;
        var paymentMethod = 'card';
        var isProcessing = false;
        var total = 0;
        var tipoPago = 'card';

        // --- 1. INICIALIZACIÓN ---
        window.addEventListener('load', () => {
            initApp();
        });

        async function initApp() {
            // Esperar 3 segundos (Lógica visual solicitada)
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Cargar datos
            await fetchRemoteData();
            // Ocultar loading y mostrar app
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }
        async function fetchRemoteData() {
            
                configures = await cargarConfiguracion();
                API_BASE_URL = configures.base_url || API_BASE_URL;
            try {
                // A. PERFIL
                try {
                    const resPerfil = await fetch(`${API_BASE_URL}obtener_perfil.php`);
                    if(resPerfil.ok) {
                        const data = await resPerfil.json();
                        userProfile = {
                            nombre: data.perfil?.nombre || 'Usuario',
                            avatar: data.perfil?.foto_perfil_url || DEFAULT_AVATAR
                        };
                        updateHeaderUI();
                    }
                } catch (e) { console.warn("Fallo perfil", e); }

                // B. PRODUCTOS
                try {
                    const resProd = await fetch(`${API_BASE_URL}obtener_carrito.php`);
                    if(resProd.ok) {
                        const data = await resProd.json();
                        // Mapeo
                        cartItems = Array.isArray(data.carrito) ? data.carrito.map(item => ({
                            id: item.producto_id || '0',
                            name: item.nombre || 'Producto sin nombre',
                            price: parseFloat(item.precio) || 0.00,
                            quantity: item.cantidad || 1,
                            sku: item.sku || '0000',
                            image: item.imagen_url || 'https://via.placeholder.com/150'
                        })) : [];
                        if (cartItems.length === 0) {
                            // Si MOCK_CART_ITEMS ya es un objeto, úsalo en un array [item]
                            // Si es un array, úsalo directamente. Supongamos que es un objeto:
                            cartItems = Array.isArray(MOCK_CART_ITEMS) ? MOCK_CART_ITEMS : [MOCK_CART_ITEMS];
                        }
                        renderCart();
                        calculateTotal();
                        console.log(cartItems);
                    }
                } catch (e) { console.warn("Fallo productos", e.message); }
            } catch (error) {
                console.error("Error general:", error);
            }
        }

        // RENDERIZADO
        function updateHeaderUI() {
            if (userProfile) {
                document.getElementById('user-name').textContent = userProfile.nombre;
                document.getElementById('user-avatar').src = userProfile.avatar;
            } else {
                document.getElementById('user-avatar').src = DEFAULT_AVATAR;
            }
        }
        function renderCart() {
            const container = document.getElementById('cart-items-container');
            container.innerHTML = cartItems.map(item => `
                <div class="cart-item">
                    <div class="item-img-container">
                        <img src="${item.image}" class="item-img" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">$${(Number(item.price) * Number(item.quantity))}</div>
                        <div class="item-count">por ${item.quantity} seleccionados.</div>
                    </div>
                    <div>
                        <input type="number" value="${(Number(item.price) * Number(item.quantity))}"
                        hidden = "true">
                        <input type="checkbox" checked onchange="addSumahandle(this)">
                    </div>
                </div>
            `).join('');
        }

        function calculateTotal() {
            total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById('total-amount').textContent = 'Todo el carro cuesta $' + total;
            sumaSelected(total);
        }

        // INTERACCIÓN
        function selectPayment(method) {
            paymentMethod = method;
            tipoPago = method;
            // Actualizar UI
            document.getElementById('opt-card').classList.remove('selected');
            document.getElementById('opt-cash').classList.remove('selected');
            
            document.getElementById(`opt-${method}`).classList.add('selected');
        }

        async function processPayment() {
            if (isProcessing) return;
            isProcessing = true;
            toggleButtonLoading(true);

            try {
                const baseUrl = 'https://tu-api.com/checkout';
                const itemIds = cartItems.map(i => i.id).join(',');

                // Construcción de Query Params (Requisito clave)
                const params = new URLSearchParams({
                    amount: total.toString(),
                    currency: 'MXN',
                    payment_method: paymentMethod,
                    items: itemIds,
                    user_id: 'usr_naomi_123'
                });

                const finalUrl = `${baseUrl}?${params.toString()}`;
                console.log(`[POST Request] Enviando a: ${finalUrl}`);

                // Simulación de espera de red
                await new Promise(resolve => setTimeout(resolve, 1500));

                const alertMsg = `Orden Procesada.\n\nMétodo: ${paymentMethod.toUpperCase()}\nTotal: $${total}\nURL: ${finalUrl}`;
                alert(alertMsg);

            } catch (error) {
                console.error(error);
                alert("Error al procesar el pago");
            } finally {
                isProcessing = false;
                toggleButtonLoading(false);
            }
        }

        function toggleButtonLoading(isLoading) {
            const btn = document.getElementById('pay-btn');
            const text = document.getElementById('btn-text');
            const spinner = document.getElementById('btn-spinner');

            if (isLoading) {
                btn.disabled = true;
                text.style.display = 'none';
                spinner.style.display = 'block';
            } else {
                btn.disabled = false;
                text.style.display = 'block';
                spinner.style.display = 'none';
            }
        }
        function sumaSelected(num) {
            const totalDiv = document.getElementById('total-selected');
            const total = Number(totalDiv.innerText.substring(1));
            const message = document.getElementById('total-amount');
            totalDiv.innerText = '$'+(total + num);
            message.innerText = 'Lo seleccionado cuesta $'+(total + num);
        }
        function addSumahandle(check){
            const precio = check.previousElementSibling.value;
            if (check.checked) {
                sumaSelected(+precio);
            }else{
                sumaSelected(-precio);
            }
        }
    </script>
</body>
</html>