// ==========================================
// 🤖 SIMPLE TELEGRAM BOT FOR RAILPACK
// ==========================================

const express = require('express');
const https = require('https');
const querystring = require('querystring');

const app = express();
app.use(express.json());

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || '8640794661:AAFgJuB94wZuJtf6j9QJcT_a6BqFP_fQg5k';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '0749657430';
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL || 'https://t.me/+nLDghA-4yIU1MTk0';
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://web-production-6ccec.up.railway.app/bot.html';

// ==========================================
// 📱 TELEGRAM API FUNCTIONS
// ==========================================

function sendMessage(chatId, text, keyboard = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  const data = querystring.stringify(payload);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  };

  const req = https.request(url, options, (res) => {
    console.log(`sendMessage status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error('sendMessage error:', error);
  });

  req.write(data);
  req.end();
}

// ==========================================
// ⌨️ KEYBOARD LAYOUTS
// ==========================================

function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💬 WhatsApp', url: `https://wa.me/${WHATSAPP_NUMBER}` }
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

// ==========================================
// 🎯 COMMAND HANDLERS
// ==========================================

function handleStart(chatId, firstName = '') {
  const welcomeMessage = `
👋 <b>Bienvenue ${firstName} sur George Moula Bot !</b>

🛍️ <b>Boutique en ligne spécialisée :</b>
• 💨 Billets Premium
• 🚬 Stup Variétés  
• 🚀 Livraison France entière

<b>Choisissez une option ci-dessous 👇</b>
  `;

  sendMessage(chatId, welcomeMessage, getMainKeyboard());
}

// ==========================================
// 🌐 WEBHOOK HANDLER
// ==========================================

app.post('/webhook', (req, res) => {
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
            handleStart(chatId, firstName);
            break;
          default:
            sendMessage(chatId, '❌ Commande inconnue. Utilisez /start pour commencer.', getMainKeyboard());
        }
      } else {
        // Handle regular messages
        sendMessage(chatId, '👋 Utilisez les boutons ci-dessous pour naviguer.', getMainKeyboard());
      }
    }
    
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      
      // Answer callback query
      const answerUrl = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
      const answerData = querystring.stringify({
        callback_query_id: callbackQuery.id,
        text: '✅ Action effectuée'
      });
      
      https.post(answerUrl, answerData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Handle callback (just show main menu)
      handleStart(chatId);
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

app.get('/set-webhook', (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get('host')}/webhook`;
  
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  const data = querystring.stringify({ url: webhookUrl });
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  };

  const webhookReq = https.request(url, options, (webhookRes) => {
    let responseData = '';
    webhookRes.on('data', (chunk) => {
      responseData += chunk;
    });
    webhookRes.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse response' });
      }
    });
  });

  webhookReq.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  webhookReq.write(data);
  webhookReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Bot server running on port ${PORT}`);
  console.log(`🌐 Webhook URL: https://web-production-6ccec.up.railway.app/webhook`);
});

module.exports = app;
