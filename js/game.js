function triggerRandomEvent() {
  if (Math.random() < 0.1 && !currentEvent) {
    const event = events[Math.floor(Math.random() * events.length)];
    currentEvent = event;
    showEvent(event);
    setTimeout(() => {
      currentEvent = null;
      hideEvent();
    }, event.duration);
  }
}

function showEvent(event) {
  const banner = document.getElementById('eventBanner');
  document.getElementById('eventTitle').textContent = event.name + '!';
  document.getElementById('eventDesc').textContent = event.desc;
  banner.classList.remove('hidden');
}

function hideEvent() {
  document.getElementById('eventBanner').classList.add('hidden');
}

function checkAchievements() {
  let newUnlocks = 0;
  achievements.forEach(ach => {
    if (!game.achievements.includes(ach.id) && ach.check()) {
      game.achievements.push(ach.id);
      notify('Achievement Unlocked: ' + ach.name + '!');
      newUnlocks++;
    }
  });
  if (newUnlocks > 0) save();
}

function generateLeaderboard() {
  const scores = [
    {name: 'DragonMaster', level: 15, wins: 45},
    {name: 'ShadowKeeper', level: 12, wins: 38},
    {name: 'MysticWarrior', level: 11, wins: 35},
    {name: game.player.name, level: game.level, wins: game.wins, you: true},
    {name: 'IronFist', level: 9, wins: 28},
    {name: 'SwiftBlade', level: 8, wins: 24}
  ];
  
  scores.sort((a,b) => b.wins - a.wins);
  
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  
  scores.forEach((s, i) => {
    const entry = document.createElement('div');
    entry.className = 'leaderboard-entry' + (s.you ? ' you' : '');
    entry.innerHTML = `
      <span><strong>#${i+1}</strong> ${s.name}</span>
      <span>Level ${s.level} • ${s.wins} wins</span>
    `;
    list.appendChild(entry);
  });
}

function openRenameModal(id) {
  renameTarget = id;
  document.getElementById('renameModal').classList.remove('hidden');
  document.getElementById('renameInput').value = '';
  document.getElementById('renameInput').focus();
}

function closeRenameModal() {
  document.getElementById('renameModal').classList.add('hidden');
  renameTarget = null;
}

function saveRename() {
  const newName = document.getElementById('renameInput').value.trim();
  if (!newName || !renameTarget) return;
  
  const fam = game.familiars.find(f => f.id === renameTarget);
  if (fam) {
    fam.name = newName;
    notify('Renamed to ' + newName + '!');
    renderFamiliars();
    save();
  }
  closeRenameModal();
}

function checkEvolution(fam) {
  if (!fam.evolves || fam.evolved) return;
  if (fam.level >= fam.evolvesAt) {
    evolveFamiliar(fam);
  }
}

function evolveFamiliar(fam) {
  const oldName = fam.name;
  fam.name = fam.evolvesInto;
  fam.evolved = true;
  fam.maxHp = Math.floor(fam.maxHp * 1.5);
  fam.currentHp = fam.maxHp;
  fam.attack = Math.floor(fam.attack * 1.3);
  fam.defense = Math.floor(fam.defense * 1.3);
  fam.speed = Math.floor(fam.speed * 1.2);
  
  showEvolutionModal(oldName, fam);
  checkAchievements();
}

function saveAvatarEmoji(emoji) {
  game.player.avatar = emoji;
  document.getElementById('avatarDisplay').innerHTML = emoji;
  closeAvatarModal();
  save();
}

function saveAvatarURL() {
  const url = document.getElementById('avatarURL').value.trim();
  if (!url) { notify('Enter URL'); return; }
  game.player.avatar = url;
  document.getElementById('avatarDisplay').innerHTML = `<img src="${url}" onerror="this.innerHTML='👤'">`;
  closeAvatarModal();
  save();
  notify('Avatar updated!');
}

