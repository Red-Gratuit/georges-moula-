// ==========================================
// 🚀 APPLICATION INITIALIZATION
// ==========================================

// ==========================================
// 📦 PRODUITS
// ==========================================
let products = [];  // Produits chargés depuis le serveur
let customProducts = [];  // Produits personnalisés ajoutés par l'admin

// ==========================================
// 📱 AFFICHER LES PRODUITS - TOUS LES PRODUITS
// ==========================================
function displayProducts(filter = 'all') {
  console.log('🎯 Affichage des produits, filtre:', filter);
  console.log('📦 Produits par défaut:', products);
  console.log('📦 Produits personnalisés:', customProducts);
  
  const container = document.getElementById('products-container');

  // Tous les produits (par défaut + personnalisés)
  const allProducts = [...products, ...customProducts];
  console.log('📦 Tous les produits:', allProducts);

  const filtered = filter === 'all' 
    ? allProducts 
    : allProducts.filter(p => {
        if (filter === 'billet') {
          return p.category === 'billet' || p.name.toLowerCase().includes('billet');
        }
        if (filter === 'stup') {
          return p.category === 'stup' || p.name.toLowerCase().includes('stup');
        }
        if (filter === 'custom') {
          return p.custom;
        }
        return true;
      });

  if (filtered.length === 0) {
    if (filter === 'all') {
      container.innerHTML = '<div class="loading">Aucun billet/produit. Ajoutez-en depuis le panel admin !</div>';
    } else {
      container.innerHTML = '<div class="loading">Aucun billet/produit dans cette catégorie.</div>';
    }
    return;
  }

  container.innerHTML = filtered.map(p => {
    // Utiliser thumbnailImage pour l'affichage dans les cartes
    const thumbnailUrl = p.thumbnailImage ? p.thumbnailImage : (p.image.startsWith('data:') ? p.image : p.image);
    const mediaElement = p.mediaType === 'video' ? 
      `<div class="media-container" data-product-id="${p.id}" style="position: relative;">
        <img src="${thumbnailUrl}" alt="${p.name}" class="card-media" style="width: 100%; height: 200px; object-fit: cover; display: block;" onerror="this.src='bg.jpg'" loading="lazy">
        <button class="media-next-btn" onclick="event.stopPropagation(); toggleMedia(${p.id})" style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; border: none; padding: 8px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; z-index: 10; font-weight: bold;">▶️ Video</button>
        <video src="${p.image}" class="card-video" style="width: 100%; height: 200px; object-fit: cover; display: none;" controls preload="metadata" muted></video>
      </div>` :
      `<img src="${thumbnailUrl}" alt="${p.name}" style="width: 100%; height: 200px; object-fit: cover;" onerror="this.src='bg.jpg'" loading="lazy">`;
    
    // Badge de catégorie pour les billets/produits personnalisés
    const categoryBadge = p.custom ? 
      (p.category === 'billet' ? '<div class="category-badge billet">💨</div>' :
       p.category === 'stup' ? '<div class="category-badge stup">🚬</div>' :
       '<div class="category-badge custom">🆕</div>') : '';
    
    return `
    <div class="card" onclick="showProduct(${p.id})">
      ${mediaElement}
      ${categoryBadge}
      <h2>${p.name}</h2>
      <div class="card-info">
        <span class="card-price">${p.price}</span>
        <span class="card-quantity">${p.quantity || p.puffs}</span>
      </div>
      ${p.custom ? '<div class="custom-badge">🆕</div>' : ''}
    </div>
  `;
  }).join('');
  
  // Optimisation : Démarrer les vidéos uniquement quand elles sont visibles
  setTimeout(() => {
    const videos = container.querySelectorAll('video[data-lazy="true"]');
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          video.play().catch(() => {});
          video.removeAttribute('data-lazy');
          videoObserver.unobserve(video);
        }
      });
    }, { threshold: 0.1 });
    
    videos.forEach(video => videoObserver.observe(video));
  }, 100);
}

