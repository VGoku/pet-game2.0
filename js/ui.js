// ui.js
// DOM references
const coinCountEl = document.getElementById("coinCount");
const dustCountEl = document.getElementById("dustCount");
const playerLevelEl = document.getElementById("playerLevel");
const playerXPEl = document.getElementById("playerXP");
const serverTimeEl = document.getElementById("serverTime");
const notificationEl = document.getElementById("notification");
const hatchingOverlay = document.getElementById("hatching-overlay");
const bgMusicEl = document.getElementById('bg-music');

function updateUI() {
  if (coinCountEl) coinCountEl.textContent = gameState.coins ?? 0;
  if (dustCountEl) dustCountEl.textContent = gameState.dust ?? 0;
  if (playerLevelEl) playerLevelEl.textContent = gameState.level ?? 1;
  if (playerXPEl) playerXPEl.textContent = gameState.xp ?? 0;
}

function updateServerTime() {
  if (!serverTimeEl) return;
  const now = new Date();
  serverTimeEl.textContent = now.toLocaleTimeString();
}

function showSection(sectionName) {
  if (!sectionName) return;
  document.body.className = sectionName;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(sectionName);
  if (target) target.classList.add('active');

  const btn = document.getElementById(`btn-${sectionName}`);
  if (btn) btn.classList.add('active');
}

function showNotification(msg, duration = 2000) {
  if (!notificationEl) return;
  notificationEl.textContent = msg;
  notificationEl.classList.add('show');
  setTimeout(() => notificationEl.classList.remove('show'), duration);
}

function spawnOrb(targetEl, count = 1) {
  if (!targetEl) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const orb = document.createElement('div');
      orb.className = 'orb';
      orb.style.left = Math.random() * window.innerWidth + 'px';
      orb.style.top = Math.random() * window.innerHeight + 'px';
      document.body.appendChild(orb);
      setTimeout(() => {
        const rect = targetEl.getBoundingClientRect();
        orb.style.transition = 'all 900ms ease-out';
        orb.style.left = (rect.left + rect.width / 2) + 'px';
        orb.style.top = (rect.top + rect.height / 2) + 'px';
        orb.style.opacity = '0';
        orb.style.transform = 'scale(0.2)';
      }, 80);
      setTimeout(() => orb.remove(), 1200);
    }, i * 150);
  }
}

function showHatchingAnimation(cb) {
  if (!hatchingOverlay) { if (typeof cb === 'function') cb(); return; }
  hatchingOverlay.classList.remove('hidden');
  hatchingOverlay.innerHTML = '<div class="egg-container"><div class="egg wobble"></div></div>';
  setTimeout(() => {
    hatchingOverlay.classList.add('hidden');
    if (typeof cb === 'function') cb();
  }, 1800);
}

/* ---------- Image resolution helper ---------- */
function getImageSrc(item, fallbackType = 'familiar') {
  if (!item) return (fallbackType === 'enemy' ? enemyImages.default : familiarImages.default);
  if (item.image) return item.image;
  if (item.img) return item.img;
  const key = (item.species || item.name || '').toString().toLowerCase().replace(/\s+/g, '-');
  if (fallbackType === 'enemy' && window.enemyImages && window.enemyImages[key]) return window.enemyImages[key];
  if (window.familiarImages && window.familiarImages[key]) return window.familiarImages[key];
  return (fallbackType === 'enemy' ? enemyImages.default : familiarImages.default);
}

