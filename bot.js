// ==========================================
// 🤖 BOT MINI APP - TELEGRAM & WHATSAPP
// ==========================================

// Configuration
const BOT_CONFIG = {
  telegramToken: '8640794661:AAFgJuB94wZuJtf6j9QJcT_a6BqFP_fQg5k',
  apiUrl: 'https://web-production-6ccec.up.railway.app/',
  catalogUrl: 'https://tutuduanyu.org/georgemoula00000',
  telegramChannel: 'https://t.me/+nLDghA-4yIU1MTk0',
  whatsappNumber: '0749657430',
  telegramBot: 'https://t.me/telegrampotato'
};

// Initialize Telegram WebApp
let tg = window.Telegram?.WebApp;

if (tg) {
  tg.expand();
  tg.ready();
  
  // Apply Telegram theme colors
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e');
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
  document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#aaaaaa');
  
  // Show back button
  if (tg.BackButton && tg.BackButton.show) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      window.location.href = 'index.html';
    });
  }
}

// ==========================================
// 📱 STATE MANAGEMENT
// ==========================================
let currentPlatform = 'telegram'; // 'telegram' or 'whatsapp'
let selectedCategory = 'all';
let cart = [];
let userMessages = [];

// ==========================================
// 🎨 PLATFORM DETECTION
// ==========================================
function detectPlatform() {
  const urlParams = new URLSearchParams(window.location.search);
  const platform = urlParams.get('platform');
  
  if (platform === 'whatsapp') {
    currentPlatform = 'whatsapp';
    document.body.classList.add('whatsapp-mode');
  } else {
    currentPlatform = 'telegram';
    document.body.classList.add('telegram-mode');
  }
  
  updatePlatformUI();
}

// ==========================================
// 🎯 PLATFORM UI UPDATES
// ==========================================
function updatePlatformUI() {
  const header = document.querySelector('.bot-header');
  const platformIcon = document.querySelector('.platform-icon');
  const platformName = document.querySelector('.platform-name');
  
  if (currentPlatform === 'telegram') {
    platformIcon.textContent = '✈️';
    platformName.textContent = 'Telegram Bot';
    header.style.background = 'linear-gradient(135deg, #0088cc, #005580)';
  } else {
    platformIcon.textContent = '💬';
    platformName.textContent = 'WhatsApp Bot';
    header.style.background = 'linear-gradient(135deg, #25d366, #128c7e)';
  }
}

// ==========================================
// 🛒 CART FUNCTIONS
// ==========================================
function addToCart(productId, productName, price) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: price,
      quantity: 1
    });
  }
  
  updateCartUI();
  showNotification(`${productName} ajouté au panier! 🛒`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total');
  const cartItems = document.querySelector('.cart-items');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace('€', '')) * item.quantity), 0);
  
  cartCount.textContent = totalItems;
  cartTotal.textContent = `${totalPrice.toFixed(2)}€`;
  
  // Update cart items list
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-details">
        <span class="cart-item-quantity">x${item.quantity}</span>
        <span class="cart-item-price">${item.price}</span>
        <button class="remove-item" onclick="removeFromCart(${item.id})">❌</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 💬 CHAT FUNCTIONS
// ==========================================
function sendMessage() {
  const messageInput = document.querySelector('.message-input');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  // Add message to chat
  addMessageToChat('user', message);
  messageInput.value = '';
  
  // Simulate bot response
  setTimeout(() => {
    const response = generateBotResponse(message);
    addMessageToChat('bot', response);
  }, 1000);
}

