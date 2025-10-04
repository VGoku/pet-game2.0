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
  if (coinCountEl) coinCountEl.textContent = game.coins ?? 0;
  if (dustCountEl) dustCountEl.textContent = game.dust ?? 0;
  if (playerLevelEl) playerLevelEl.textContent = game.level ?? 1;
  if (playerXPEl) playerXPEl.textContent = game.xp ?? 0;
  document.getElementById('playerClass').textContent = game.player.class || 'None';
  
  const stats = document.getElementById('journeyStats');
  if (stats) stats.innerHTML = 'Battles Won: ' + game.wins + '<br>Familiars: ' + game.familiars.length + '<br>Highest Level: ' + game.highestFamiliarLevel;
  
  const msg = document.getElementById('welcomeMsg');
  if (msg && game.player.class) {
    msg.textContent = 'Welcome back, ' + game.player.class + ' of the ' + game.player.faction + '!';
  }
}

function updateServerTime() {
  if (!serverTimeEl) return;
  const now = new Date();
  serverTimeEl.textContent = now.toLocaleTimeString();
}

function showSection(sectionName) {
  if (!sectionName) return;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(sectionName);
  if (target) target.classList.add('active');

  const btn = document.getElementById(`btn-${sectionName}`);
  if (btn) btn.classList.add('active');

  if (sectionName === 'battle') renderBattleSelect();
  if (sectionName === 'familiars') renderFamiliars();
  if (sectionName === 'inventory') renderInventory();
  if (sectionName === 'crafting') renderCrafting();
  if (sectionName === 'shop') renderShop();
  if (sectionName === 'achievements') renderAchievements();
  if (sectionName === 'leaderboard') generateLeaderboard();
}

function notify(msg) {
  const n = document.getElementById('notification');
  if (!n) return;
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
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

function renderFamiliars() {
  const grid = document.getElementById('familiarContainer');
  grid.innerHTML = '';
  
  if (game.familiars.length === 0) {
    grid.innerHTML = '<p>No familiars yet.</p>';
    return;
  }
  
  game.familiars.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = f.image ? `<img src="${f.image}" onerror="this.src='img/familiars/familiars.png'">` : `<div>${f.species[0].toUpperCase()}</div>`;
    card.innerHTML = `
      <div class="card-image">${img}</div>
      <h3>${f.name} ${f.evolved ? '✨' : ''}</h3>
      <span class="personality-tag">${f.personality}</span>
      <p>Lv.${f.level} ${f.rarity}</p>
      <p>HP: ${f.currentHp}/${f.maxHp}</p>
      <p>ATK:${f.attack} DEF:${f.defense} SPD:${f.speed}</p>
      ${f.evolves && !f.evolved ? `<p style="font-size:0.75em;color:#9b59b6;">Evolves at Lv.${f.evolvesAt}</p>` : ''}
      <div style="display:flex;gap:5px;margin-top:10px;">
        <button class="btn" onclick="healFam(${f.id})" ${f.currentHp >= f.maxHp ? 'disabled' : ''}>Heal (20)</button>
        <button class="btn" onclick="openRenameModal(${f.id})">Rename</button>
        <button class="btn btn-primary" onclick="startBattle(${f.id})">Battle</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderInventory() {
  const grid = document.getElementById('inventoryContainer');
  grid.innerHTML = '';
  
  const items = Object.keys(game.inventory);
  if (items.length === 0) {
    grid.innerHTML = '<p>No materials. Battle to collect!</p>';
    return;
  }
  
  items.forEach(item => {
    const qty = game.inventory[item];
    if (qty <= 0) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-image">📦</div><h3>${item}</h3><p>Qty: ${qty}</p>`;
    grid.appendChild(card);
  });
}

function renderShop() {
  const container = document.getElementById('shopContainer');
  if (!container) return;
  container.innerHTML = '';
  shopItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card shop-card';
    const canAfford = (game[item.currency] || 0) >= item.price;
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
  renderCrafting();
  renderAchievements();
  renderStarters();
}

function renderAchievements() {
  const grid = document.getElementById('achievementGrid');
  grid.innerHTML = '';
  
  achievements.forEach(ach => {
    const unlocked = game.achievements.includes(ach.id);
    const badge = document.createElement('div');
    badge.className = 'achievement-badge' + (unlocked ? ' unlocked' : '');
    badge.innerHTML = `
      <div style="font-size:2.5em;">${ach.icon}</div>
      <h3>${ach.name}</h3>
      <p style="font-size:0.9em;margin-top:5px;">${ach.desc}</p>
      ${unlocked ? '<p style="color:#2ecc71;margin-top:10px;">✓ Unlocked</p>' : '<p style="opacity:0.5;margin-top:10px;">🔒 Locked</p>'}
    `;
    grid.appendChild(badge);
  });
  
  document.getElementById('achievementProgress').textContent = game.achievements.length + '/' + achievements.length + ' unlocked';
}

function renderStarters() {
  const grid = document.getElementById('starterGrid');
  grid.innerHTML = '';
  starters.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => pickStarter(s, card);
    const img = s.image ? `<img src="${s.image}" style="width:80px;height:80px;border-radius:50%;" onerror="this.src='img/familiars/familiars.png'">` : '';
    card.innerHTML = `${img}<h3>${s.name}</h3><p>HP:${s.hp} ATK:${s.attack}</p><p style="font-size:0.8em;color:#9b59b6;">Evolves at Lv.${s.evolvesAt}</p>`;
    grid.appendChild(card);
  });
}