/* ---------- Render familiars (clean layout, rename support) ---------- */
function renderFamiliars() {
  const container = document.getElementById('familiarContainer');
  if (!container) return;
  container.innerHTML = '';

  (gameState.familiars || []).forEach(fam => {
    const key = (fam.species || fam.name || 'familiar').toString().toLowerCase().replace(/\s+/g, '-');
    const imgSrc = getImageSrc(fam, 'familiar');
  const placeholder = (familiarImages && familiarImages.default) || 'img/familiars/familiars.png';

    const div = document.createElement('div');
    div.className = 'card familiar-card';
    div.dataset.familiarId = fam.id;

    // Stats layout: left = needs, right = core stats
    div.innerHTML = `
      <div class="card-image">
        <img src="${imgSrc}" alt="${fam.name}" class="familiar-thumb"
             onerror="this.onerror=null;this.src='${placeholder}'">
      </div>
      <h3 class="fam-name">${fam.name || 'Unnamed'}</h3>
      <p class="fam-level">Level ${fam.level || 1} ${fam.species ? '(' + fam.species + ')' : ''}</p>

      <div class="fam-stats-row">
        <div class="fam-needs">
          <div class="stat"><span class="stat-label">❤️</span> <span>${fam.happiness ?? 0}%</span></div>
          <div class="stat"><span class="stat-label">🍖</span> <span>${fam.hunger ?? 0}%</span></div>
          <div class="stat"><span class="stat-label">💧</span> <span>${fam.thirst ?? 0}%</span></div>
        </div>
        <div class="fam-core">
          <div class="stat"><span class="stat-label">⚔️</span> <span>${fam.attack ?? 0}</span></div>
          <div class="stat"><span class="stat-label">🛡️</span> <span>${fam.defense ?? 0}</span></div>
          <div class="stat"><span class="stat-label">💨</span> <span>${fam.speed ?? 0}</span></div>
        </div>
      </div>

      <div class="familiar-actions">
        <button class="btn" onclick="interactFamiliar(${fam.id}, 'play')">Play</button>
        <button class="btn" onclick="interactFamiliar(${fam.id}, 'feed')">Feed</button>
        <button class="btn" onclick="interactFamiliar(${fam.id}, 'water')">Water</button>
        <button class="btn btn-primary" onclick="startBattle(${fam.id})">Battle</button>
      </div>

      <div class="familiar-actions">
        <button class="btn" onclick="renameFamiliar(${fam.id})">Rename</button>
      </div>
    `;

    container.appendChild(div);
  });
}

/* ---------- Inventory & Shop ---------- */
function renderInventory() {
  const container = document.getElementById('inventoryContainer');
  if (!container) return;
  container.innerHTML = '';
  const inv = gameState.inventory || [];
  if (!inv.length) { container.innerHTML = '<p>Your inventory is empty.</p>'; return; }

  inv.forEach(item => {
    console.log("Rendering inventory item with image:", item.image);
    const div = document.createElement('div');
    div.className = 'card item-card';
  const img = item.image ? `<img src="${item.image}" alt="${item.name}" style="width:64px;height:64px;" onerror="this.onerror=null;this.src='${IMG_PATHS.shop}'">` : '';
    let btnHtml = item.type === 'egg' ? `<button class="btn" onclick="hatchEgg(${item.id})">Hatch</button>` : `<button class="btn" onclick="useItem(${item.id})">Use</button>`;
    div.innerHTML = `
      <div class="card-image">${img}</div>
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <p>Qty: ${item.quantity || 0}</p>
      ${btnHtml}
    `;
    container.appendChild(div);
  });
}

function renderShop() {
  const container = document.getElementById('shopContainer');
  if (!container) return;
  container.innerHTML = '';
  shopItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card shop-card';
    const canAfford = (gameState[item.currency] || 0) >= item.price;
  const imgHtml = item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100px;height:100px;border-radius:12px;" onerror="this.onerror=null;this.src='${IMG_PATHS.shop}'">` : '';
    div.innerHTML = `
      <div class="card-image">${imgHtml}</div>
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <div class="price"><strong>${item.currency === 'coins' ? 'Coins' : 'Dust'}:</strong> ${item.price}</div>
      <button class="btn" ${!canAfford ? 'disabled' : ''} onclick="buyItem(${item.id})">Buy</button>
    `;
    container.appendChild(div);
  });
}

function renderAllSections() {
  renderFamiliars();
  renderInventory();
  renderShop();
}

/* ---------- Visual effects: slash ---------- */
function showSlash(targetEl, imagePath = IMG_PATHS.redClaws) {
  if (!targetEl) return;
  const img = document.createElement('img');
  img.src = imagePath;
  img.className = 'slash-effect';
  img.style.position = 'absolute';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.transform = 'translate(-50%, -50%) scale(1)';
  img.style.width = '180px';
  img.style.pointerEvents = 'none';
  img.style.opacity = '0.9';
  img.style.zIndex = '9999';
  
  targetEl.style.position = 'relative'; // ensure container is positioned
  targetEl.appendChild(img);

  // Animate fade/shrink
  setTimeout(() => {
    img.style.transition = 'all 0.4s ease-out';
    img.style.opacity = '0';
    img.style.transform = 'translate(-50%, -50%) scale(0.5)';
  }, 50);

  setTimeout(() => img.remove(), 500);
}
