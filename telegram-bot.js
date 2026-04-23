// ==========================================
// 🤖 TELEGRAM BOT SERVER
// ==========================================

const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

// Configuration from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Configuration URLs from environment
const CATALOG_URL = process.env.CATALOG_URL;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL;
const MINI_APP_URL = process.env.MINI_APP_URL;

// Middleware
app.use(express.json());

// Products data
const products = [
  { id: 1, name: 'Billet Premium 300€', price: '300€', category: 'billet', description: 'Billet de haute qualité' },
  { id: 2, name: 'Billet Premium 400€', price: '400€', category: 'billet', description: 'Billet de haute qualité' },
  { id: 3, name: 'Billet Premium 500€', price: '500€', category: 'billet', description: 'Billet de haute qualité' },
  { id: 4, name: '💎 SHEESH', price: '250€', category: 'stup', description: 'Qualité premium' },
  { id: 5, name: '✨CALI CANADIENNE🍁', price: '220€', category: 'stup', description: 'Import Canada' },
  { id: 6, name: '👑THE KING FARM\'S👑', price: '170€', category: 'stup', description: 'Top qualité' }
];

// ==========================================
// 📱 TELEGRAM API FUNCTIONS
// ==========================================

async function sendMessage(chatId, text, keyboard = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    const response = await axios.post(`${BOT_URL}/sendMessage`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function sendPhoto(chatId, photoUrl, caption, keyboard = null) {
  try {
    const payload = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      payload.reply_markup = keyboard;
    }

    const response = await axios.post(`${BOT_URL}/sendPhoto`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending photo:', error);
  }
}

// ==========================================
// ⌨️ KEYBOARD LAYOUTS
// ==========================================

function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '� WhatsApp', url: `https://wa.me/${WHATSAPP_NUMBER}` }
      ],
      [
        { text: '🌐 Mini App', web_app: { url: MINI_APP_URL } }
      ],
      [
        { text: '🥔 Potato', url: 'https://t.me/telegrampotato' }
      ],
      [
        { text: '📢 Canal Telegram', url: TELEGRAM_CHANNEL }
      ]
    ]
  };
}

function getCategoryKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💨 Billets', callback_data: 'category_billet' },
        { text: '🚬 Stup', callback_data: 'category_stup' }
      ],
      [
        { text: '📦 Tous les produits', callback_data: 'catalogue' }
      ],
      [
        { text: '🔙 Retour', callback_data: 'back_main' }
      ]
    ]
  };
}

function getProductKeyboard(category) {
  const categoryProducts = products.filter(p => p.category === category);
  const keyboard = categoryProducts.map(product => [{
    text: `${product.name} - ${product.price}`,
    callback_data: `product_${product.id}`
  }]);

  keyboard.push([
    { text: '📦 Voir catalogue complet', callback_data: 'catalogue' },
    { text: '🔙 Retour', callback_data: 'back_main' }
  ]);

  return { inline_keyboard: keyboard };
}

function getContactKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💬 WhatsApp', url: `https://wa.me/${WHATSAPP_NUMBER}` }
      ],
      [
        { text: '📢 Canal Telegram', url: TELEGRAM_CHANNEL }
      ],
      [
        { text: '🌐 Site web', url: CATALOG_URL }
      ],
      [
        { text: '🔙 Retour', callback_data: 'back_main' }
      ]
    ]
  };
}

// ==========================================
// 🎯 COMMAND HANDLERS
// ==========================================

async function handleStart(chatId, firstName = '') {
  const welcomeMessage = `
👋 <b>Bienvenue ${firstName} sur George Moula Bot !</b>

🛍️ <b>Boutique en ligne spécialisée :</b>
• 💨 Billets Premium
• 🚬 Stup Variétés  
• 🚀 Livraison France entière

<b>Choisissez une option ci-dessous 👇</b>
  `;

  await sendMessage(chatId, welcomeMessage, getMainKeyboard());
}

async function handleCatalogue(chatId) {
  const catalogueMessage = `
📦 <b>CATALOGUE COMPLET</b>

💨 <b>BILLETS PREMIUM :</b>
• Billet Premium 300€ - 1500€
• Billet Premium 400€ - 2000€  
• Billet Premium 500€ - 2500€
• Billet Premium 1000€ - 5000€
• Billet Premium 1500€ - 8000€
• Billet Premium 2000€ - 10000€
• Billet Premium 2500€ - 13000€

🚬 <b>STUP VARIÉTÉS :</b>
• 💎 SHEESH - 250€ à 3200€
• ✨CALI CANADIENNE🍁 - 220€ à 5000€
• 👑THE KING FARM'S👑 - 170€ à 4000€
• EXTA🪩 - 100€ à 2700€
• 💎 STATIC NO FARM - 150€ à 3200€
• CALI 100% USA - 250€ à 5000€
• 🧽JAUNE MOUSSEUX - 150€ à 1800€
• 🍫 CALIUS 🇺🇸 - 250€ à 2700€

🌐 <b>Catalogue en ligne :</b>
${CATALOG_URL}

<b>Faites votre choix ci-dessous 👇</b>
  `;

  await sendMessage(chatId, catalogueMessage, getCategoryKeyboard());
}

