// Cart array to store selected items
let cart = [];
let currentProductModal = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    setupEventListeners();
    loadCartFromStorage();
});

// Display products in grid
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price.toLocaleString('ar-SA')} ريال</div>
                <div class="product-actions">
                    <button class="btn-view" data-id="${product.id}">عرض التفاصيل</button>
                    <button class="btn-buy" data-id="${product.id}">شراء</button>
                </div>
            </div>
        `;

        // View details button
        productCard.querySelector('.btn-view').addEventListener('click', () => {
            showProductModal(product);
        });

        // Direct buy button (quick add to cart)
        productCard.querySelector('.btn-buy').addEventListener('click', () => {
            addToCart(product, 1);
        });

        productsGrid.appendChild(productCard);
    });
}

// Show product detail modal
function showProductModal(product) {
    currentProductModal = product;
    const modal = document.getElementById('productModal');
    
    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductDesc').textContent = product.description;
    document.getElementById('modalProductPrice').textContent = `${product.price.toLocaleString('ar-SA')} ريال`;
    document.getElementById('quantityInput').value = '1';
    
    modal.classList.remove('hidden');
}

// Add product to cart
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    
    // Close modal if open
    document.getElementById('productModal').classList.add('hidden');
    
    // Show success message
    showNotification(`تم إضافة ${product.name} إلى السلة`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    displayCartItems();
}

// Update item quantity in cart
function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCartToStorage();
        displayCartItems();
    }
}

// Display cart items in modal
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p style="font-size: 18px; margin-bottom: 20px;">🛒</p>
                <p>السلة فارغة</p>
                <p style="font-size: 12px; color: #ccc; margin-top: 10px;">أضف بعض المنتجات لبدء التسوق</p>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString('ar-SA')} ريال</div>
                <div class="cart-item-qty">
                    الكمية: <strong>${item.quantity}</strong>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">حذف</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

// Calculate total price
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update total price display
function updateTotalPrice() {
    const total = calculateTotal();
    document.getElementById('totalPrice').textContent = `${total.toLocaleString('ar-SA')} ريال`;
}

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Generate WhatsApp message
function generateWhatsAppMessage() {
    let message = '*طلب جديد من موماكس*\n\n';
    message += '📦 *تفاصيل الطلب:*\n';
    message += '━━━━━━━━━━━━━━━━━━━\n';
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   💰 السعر: ${item.price.toLocaleString('ar-SA')} ريال\n`;
        message += `   📊 الكمية: ${item.quantity}\n`;
        message += `   💵 الإجمالي: ${(item.price * item.quantity).toLocaleString('ar-SA')} ريال\n\n`;
    });
    
    message += '━━━━━━━━━━━━━━━━━━━\n';
    message += `🧾 *الإجمالي النهائي: ${calculateTotal().toLocaleString('ar-SA')} ريال*\n`;
    message += '━━━━━━━━━━━━━━━━━━━';
    
    return message;
}

// Send order to WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('السلة فارغة! أضف بعض المنتجات أولاً');
        return;
    }
    
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '967772748881'; // WhatsApp number without + symbol
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('momax-cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('momax-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        background: linear-gradient(135deg, #4A2573, #6B3FA0);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 2000;
        animation: slideInUp 0.3s ease;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Cart icon
    document.getElementById('cart-icon').addEventListener('click', () => {
        displayCartItems();
        updateTotalPrice();
        document.getElementById('cartModal').classList.remove('hidden');
    });
    
    // Close cart modal
    document.getElementById('closeCart').addEventListener('click', () => {
        document.getElementById('cartModal').classList.add('hidden');
    });
    
    // Close product modal
    document.getElementById('closeProduct').addEventListener('click', () => {
        document.getElementById('productModal').classList.add('hidden');
    });
    
    // Add to cart from modal
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantityInput').value);
        addToCart(currentProductModal, quantity);
    });
    
    // Quantity controls
    document.getElementById('increaseQty').addEventListener('click', () => {
        const input = document.getElementById('quantityInput');
        input.value = parseInt(input.value) + 1;
    });
    
    document.getElementById('decreaseQty').addEventListener('click', () => {
        const input = document.getElementById('quantityInput');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', sendToWhatsApp);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        const cartModal = document.getElementById('cartModal');
        const productModal = document.getElementById('productModal');
        
        if (event.target === cartModal) {
            cartModal.classList.add('hidden');
        }
        if (event.target === productModal) {
            productModal.classList.add('hidden');
        }
    });
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);