function pickClass(c) {
  sel.class = c;
  document.querySelectorAll('#intro .card').forEach(card => card.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  checkReady();
}

function pickFaction(f) {
  sel.faction = f;
  document.querySelectorAll('#intro .card').forEach(card => card.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  checkReady();
}

function pickStarter(s, el) {
  sel.starter = s;
  document.querySelectorAll('#starterGrid .card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  checkReady();
}

function checkReady() {
  document.getElementById('beginBtn').disabled = !(sel.class && sel.faction && sel.starter);
}

function startGame() {
  if (!sel.class || !sel.faction || !sel.starter) return;
  
  game.player.class = sel.class;
  game.player.faction = sel.faction;
  game.coins = 100;
  game.dust = 10;
  game.init = true;
  
  const fam = {
    id: Date.now(),
    ...sel.starter,
    level: 1,
    xp: 0,
    maxHp: sel.starter.hp,
    currentHp: sel.starter.hp,
    rarity: 'common',
    personality: personalities[Math.floor(Math.random() * personalities.length)]
  };
  game.familiars.push(fam);
  
  document.getElementById('intro').style.display = 'none';
  document.getElementById('home-content').style.display = 'block';
  
  save();
  updateUI();
  updateAvatar();
  showSection('home');
  notify('Welcome, ' + sel.class + '!');
  
  setInterval(triggerRandomEvent, 120000);
}

function healFam(id) {
  const f = game.familiars.find(x => x.id === id);
  if (!f || game.coins < 20) { notify('Not enough coins!'); return; }
  game.coins -= 20;
  f.currentHp = f.maxHp;
  notify(f.name + ' healed!');
  updateUI();
  renderFamiliars();
  save();
}

function addMaterial(name, qty) {
  if (!game.inventory[name]) game.inventory[name] = 0;
  game.inventory[name] += qty;
  game.totalMaterialsCollected += qty;
}

function craft(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  
  const canCraft = Object.keys(recipe.mats).every(m => (game.inventory[m] || 0) >= recipe.mats[m]);
  if (!canCraft) { notify('Not enough materials!'); return; }
  
  Object.entries(recipe.mats).forEach(([m,q]) => {
    game.inventory[m] -= q;
  });
  
  if (recipe.type === 'familiar') {
    const newFam = {
      id: Date.now(),
      name: 'Summoned Beast',
      species: 'summoned',
      hp: 80,
      maxHp: 80,
      currentHp: 80,
      attack: 15,
      defense: 10,
      speed: 15,
      level: 1,
      xp: 0,
      rarity: 'rare',
      image: 'img/familiars/cat.png',
      personality: personalities[Math.floor(Math.random() * personalities.length)]
    };
    game.familiars.push(newFam);
    notify('Summoned a new familiar!');
  } else {
    game.familiars.forEach(f => {
      if (recipe.bonus.stat === 'defense') f.defense += recipe.bonus.val;
      if (recipe.bonus.stat === 'attack') f.attack += recipe.bonus.val;
    });
    notify('Crafted ' + recipe.name + '!');
  }
  
  checkAchievements();
  renderCrafting();
  renderInventory();
  renderFamiliars();
  save();
}

function buyItem(item) {
  if (game[item.currency] < item.price) { notify('Not enough ' + item.currency + '!'); return; }
  
  game[item.currency] -= item.price;
  
  if (item.effect === 'heal') {
    game.familiars.forEach(f => f.currentHp = f.maxHp);
    notify('All familiars healed!');
  } else if (item.effect === 'material') {
    addMaterial(item.mat, 1);
    notify('Purchased ' + item.name + '!');
  }
  
  updateUI();
  renderShop();
  renderInventory();
  save();
}

function gainXP(amount) {
  game.xp += amount;
  if (game.xp >= 100) {
    game.level++;
    game.xp -= 100;
    game.coins += game.level * 10;
    notify('Level up! Now level ' + game.level);
    checkAchievements();
  }
  updateUI();
  save();
}

function claimDaily() {
  const today = new Date().toDateString();
  if (game.lastDaily === today) { notify('Already claimed today!'); return; }
  game.coins += 50;
  game.dust += 5;
  game.lastDaily = today;
  notify('Daily claimed! +50 coins, +5 dust');
  updateUI();
  save();
}