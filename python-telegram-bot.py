# ==========================================
# 🤖 PYTHON TELEGRAM BOT FOR RAILPACK
# ==========================================

from flask import Flask, request, jsonify
import requests
import os
import json

app = Flask(__name__)

# Configuration
BOT_TOKEN = os.environ.get('BOT_TOKEN', '8640794661:AAFgJuB94wZuJtf6j9QJcT_a6BqFP_fQg5k')
WHATSAPP_NUMBER = os.environ.get('WHATSAPP_NUMBER', '0749657430')
TELEGRAM_CHANNEL = os.environ.get('TELEGRAM_CHANNEL', 'https://t.me/+nLDghA-4yIU1MTk0')
MINI_APP_URL = os.environ.get('MINI_APP_URL', 'https://web-production-6ccec.up.railway.app/bot.html')

TELEGRAM_API = f'https://api.telegram.org/bot{BOT_TOKEN}'

# ==========================================
# 📱 TELEGRAM API FUNCTIONS
# ==========================================

def send_message(chat_id, text, keyboard=None):
    """Send message to Telegram"""
    url = f'{TELEGRAM_API}/sendMessage'
    
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if keyboard:
        payload['reply_markup'] = keyboard
    
    try:
        response = requests.post(url, json=payload)
        print(f"Message sent to {chat_id}: {response.status_code}")
        return response.json()
    except Exception as e:
        print(f"Error sending message: {e}")
        return None

def get_main_keyboard():
    """Get main keyboard with 4 buttons"""
    return {
        'inline_keyboard': [
            [
                {'text': '💬 WhatsApp', 'url': f'https://wa.me/{WHATSAPP_NUMBER}'}
            ],
            [
                {'text': '🌐 Mini App', 'web_app': {'url': MINI_APP_URL}}
            ],
            [
                {'text': '🥔 Potato', 'url': 'https://t.me/telegrampotato'}
            ],
            [
                {'text': '📢 Canal Telegram', 'url': TELEGRAM_CHANNEL}
            ]
        ]
    }

def handle_start(chat_id, first_name=''):
    """Handle /start command"""
    welcome_message = f"""
👋 <b>Bienvenue {first_name} sur George Moula Bot !</b>

🛍️ <b>Boutique en ligne spécialisée :</b>
• 💨 Billets Premium
• 🚬 Stup Variétés  
• 🚀 Livraison France entière

<b>Choisissez une option ci-dessous 👇</b>
    """
    
    send_message(chat_id, welcome_message, get_main_keyboard())

# ==========================================
# 🌐 WEBHOOK HANDLER
# ==========================================

@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle Telegram webhook"""
    try:
        update = request.get_json()
        
        if update.get('message'):
            message = update['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            first_name = message.get('from', {}).get('first_name', '')
            
            # Handle commands
            if text.startswith('/'):
                if text == '/start':
                    handle_start(chat_id, first_name)
                else:
                    send_message(chat_id, '❌ Commande inconnue. Utilisez /start pour commencer.', get_main_keyboard())
            else:
                # Handle regular messages
                send_message(chat_id, '👋 Utilisez les boutons ci-dessous pour naviguer.', get_main_keyboard())
        
        elif update.get('callback_query'):
            # Handle callback queries
            callback_query = update['callback_query']
            chat_id = callback_query['message']['chat']['id']
            
            # Answer callback query
            try:
                requests.post(f'{TELEGRAM_API}/answerCallbackQuery', json={
                    'callback_query_id': callback_query['id'],
                    'text': '✅ Action effectuée'
                })
            except:
                pass
            
            # Show main menu
            handle_start(chat_id)
        
        return jsonify({'status': 'ok'})
    
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

# ==========================================
# 🚀 SERVER STARTUP
# ==========================================

@app.route('/')
def home():
    """Home page"""
    return '🤖 George Moula Bot is running!'

@app.route('/set-webhook')
def set_webhook():
    """Set Telegram webhook"""
    webhook_url = f'{request.scheme}://{request.host}/webhook'
    
    try:
        response = requests.post(f'{TELEGRAM_API}/setWebhook', json={'url': webhook_url})
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print(f'🤖 Bot server running on port {port}')
    print(f'🌐 Webhook URL: https://web-production-6ccec.up.railway.app/webhook')
    app.run(host='0.0.0.0', port=port)