// ==========================================
// 🎯 BASCULEMENT PHOTO/VIDÉO DANS LES CARTES
// ==========================================
function toggleMedia(productId) {
  console.log('Toggle media called for product:', productId);
  
  const container = document.querySelector(`.media-container[data-product-id="${productId}"]`);
  if (!container) {
    console.log('Container not found for product:', productId);
    return;
  }
  
  const img = container.querySelector('.card-media');
  const video = container.querySelector('.card-video');
  const btn = container.querySelector('.media-next-btn');
  
  console.log('Elements found:', { img: !!img, video: !!video, btn: !!btn });
  
  if (!img || !video || !btn) return;
  
  // Vérifier l'état actuel
  const isImageVisible = img.style.display !== 'none' && img.style.display !== '';
  
  console.log('Current state - image visible:', isImageVisible);
  
  if (isImageVisible) {
    // Afficher la vidéo, cacher la photo
    img.style.display = 'none';
    video.style.display = 'block';
    btn.textContent = '🖼️ Photo';
    
    // Démarrer la vidéo
    video.play().catch(e => console.log('Video play error:', e));
  } else {
    // Afficher la photo, cacher la vidéo
    img.style.display = 'block';
    video.style.display = 'none';
    video.pause();
    btn.textContent = '▶️ Video';
  }
}

// ==========================================
// 🎯 AFFICHER DÉTAILS PRODUIT (MODAL) - PRODUITS PERSONNALISÉS
// ==========================================
function showProduct(id) {

  // Chercher dans tous les produits (par défaut + personnalisés)
  const allProducts = [...products, ...customProducts];
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  // Pour la modal, afficher directement la vidéo complète si c'est une vidéo
  const modalMediaUrl = product.mediaType === 'video' ? product.image : (product.thumbnailImage || product.image);
  const mediaElement = product.mediaType === 'video' ? 
    `<video src="${modalMediaUrl}" autoplay muted loop controls preload="metadata" style="width: 100%; max-height: 300px; border-radius: 12px;" onerror="this.src='bg.jpg'"></video>` :
    `<img src="${modalMediaUrl}" alt="${product.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px;" onerror="this.src='bg.jpg'" loading="lazy">`;

  const categoryText = product.category === 'billet' ? '💨 Billet' : 
                        product.category === 'stup' ? '🚬 Stup' : '🆕 Personnalisée';

  const html = `
    ${mediaElement}
    <h2>${product.name}</h2>
    <div class="product-price-big">${product.price}</div>

    <div class="product-info-item">
      <strong>📦 Catégorie :</strong> ${categoryText}
    </div>
    <div class="product-info-item">
      <strong>💶 Quantité :</strong> ${product.quantity || product.puffs}
    </div>
    ${product.description ? `<div class="product-info-item"><strong>📝 Description :</strong><br>${product.description}</div>` : ''}
    <div class="product-info-item">
      <strong>🆕 Produit personnalisé</strong>
    </div>

    <p style="margin-top: 25px; text-align: center; font-size: 1.1rem; color: #aaa;">
      💬 Contacte-moi sur <strong style="color: #667eea;">Telegram : https://t.me/+nLDghA-4yIU1MTk0</strong> pour commander ton billet/produit !
    </p>
  `;

  document.getElementById('modal-product-details').innerHTML = html;
  document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('product-modal');
  if (e.target === modal) closeProductModal();
});

// ==========================================
// � GESTION CLIC 3 FOIS SUR LOGO
// ==========================================
let logoClickCount = 0;
let logoClickTimer = null;

function setupLogoClickHandler() {
  const logo = document.getElementById('admin-logo-trigger');
  if (!logo) {
    console.log('❌ Logo non trouvé');
    return;
  }
  
  console.log('✅ Logo trouvé, setup du clic handler');
  
  logo.addEventListener('click', function() {
    console.log('🖱️ Logo cliqué, compteur:', logoClickCount + 1);
    
    // Annuler le timer précédent
    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }
    
    logoClickCount++;
    
    // Réinitialiser après 2 secondes
    logoClickTimer = setTimeout(() => {
      console.log('⏰ Timer reset, compteur:', logoClickCount);
      logoClickCount = 0;
    }, 2000);
    
    // Si 3 clics, afficher le panel admin
    if (logoClickCount === 3) {
      console.log('🎯 3 clics détectés, affichage panel admin');
      logoClickCount = 0;
      showAdminPanel();
      
    }
  });
}

function showAdminPanel() {
  const adminPanel = document.getElementById('tab-admin');
  if (adminPanel) {
    console.log('✅ Panel admin trouvé, affichage en cours');
    adminPanel.style.display = 'block';
    showAdminLogin();
  } else {
    console.log('❌ Panel admin non trouvé');
  }
}