function renderBattleSelect() {
  const grid = document.getElementById('battleSelectGrid');
  grid.innerHTML = '';
  
  const avail = game.familiars.filter(f => f.currentHp > 0);
  if (avail.length === 0) {
    grid.innerHTML = '<p>All familiars need healing!</p>';
    return;
  }
  
  avail.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = f.image ? `<img src="${f.image}" style="width:80px;height:80px;border-radius:50%;" onerror="this.src='img/familiars/familiars.png'">` : '';
    card.innerHTML = `
      <div class="card-image">${img}</div>
      <h3>${f.name}</h3>
      <p>HP: ${f.currentHp}/${f.maxHp}</p>
      <button class="btn" onclick="startBattle(${f.id})">Choose</button>
    `;
    grid.appendChild(card);
  });
}

function renderBattle() {
  const p = battle.player;
  const e = battle.enemy;
  
  const pPercent = (p.currentHp / p.maxHp) * 100;
  const ePercent = (e.currentHp / e.hp) * 100;
  
  const pImg = p.image ? `<img src="${p.image}" style="width:150px;height:150px;border-radius:50%;" onerror="this.src='img/familiars/familiars.png'">` : `<div style="width:150px;height:150px;background:#4a2e5a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3em;">${p.species[0].toUpperCase()}</div>`;
  const eImg = e.image ? `<img src="${e.image}" style="width:150px;height:150px;border-radius:50%;" onerror="this.src='img/enemies/goblin.png'">` : `<div style="width:150px;height:150px;background:#5a2e2e;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3em;">👹</div>`;
  
  document.getElementById('player-familiar').innerHTML = `
    <h3>${p.name}</h3>
    ${pImg}
    <p>HP: ${Math.max(0,p.currentHp)}/${p.maxHp}</p>
    <div class="health-bar"><div class="health-bar-fill" style="width:${pPercent}%"></div></div>
  `;
  
  document.getElementById('opponent-familiar').innerHTML = `
    <h3>${e.name}</h3>
    ${eImg}
    <p>HP: ${Math.max(0,e.currentHp)}/${e.hp}</p>
    <div class="health-bar"><div class="health-bar-fill" style="width:${ePercent}%"></div></div>
  `;
}

function renderCrafting() {
  const grid = document.getElementById('craftingGrid');
  grid.innerHTML = '';
  
  recipes.forEach(r => {
    const canCraft = Object.keys(r.mats).every(m => (game.inventory[m] || 0) >= r.mats[m]);
    const matsText = Object.entries(r.mats).map(([m,q]) => {
      const have = game.inventory[m] || 0;
      const color = have >= q ? '#2ecc71' : '#e74c3c';
      return `<span style="color:${color}">${m}: ${have}/${q}</span>`;
    }).join('<br>');
    
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${r.name}</h3>
      <p style="font-size:0.85em;margin:10px 0;">${matsText}</p>
      <button class="btn" ${!canCraft ? 'disabled' : ''} onclick="craft('${r.id}')">Craft</button>
    `;
    grid.appendChild(card);
  });
}

function showEvolutionModal(oldName, fam) {
  const modal = document.getElementById('evolutionModal');
  document.getElementById('evolutionText').textContent = `${oldName} evolved into ${fam.name}!`;
  const display = document.getElementById('evolutionDisplay');
  const img = fam.image ? `<img src="${fam.image}" style="width:150px;height:150px;border-radius:50%;" onerror="this.src='img/familiars/familiars.png'">` : '';
  display.innerHTML = `
    ${img}
    <h3>${fam.name}</h3>
    <p>HP: ${fam.maxHp} | ATK: ${fam.attack} | DEF: ${fam.defense}</p>
  `;
  modal.classList.remove('hidden');
}

function closeEvolutionModal() {
  document.getElementById('evolutionModal').classList.add('hidden');
}

function openAvatarModal() {
  document.getElementById('avatarModal').classList.remove('hidden');
}

function closeAvatarModal() {
  document.getElementById('avatarModal').classList.add('hidden');
}

function updateAvatar() {
  const disp = document.getElementById('avatarDisplay');
  const av = game.player.avatar || '👤';
  if (av.startsWith('http') || av.startsWith('data:')) {
    disp.innerHTML = `<img src="${av}" onerror="this.innerHTML='👤'">`;
  } else {
    disp.innerHTML = av;
  }
}

function showLootPopup(drops) {
  const popup = document.getElementById('lootPopup');
  const list = document.getElementById('lootList');
  list.innerHTML = '';
  drops.forEach(d => {
    const div = document.createElement('div');
    div.className = 'loot-item';
    div.textContent = d.item + ' x' + d.qty;
    list.appendChild(div);
  });
  popup.classList.remove('hidden');
}

function closeLoot() {
  document.getElementById('lootPopup').classList.add('hidden');
  updateUI();
  renderInventory();
}

function logBattle(msg) {
  const log = document.getElementById('battle-log');
  if (!log) return;
  const p = document.createElement('div');
  p.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
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