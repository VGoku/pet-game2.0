function startBattle(id) {
  const player = game.familiars.find(f => f.id === id);
  if (!player) return;
  
  let enemyPool = enemies;
  if (currentEvent && currentEvent.effect === 'rare_enemies') {
    enemyPool = enemies.filter(e => e.level >= 6);
  }
  
  const enemy = {...enemyPool[Math.floor(Math.random() * enemyPool.length)]};
  enemy.currentHp = enemy.hp;
  
  battle = { player: {...player}, enemy: enemy, turn: 'player' };
  
  document.getElementById('familiarSelect').style.display = 'none';
  document.getElementById('battleScreen').style.display = 'block';
  document.getElementById('battle-log').innerHTML = '';
  
  renderBattle();
  logBattle('A wild ' + enemy.name + ' appeared!');
}

function doAttack() {
  if (battle.turn !== 'player') return;
  
  const p = battle.player;
  const e = battle.enemy;
  
  let dmg = Math.max(1, p.attack - e.defense);
  if (p.personality === 'Brave') dmg = Math.floor(dmg * 1.1);
  
  e.currentHp -= dmg;
  logBattle(p.name + ' attacks for ' + dmg + ' damage!');
  
  const el = document.getElementById('opponent-familiar');
  el.classList.add('hit', 'shake');
  setTimeout(() => el.classList.remove('hit', 'shake'), 500);
  
  renderBattle();
  
  if (e.currentHp <= 0) { endBattle('win'); return; }
  
  battle.turn = 'enemy';
  setTimeout(enemyTurn, 1000);
}

function doDefend() {
  if (battle.turn !== 'player') return;
  battle.player.defending = true;
  logBattle(battle.player.name + ' defends!');
  battle.turn = 'enemy';
  setTimeout(enemyTurn, 1000);
}

function doRetreat() {
  endBattle('retreat');
}

function enemyTurn() {
  const p = battle.player;
  const e = battle.enemy;
  
  let dmg = Math.max(1, e.attack - p.defense);
  if (p.defending) {
    dmg = Math.max(1, Math.floor(dmg * 0.5));
    p.defending = false;
  }
  
  p.currentHp -= dmg;
  logBattle(e.name + ' attacks for ' + dmg + ' damage!');
  
  const el = document.getElementById('player-familiar');
  el.classList.add('hit', 'shake');
  setTimeout(() => el.classList.remove('hit', 'shake'), 500);
  
  renderBattle();
  
  if (p.currentHp <= 0) { endBattle('lose'); return; }
  
  battle.turn = 'player';
}

function endBattle(result) {
  if (result === 'win') {
    logBattle('Victory!');
    
    game.wins++;
    const xp = battle.enemy.level * 5;
    if (game.player.class === 'Wizard') {
      gainXP(Math.floor(xp * 1.5));
    } else {
      gainXP(xp);
    }
    
    const fam = game.familiars.find(f => f.id === battle.player.id);
    if (fam) {
      fam.currentHp = Math.max(1, battle.player.currentHp);
      fam.xp += xp;
      if (fam.xp >= 100) {
        fam.level++;
        fam.xp -= 100;
        fam.maxHp += 10;
        fam.currentHp = fam.maxHp;
        fam.attack += 2;
        fam.defense += 2;
        notify(fam.name + ' leveled up!');
        
        if (fam.level > game.highestFamiliarLevel) {
          game.highestFamiliarLevel = fam.level;
        }
        
        checkEvolution(fam);
      }
    }
    
    generateLoot();
    checkAchievements();
    
  } else if (result === 'lose') {
    logBattle('Defeat...');
    const fam = game.familiars.find(f => f.id === battle.player.id);
    if (fam) fam.currentHp = 0;
    notify('Your familiar fainted!');
  } else if (result === 'retreat') {
    logBattle('You fled...');
    notify('You fled the battle');
  }
  
  save();
  updateUI();
  
  setTimeout(() => {
    document.getElementById('battleScreen').style.display = 'none';
    document.getElementById('familiarSelect').style.display = 'block';
    renderBattleSelect();
  }, 2000);
}

function generateLoot() {
  const drops = [];
  loot.forEach(entry => {
    let chance = entry.chance;
    if (currentEvent && currentEvent.effect === 'double_drops') chance *= 2;
    
    if (Math.random() < chance) {
      const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
      addMaterial(entry.item, qty);
      drops.push({item: entry.item, qty: qty});
    }
  });
  
  const coins = 10 + Math.floor(Math.random() * 20);
  game.coins += coins;
  drops.push({item: 'Coins', qty: coins});
  
  showLootPopup(drops);
}