function addMessageToChat(sender, message) {
  const chatMessages = document.querySelector('.chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  messageElement.innerHTML = `
    <div class="message-content">${message}</div>
    <div class="message-time">${time}</div>
  `;
  
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  userMessages.push({ sender, message, time });
}

function generateBotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif')) {
    return '🏷️ Nos prix varient selon les produits :\n\n💨 Billets : 300€ - 2500€\n🚬 Stup : 100€ - 5000€\n\nPour voir tous les prix, consultez notre catalogue !';
  }
  
  if (lowerMessage.includes('livraison') || lowerMessage.includes('commande')) {
    return `🚚 Livraison France entière :\n\n• Mondial Relay\n• La Poste\n• Tours : 10h, 14h, 17h\n\nCommandes par :\n📱 WhatsApp : ${BOT_CONFIG.whatsappNumber}\n📡 Signal : +33612345678`;
  }
  
  if (lowerMessage.includes('catalogue') || lowerMessage.includes('produits')) {
    return `📦 Catalogue disponible :\n\n💨 Billets Premium\n🚬 Stup Variétés\n\nVoir le catalogue complet : ${BOT_CONFIG.catalogUrl}`;
  }
  
  return '👋 Bienvenue ! Je suis là pour vous aider. Demandez-moi :\n\n• Les prix 🏷️\n• La livraison 🚚\n• Le catalogue 📦\n• Ou autre chose !';
}

// ==========================================
// 🔔 NOTIFICATIONS
// ==========================================
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ==========================================
// 📱 PLATFORM ACTIONS
// ==========================================
function openTelegramChannel() {
  if (currentPlatform === 'telegram') {
    tg.openTelegramLink(BOT_CONFIG.telegramChannel);
  } else {
    window.open(BOT_CONFIG.telegramChannel, '_blank');
  }
}

function openWhatsApp() {
  const phoneNumber = BOT_CONFIG.whatsappNumber;
  const message = encodeURIComponent('Bonjour ! Je viens du bot et je voudrais commander.');
  
  if (currentPlatform === 'whatsapp') {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  } else {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }
}

function shareProduct(productName, price) {
  const shareText = `🛒 ${productName} - ${price}\n\nDécouvrez nos produits sur le bot !`;
  
  if (currentPlatform === 'telegram' && tg) {
    tg.shareText(shareText);
  } else {
    if (navigator.share) {
      navigator.share({
        title: productName,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showNotification('Lien copié dans le presse-papiers ! 📋');
    }
  }
}

// ==========================================
// 🎯 PRODUCT DISPLAY
// ==========================================
function displayProducts(category = 'all') {
  const productsContainer = document.querySelector('.bot-products');
  const products = [
    { id: 1, name: 'Billet Premium 300€', price: '300€', category: 'billet', image: '1.jpg' },
    { id: 2, name: 'Billet Premium 400€', price: '400€', category: 'billet', image: '1.jpg' },
    { id: 3, name: '💎 SHEESH', price: '250€', category: 'stup', image: 'stup1.jpg' },
    { id: 4, name: '✨CALI CANADIENNE🍁', price: '220€', category: 'stup', image: 'stup2.jpg' }
  ];
  
  const filtered = category === 'all' ? products : products.filter(p => p.category === category);
  
  productsContainer.innerHTML = filtered.map(product => `
    <div class="bot-product-card">
      <img src="${product.image}" alt="${product.name}" class="bot-product-image" onerror="this.src='bg.jpg'">
      <div class="bot-product-info">
        <h4>${product.name}</h4>
        <div class="bot-product-price">${product.price}</div>
        <div class="bot-product-actions">
          <button class="bot-btn primary" onclick="addToCart(${product.id}, '${product.name}', '${product.price}')">
            🛒 Ajouter
          </button>
          <button class="bot-btn secondary" onclick="shareProduct('${product.name}', '${product.price}')">
            📤 Partager
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 🎨 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  detectPlatform();
  updateCartUI();
  displayProducts();
  
  // Setup event listeners
  document.querySelector('.send-btn').addEventListener('click', sendMessage);
  document.querySelector('.message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Category filters
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      displayProducts(category);
      
      // Update active state
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Welcome message
  setTimeout(() => {
    addMessageToChat('bot', '👋 Bienvenue sur notre bot ! Comment puis-je vous aider aujourd\'hui ?');
  }, 1000);
});

// ==========================================
// 📱 TELEGRAM WEBAPP INTEGRATION
// ==========================================
if (tg) {
  // Main button
  tg.MainButton.text = '🛒 Voir le panier';
  tg.MainButton.color = '#0088cc';
  tg.MainButton.textColor = '#ffffff';
  tg.MainButton.show();
  
  tg.MainButton.onClick(() => {
    document.querySelector('.cart-panel').classList.toggle('show');
  });
  
  // Back button
  tg.onEvent('backButtonClicked', () => {
    window.location.href = 'index.html';
  });
}