function showAdminDashboard() {
  // Masquer tous les onglets
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Masquer la navigation
  document.querySelector('.bottom-nav').style.display = 'none';
  
  // Afficher uniquement le panel admin
  const adminPanel = document.getElementById('tab-admin');
  if (adminPanel) {
    adminPanel.style.display = 'block';
    adminPanel.classList.add('active');
    
    // Ajouter un bouton pour quitter l'admin
    if (!document.getElementById('exit-admin-btn')) {
      const exitBtn = document.createElement('button');
      exitBtn.id = 'exit-admin-btn';
      exitBtn.innerHTML = '🏠 Retour à la Mini App';
      exitBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 1000;
        font-size: 14px;
      `;
      exitBtn.onclick = exitAdminMode;
      document.body.appendChild(exitBtn);
    }
  }
  
  // Charger les produits admin
  loadAdminProducts();
  updateAdminStats();
}

function exitAdminMode() {
  // Supprimer le bouton exit
  const exitBtn = document.getElementById('exit-admin-btn');
  if (exitBtn) exitBtn.remove();
  
  // Réafficher la navigation
  document.querySelector('.bottom-nav').style.display = 'flex';
  
  // Masquer le panel admin
  const adminPanel = document.getElementById('tab-admin');
  if (adminPanel) {
    adminPanel.style.display = 'none';
    adminPanel.classList.remove('active');
  }
  
  // Afficher l'onglet menu
  const menuTab = document.getElementById('tab-menu');
  if (menuTab) {
    menuTab.style.display = 'block';
    menuTab.classList.add('active');
  }
  
  // Réinitialiser l'authentification
  isAdminAuthenticated = false;
  
  showCustomAlert('🏠', 'Retour à la Mini App', 'info');
}

// ==========================================
// �🎛️ FILTRES CATÉGORIES
// ==========================================
function setupFilters() {
  const buttons = document.querySelectorAll('.cat');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;
      displayProducts(cat);
    });
  });
}

// ==========================================
// 🧭 NAVIGATION TABS - CORRIGÉE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.style.display = 'none';
        t.scrollTop = 0;
      });

      const target = document.getElementById(`tab-${tab}`);
      if (target) {
        target.classList.add('active');
        target.style.display = 'block';
      }
    });
  });
});

// ==========================================
// 🎵 GESTION MUSIQUE SIMPLIFIÉE
// ==========================================
let audioStarted = false;

// Initialiser la gestion audio
function initAudioControls() {
  const audio = document.getElementById('intro-audio');
  const soundBtn = document.getElementById('sound-toggle');

  if (!audio || !soundBtn) {
    console.log('❌ Éléments audio non trouvés');
    return;
  }

  console.log('✅ Gestion audio initialisée');

  // Fonction pour démarrer l'audio au premier clic sur la page
  function startAudioOnFirstClick() {
    if (!audioStarted) {
      audio.muted = false;
      audio.play()
        .then(() => {
          console.log('🎵 Musique démarrée automatiquement !');
          audioStarted = true;
          soundBtn.innerHTML = '🔊';
        })
        .catch(err => {
          console.log('⏸️ Audio bloqué par le navigateur:', err);
        });
    }
  }

  // DÉMARRER AU 1ER CLIC N'IMPORTE OÙ sur la page
  document.body.addEventListener('click', startAudioOnFirstClick, { once: true });
  document.body.addEventListener('touchstart', startAudioOnFirstClick, { once: true });

  // Bouton son pour TOGGLE (ON/OFF)
  soundBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎵 Bouton son cliqué - audio.paused:', audio.paused);

    // Si l'audio n'a jamais été démarré, on le démarre
    if (!audioStarted) {
      audio.muted = false;
      audio.play()
        .then(() => {
          console.log('🎵 Musique démarrée manuellement !');
          audioStarted = true;
          soundBtn.innerHTML = '🔊';
        })
        .catch(err => {
          console.log('⏸️ Audio bloqué par le navigateur:', err);
        });
    } 
    // Sinon, on toggle ON/OFF en utilisant l'état réel de l'audio
    else {
      if (audio.paused) {
        audio.play().catch((err) => {
          console.log('❌ Erreur lecture audio:', err);
        });
        soundBtn.innerHTML = '🔊';
        console.log('🎵 Audio repris');
      } else {
        audio.pause();
        soundBtn.innerHTML = '🔇';
        console.log('🔇 Audio mis en pause');
      }
    }

  });
}

// Initialiser après le chargement de la page
document.addEventListener('DOMContentLoaded', initAudioControls);

// ==========================================
// 🎬 SPLASH SCREEN AVEC BELLE ANIMATION
// ==========================================
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  if (!splash) return;

  // Durée totale : 3.5 secondes
  setTimeout(() => {
    // Ajouter la classe pour l'animation de disparition
    splash.classList.add('fade-out');

    // Supprimer complètement après l'animation
    setTimeout(() => {
      splash.remove();
      console.log('✨ Splash screen terminé !');
    }, 1000); // 1 seconde pour l'animation de fade-out

  }, 2500); // 2.5 secondes d'affichage
});

// ==========================================
// 🎨 CARTES D'ALERTES PERSONNALISÉES
// ==========================================
function showCustomAlert(title, message, type = 'info') {
  // Créer l'overlay
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  // Créer la carte d'alerte
  const alertCard = document.createElement('div');
  alertCard.className = 'custom-alert-card';
  alertCard.style.cssText = `
    background: var(--card-bg);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    max-width: 400px;
    width: 100%;
    padding: 30px 20px;
    text-align: center;
    animation: slideUp 0.4s ease;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  // Définir les couleurs selon le type
  const colors = {
    success: { bg: 'linear-gradient(135deg, #4CAF50, #45a049)', icon: '✅' },
    warning: { bg: 'linear-gradient(135deg, #ff9800, #f57c00)', icon: '⚠️' },
    info: { bg: 'linear-gradient(135deg, #2196F3, #1976D2)', icon: 'ℹ️' },
    error: { bg: 'linear-gradient(135deg, #f44336, #d32f2f)', icon: '❌' }
  };

  const color = colors[type] || colors.info;

  alertCard.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 15px;">${color.icon}</div>
    <h2 style="color: var(--tg-theme-text-color); margin-bottom: 10px;">${title}</h2>
    <p style="color: var(--tg-theme-hint-color); margin-bottom: 25px; line-height: 1.4;">${message}</p>
    <button class="admin-btn" style="background: ${color.bg}; width: 100%;" onclick="this.closest('.custom-alert-overlay').remove()">
      OK
    </button>
  `;

  overlay.appendChild(alertCard);
  document.body.appendChild(overlay);

  // Fermer automatiquement après 3 secondes pour les messages de succès
  if (type === 'success') {
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 3000);
  }

  // Fermer au clic sur l'overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showCustomConfirm(title, message, onConfirm) {
  // Créer l'overlay
  const overlay = document.createElement('div');
  overlay.className = 'custom-confirm-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  // Créer la carte de confirmation
  const confirmCard = document.createElement('div');
  confirmCard.className = 'custom-confirm-card';
  confirmCard.style.cssText = `
    background: var(--card-bg);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    max-width: 400px;
    width: 100%;
    padding: 30px 20px;
    text-align: center;
    animation: slideUp 0.4s ease;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  confirmCard.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 15px;">🗑️</div>
    <h2 style="color: var(--tg-theme-text-color); margin-bottom: 10px;">${title}</h2>
    <p style="color: var(--tg-theme-hint-color); margin-bottom: 25px; line-height: 1.4;">${message}</p>
    <div style="display: flex; gap: 15px;">
      <button class="admin-btn cancel-btn" style="flex: 1;" onclick="this.closest('.custom-confirm-overlay').remove()">
        Annuler
      </button>
      <button class="admin-btn" style="flex: 1; background: linear-gradient(135deg, #f44336, #d32f2f);" onclick="confirmAction()">
        Confirmer
      </button>
    </div>
  `;

  overlay.appendChild(confirmCard);
  document.body.appendChild(overlay);

  // Fonction de confirmation
  window.confirmAction = function() {
    overlay.remove();
    onConfirm();
  };

  // Fermer au clic sur l'overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// ==========================================
// 📦 FONCTIONS PRODUITS PERSONNALISÉS - API RAILWAY
// ==========================================
let isAdminAuthenticated = false;
async function loadCustomProducts() {
  try {
    console.log('🔄 Chargement des produits depuis le serveur...');
    const response = await fetch('/api/products');
    console.log('📡 Réponse API reçue, status:', response.status);
    
    const data = await response.json();
    console.log('📦 Données API reçues:', data);
    
    if (data.success) {
      products = data.products.filter(p => !p.custom);
      customProducts = data.products.filter(p => p.custom);
      console.log('✅ Produits chargés depuis le serveur:', products.length + customProducts.length);
      console.log('📦 Produits par défaut:', products);
      console.log('📦 Produits personnalisés:', customProducts);
      
      // Afficher les produits après chargement
      displayProducts();
    } else {
      console.error('❌ Erreur chargement produits:', data.error);
      products = [];
      customProducts = [];
      displayProducts();
    }
  } catch (error) {
    console.error('❌ Erreur API:', error);
    products = [];
    customProducts = [];
    displayProducts();
  }
}

// Sauvegarder un produit sur le serveur
async function saveProductToServer(product) {
  try {
    console.log('💾 Envoi du produit au serveur:', product);
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    const data = await response.json();
    console.log('📨 Réponse du serveur:', data);
    
    if (data.success) {
      console.log('✅ Produit sauvegardé avec succès:', data.product);
      return true;
    } else {
      console.error('❌ Erreur sauvegarde:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur API sauvegarde:', error);
    return false;
  }
}

// Supprimer un produit via l'API
async function deleteProductFromServer(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Produit supprimé du serveur');
      return true;
    } else {
      console.error('❌ Erreur suppression:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur API:', error);
    return false;
  }
}

// Prévisualiser le média du nouveau produit
function previewProductMedia(event) {
  console.log('🖼️ Média sélectionné:', event.target.files[0]?.name);
  const file = event.target.files[0];
  const preview = document.getElementById('media-preview');
  
  if (file) {
    console.log('📁 Fichier détecté, taille:', file.size, 'type:', file.type);
    
    // Vérifier la taille du fichier (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      preview.innerHTML = '<p style="color: #ff4444;">❌ Fichier trop volumineux (max 50MB)</p>';
      currentProductMedia = null;
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      console.log('✅ Fichier lu en base64, longueur:', e.target.result.length);
      const fileType = file.type.split('/')[0]; // 'image' ou 'video'
      
      if (fileType === 'image') {
        preview.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
              📸 Photo
            </div>
          </div>
        `;
      } else if (fileType === 'video') {
        preview.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <video src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" controls muted>
            </video>
            <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
              🎥 Vidéo
            </div>
          </div>
        `;
      } else {
        preview.innerHTML = '<p style="color: #ff4444;">❌ Format non supporté</p>';
        currentProductMedia = null;
        return;
      }
      
      // Sauvegarder les données du média
      currentProductMedia = {
        data: e.target.result,
        type: fileType,
        name: file.name,
        size: file.size
      };
      
      console.log('💾 Média sauvegardé dans currentProductMedia:', currentProductMedia?.name);
    };
    
    reader.onerror = function() {
      console.log('❌ Erreur lecture fichier');
      preview.innerHTML = '<p style="color: #ff4444;">❌ Erreur de lecture du fichier</p>';
      currentProductMedia = null;
    };
    
    reader.readAsDataURL(file);
  } else {
    console.log('📁 Aucun fichier sélectionné');
    preview.innerHTML = '';
    currentProductMedia = null;
  }
}

// Ajouter un nouveau produit
async function addNewProduct() {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  
  const name = document.getElementById('new-product-name').value.trim();
  const category = document.getElementById('new-product-category').value;
  const price = document.getElementById('new-product-price').value.trim();
  const quantity = document.getElementById('new-product-quantity').value.trim();
  const desc = document.getElementById('new-product-desc').value.trim();
  
  if (!name || !price || !category) {
    showCustomAlert('⚠️ Champs requis', 'Veuillez remplir le nom, la catégorie et le prix de votre billet/produit.', 'warning');
    return;
  }
  
  const newProduct = {
    name: name,
    category: category,
    price: price,
    quantity: quantity || 'Non spécifié',
    description: desc || '',
    image: currentProductMedia ? currentProductMedia.data : 'bg.jpg',
    mediaType: currentProductMedia ? currentProductMedia.type : 'image'
  };
  
  console.log('🆕 Création produit avec média:', currentProductMedia?.name || 'bg.jpg');
  console.log('📸 Image URL length:', newProduct.image.length);
  console.log('🎥 MediaType:', newProduct.mediaType);
  
  // Sauvegarder sur le serveur
  const success = await saveProductToServer(newProduct);
  
  if (success) {
    // Recharger les produits depuis le serveur
    await loadCustomProducts();
    
    // Réinitialiser le formulaire
    document.getElementById('new-product-name').value = '';
    document.getElementById('new-product-category').value = '';
    document.getElementById('new-product-price').value = '';
    document.getElementById('new-product-quantity').value = '';
    document.getElementById('new-product-desc').value = '';
    document.getElementById('new-product-media').value = '';
    document.getElementById('media-preview').innerHTML = '';
    currentProductMedia = null;
    
    showCustomAlert('✅ Succès', 'Billet/Produit ajouté avec succès dans la catégorie ' + category + ' !', 'success');
    refreshProducts();
  } else {
    showCustomAlert('❌ Erreur', 'Impossible de sauvegarder votre billet/produit. Réessayez.', 'error');
  }
}

// Supprimer un produit personnalisé
async function deleteCustomProduct(id) {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  
  showCustomConfirm('🗑️ Supprimer le billet/produit', 'Êtes-vous sûr de vouloir supprimer votre billet/produit ?', async () => {
    const success = await deleteProductFromServer(id);
    
    if (success) {
      // Recharger les produits depuis le serveur
      await loadCustomProducts();
      refreshProducts();
      showCustomAlert('✅ Succès', 'Billet/Produit supprimé avec succès !', 'success');
    } else {
      showCustomAlert('❌ Erreur', 'Impossible de supprimer votre billet/produit. Réessayez.', 'error');
    }
  });
}


// ==========================================
// 🔐 FONCTIONS CONNEXION ADMIN PERSONNALISÉE
// ==========================================
function showAdminLogin() {
  // Afficher la carte de connexion personnalisée
  const loginModal = document.getElementById('admin-login-modal');
  if (loginModal) {
    loginModal.style.display = 'flex';
    // Focus sur le champ de code
    setTimeout(() => {
      const codeInput = document.getElementById('admin-code-input');
      if (codeInput) {
        codeInput.focus();
        codeInput.value = '';
      }
    }, 100);
  }
}

function submitAdminCode() {
  const codeInput = document.getElementById('admin-code-input');
  const code = codeInput ? codeInput.value.trim() : '';
  
  if (code === 'Billet6259') {
    isAdminAuthenticated = true;
    hideAdminLogin();
    showCustomAlert('✅ Authentification réussie', 'Bienvenue dans le panel admin !', 'success');
    
    // Afficher le dashboard admin dédié
    showAdminDashboard();
    
    // Afficher le contenu admin
    const accessDenied = document.getElementById('admin-access-denied');
    const adminContent = document.getElementById('admin-content');
    if (accessDenied) accessDenied.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    
    loadAdminProducts();
    updateAdminStats();
    
    // Activer l'onglet admin après authentification
    const adminTab = document.querySelector('[data-tab="admin"]');
    if (adminTab) {
      adminTab.click();
    }
  } else {
    // Code incorrect - animation d'erreur
    if (codeInput) {
      codeInput.style.animation = 'shake 0.5s';
      setTimeout(() => {
        codeInput.style.animation = '';
        codeInput.focus();
      }, 500);
    }
  }
}

function cancelAdminLogin() {
  hideAdminLogin();
  // Rediriger vers le menu principal
  const menuTab = document.querySelector('[data-tab="menu"]');
  if (menuTab) {
    menuTab.click();
  }
}

function hideAdminLogin() {
  const loginModal = document.getElementById('admin-login-modal');
  if (loginModal) {
    loginModal.style.display = 'none';
  }
}

// Animation shake pour erreur
const shakeStyle = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;

// Ajouter le style shake dynamiquement
if (!document.getElementById('shake-style')) {
  const style = document.createElement('style');
  style.id = 'shake-style';
  style.textContent = shakeStyle;
  document.head.appendChild(style);
}

// Gérer la touche Entrée dans le champ de code
document.addEventListener('DOMContentLoaded', () => {
  const codeInput = document.getElementById('admin-code-input');
  if (codeInput) {
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitAdminCode();
      }
    });
  }
});



// Mettre à jour les statistiques admin
function updateAdminStats() {
  const totalProducts = document.getElementById('total-products');
  if (totalProducts) {
    const allProducts = [...products, ...customProducts];
    totalProducts.textContent = allProducts.length;
  }
}

function loadAdminProducts() {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  
  const container = document.getElementById('admin-products-list');
  if (!container) return;
  
  const allProducts = [...products, ...customProducts];
  
  container.innerHTML = allProducts.map(p => `
    <div class="admin-product-card">
      ${p.mediaType === 'video' ? 
        `<video src="${p.image}" muted loop playsinline style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"></video>` :
        `<img src="${p.image}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`
      }
      <div class="admin-product-info">
        <h3>${p.name} ${p.custom ? '🆕' : ''}</h3>
        <p>${p.quantity} • ${p.price}€</p>
      </div>
      <div class="admin-product-actions">
        ${p.custom ? `<button class="admin-btn-small delete" onclick="deleteCustomProduct(${p.id})">🗑️</button>` : ''}
      </div>
    </div>
  `).join('');
  
  // Démarrer les vidéos
  container.querySelectorAll('video').forEach(video => {
    video.play().catch(() => {});
  });
}

function addProduct() {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  showCustomAlert('ℹ️ Information', 'Utilisez le formulaire "Ajouter un nouveau produit" ci-dessus !', 'info');
}

function editProduct(id) {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  showCustomAlert('ℹ️ Information', 'Fonctionnalité d\'édition en développement !', 'info');
}

function deleteProduct(id) {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  showCustomConfirm('🗑️ Supprimer le produit', 'Êtes-vous sûr de vouloir supprimer ce produit par défaut ?', () => {
    showCustomAlert('ℹ️ Information', 'Fonctionnalité en développement !', 'info');
  });
}

function refreshProducts() {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  loadAdminProducts();
  showCustomAlert('🔄 Actualisation', 'Liste des produits mise à jour !', 'info');
}

function saveConfig() {
  if (!isAdminAuthenticated) {
    showAdminLogin();
    return;
  }
  const telegramUsername = document.getElementById('snap-username').value;
  const defaultPrice = document.getElementById('default-price').value;
  
  // Sauvegarder dans localStorage
  localStorage.setItem('telegram_username', telegramUsername);
  localStorage.setItem('default_price', defaultPrice);
  localStorage.setItem('admin_code', 'Farm59');
  
  showCustomAlert('✅ Configuration sauvegardée', 'Vos paramètres ont été enregistrés avec succès !', 'success');
}

// ==========================================
// 📞 FONCTIONS CONTACT
// ==========================================
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      product: formData.get('product'),
      message: formData.get('message')
    };
    
    // Simuler l'envoi
    console.log('Message reçu :', data);
    showCustomAlert('✅ Message envoyé', 'Votre message a été envoyé avec succès ! Je vous répondrai rapidement sur Telegram.', 'success');
    form.reset();
  });
}

// ==========================================
// 🚀 INITIALISATION - API RAILWAY
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Pas de splash screen - démarrage direct
  
  // Charger les produits depuis le serveur AVANT de les afficher
  await loadCustomProducts();
  
  // Afficher les produits après chargement
  displayProducts();
  setupFilters();
  setupContactForm();
  setupLogoClickHandler(); // Initialiser le clic 3 fois sur le logo
  
  // Initialiser le champ média pour l'upload
  const mediaInput = document.getElementById('new-product-media');
  if (mediaInput) {
    mediaInput.addEventListener('change', previewProductMedia);
    console.log('✅ Champ média initialisé');
  } else {
    console.log('❌ Champ média non trouvé');
  }
  
  // Initialiser l'audio
  const audio = document.getElementById('intro-audio');
  const soundBtn = document.getElementById('sound-toggle');
  
  if (audio && soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (audioPlaying) {
        audio.pause();
        soundBtn.textContent = '🔇';
        audioPlaying = false;
      } else {
        audio.play().catch(() => {});
        soundBtn.textContent = '🔊';
        audioPlaying = true;
        audioStarted = true;
      }
    });
  }
  
  console.log('✅ App initialisée - Produits chargés depuis le serveur Railway !');
});