async function handleCategory(chatId, category) {
  const categoryName = category === 'billet' ? '💨 BILLETS' : '🚬 STUP';
  const categoryProducts = products.filter(p => p.category === category);
  
  let message = `${categoryName}\n\n`;
  categoryProducts.forEach(product => {
    message += `• ${product.name} - ${product.price}\n`;
  });
  
  message += '\n<b>Sélectionnez un produit 👇</b>';
  
  await sendMessage(chatId, message, getProductKeyboard(category));
}

async function handleProduct(chatId, productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const productMessage = `
🛍️ <b>${product.name}</b>

💰 <b>Prix : ${product.price}</b>
📝 <b>Description : ${product.description}</b>
📂 <b>Catégorie : ${product.category === 'billet' ? '💨 Billet' : '🚬 Stup'}</b>

<b>Options disponibles 👇</b>
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🛒 Ajouter au panier', callback_data: `add_${productId}` }
      ],
      [
        { text: '💬 Commander sur WhatsApp', url: `https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour ! Je souhaite commander : ${product.name} - ${product.price}` }
      ],
      [
        { text: '🔙 Retour catégorie', callback_data: `category_${product.category}` }
      ]
    ]
  };

  await sendMessage(chatId, productMessage, keyboard);
}

async function handleCommander(chatId) {
  const commanderMessage = `
🛒 <b>COMMENT COMMANDER ?</b>

📱 <b>Par WhatsApp (recommandé) :</b>
• Numéro : ${WHATSAPP_NUMBER}
• Message : "Bonjour ! Je souhaite commander..."
• Réponse rapide

🚚 <b>Livraison France entière :</b>
• Mondial Relay
• La Poste  
• Tours : 10h, 14h, 17h

💬 <b>Autres options :</b>
• Signal : +33612345678
• Canal Telegram : ${TELEGRAM_CHANNEL}

<b>Cliquez sur WhatsApp pour commander 👇</b>
  `;

  await sendMessage(chatId, commanderMessage, getContactKeyboard());
}

async function handleContact(chatId) {
  const contactMessage = `
📞 <b>CONTACT & SUPPORT</b>

💬 <b>WhatsApp principal :</b>
${WHATSAPP_NUMBER}
• Commandes
• Questions
• Support

📢 <b>Canal Telegram :</b>
${TELEGRAM_CHANNEL}
• Nouveautés
• Promotions
• Actualités

🌐 <b>Site web :</b>
${CATALOG_URL}
• Catalogue complet
• Informations

<b>Choisissez votre contact 👇</b>
  `;

  await sendMessage(chatId, contactMessage, getContactKeyboard());
}

async function handleInfo(chatId) {
  const infoMessage = `
ℹ️ <b>INFORMATIONS</b>

🏪 <b>Notre boutique :</b>
• Spécialiste depuis 2024
• Produits premium
• Service client 24/7

🚚 <b>Livraison :</b>
• France entière
• Express disponible
• Discret et sécurisé

💳 <b>Paiement :</b>
• Carte bancaire
• Bitcoin
• Espèces (sur place)

⭐ <b>Garantie :</b>
• Qualité garantie
• Satisfait ou remboursé
• Support technique

<b>Retour au menu principal 👇</b>
  `;

  await sendMessage(chatId, infoMessage, getMainKeyboard());
}

// ==========================================
// 🔄 CALLBACK HANDLER
// ==========================================

async function handleCallback(chatId, callbackData) {
  // Plus de callbacks nécessaires - tous les boutons sont des URLs directes
  await handleStart(chatId);
}

// ==========================================
// 🌐 WEBHOOK HANDLER
// ==========================================

app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  try {
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      const firstName = message.from.first_name || '';

      // Handle commands
      if (text.startsWith('/')) {
        switch (text) {
          case '/start':
            await handleStart(chatId, firstName);
            break;
          default:
            await sendMessage(chatId, '❌ Commande inconnue. Utilisez /start pour commencer.', getMainKeyboard());
        }
      } else {
        // Handle regular messages
        await sendMessage(chatId, '👋 Utilisez les boutons ci-dessous pour naviguer.', getMainKeyboard());
      }
    }
    
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const callbackData = callbackQuery.data;
      
      // Answer callback query
      await axios.post(`${BOT_URL}/answerCallbackQuery`, {
        callback_query_id: callbackQuery.id,
        text: '✅ Action effectuée'
      });
      
      // Handle callback
      await handleCallback(chatId, callbackData);
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// ==========================================
// 🚀 SERVER STARTUP
// ==========================================

app.get('/', (req, res) => {
  res.send('🤖 George Moula Bot is running!');
});

app.get('/set-webhook', async (req, res) => {
  try {
    const response = await axios.post(`${BOT_URL}/setWebhook`, {
      url: WEBHOOK_URL
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Bot server running on port ${PORT}`);
  console.log(`🌐 Webhook URL: ${WEBHOOK_URL}`);
});

module.exports = app;
