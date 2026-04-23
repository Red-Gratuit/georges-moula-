#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Billet George Moula - Mini App
Serveur web pour la gestion des billets/produits
"""

from flask import Flask, send_from_directory, request, jsonify
import os
import json
from datetime import datetime
import threading
import subprocess
import time

app = Flask(__name__, static_folder='frontend')

# ==========================================
# FICHIER DE DONNÉES
# ==========================================
import os
DATA_FILE = os.path.join(os.getcwd(), 'products.json')

def load_products():
    """Charger les billets/produits depuis le fichier JSON"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Erreur chargement billets/produits: {e}")
            return []
    else:
        print(f"📁 Fichier {DATA_FILE} non trouvé, création avec produit par défaut")
        # Créer un produit par défaut dans la catégorie billet
        default_products = [
            {
                "id": 1,
                "name": "Billet Premium Gold",
                "category": "billet",
                "price": "25€",
                "quantity": "1 unité",
                "description": "Billet de haute qualité avec design exclusif. Parfait pour les collectionneurs et les amateurs de produits premium.",
                "image": "bg.jpg",
                "mediaType": "image",
                "custom": False,
                "created": datetime.now().isoformat()
            }
        ]
        save_products(default_products)
        return default_products

def save_products(products):
    """Sauvegarder les billets/produits dans le fichier JSON"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"✅ {len(products)} billets/produits sauvegardés dans {DATA_FILE}")
        return True
    except Exception as e:
        print(f"❌ Erreur sauvegarde billets/produits: {e}")
        return False

# ==========================================
# ROUTES API
# ==========================================
@app.route('/api/products', methods=['GET'])
def get_products():
    """Récupérer tous les billets/produits personnalisés"""
    products = load_products()
    return jsonify({'success': True, 'products': products})

@app.route('/api/products', methods=['POST'])
def add_product():
    """Ajouter un nouveau billet/produit"""
    try:
        product_data = request.get_json()
        
        # Validation des données
        required_fields = ['name', 'price', 'category']
        for field in required_fields:
            if not product_data.get(field):
                return jsonify({'success': False, 'error': f'Champ {field} requis'}), 400
        
        # Ajouter le billet/produit
        products = load_products()
        new_product = {
            'id': len(products) + 1,
            'name': product_data['name'],
            'category': product_data['category'],  # Nouveau champ catégorie
            'price': product_data['price'],  # Garder en texte pour "1G: 20€, 2G: 35€..."
            'puffs': product_data.get('puffs', 'Non spécifié'),
            'description': product_data.get('description', ''),
            'image': product_data.get('image', 'bg.jpg'),
            'mediaType': product_data.get('mediaType', 'image'),
            'custom': True,
            'created': datetime.now().isoformat()
        }
        
        products.append(new_product)
        
        if save_products(products):
            return jsonify({'success': True, 'product': new_product})
        else:
            return jsonify({'success': False, 'error': 'Erreur sauvegarde'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Supprimer un billet/produit"""
    try:
        products = load_products()
        original_length = len(products)
        
        # Filtrer le billet/produit à supprimer
        products = [p for p in products if p['id'] != product_id]
        
        if len(products) == original_length:
            return jsonify({'success': False, 'error': 'Billet/Produit non trouvé'}), 404
        
        if save_products(products):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Erreur sauvegarde'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==========================================
# ROUTES STATIQUES
# ==========================================
# Route principale - sert index.html
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

# Route pour servir tous les fichiers statiques
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend', path)

# ==========================================
# DÉMARRAGE
# ==========================================
if __name__ == '__main__':
    # Créer le fichier JSON s'il n'existe pas
    if not os.path.exists(DATA_FILE):
        save_products([])
    
    # Démarrer le serveur Flask
    port = int(os.environ.get('PORT', 8080))
    print(f"🌐 Démarrage du serveur web sur le port {port}")
    app.run(host='0.0.0.0', port=port, threaded=True)
