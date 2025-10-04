// data.js
// Central game state and static data

// Centralized image paths
const IMG_PATHS = {
  inventory: "img/assets/inventory.jpg",
  crystal: "img/assets/crystal.jpg",
  sword: "img/assets/sword.jpg",
  egg: "img/assets/egg.jpg",
  star: "img/assets/star.jpg", // Fixed path to be in assets folder
  healthPot: "img/assets/health pot.png",
  shop: "img/assets/shop.jpg",
  battle: "img/assets/battle.jpg",  // Used as enemy default
  crate: "img/assets/crate.png",    // Used for mystery box
  redClaws: "img/assets/red-claws.png"  // Used for battle slash effect
};

// Image mappings for familiars and enemies - defined first since they're used in gameState
const familiarImages = {
  wolf: 'img/familiars/wolf.jpg',
  cat: 'img/familiars/cat.png',
  dragon: 'img/familiars/dragon.png',
  griffin: 'img/familiars/griffin.jpg',
  hippogriff: 'img/familiars/grumblenook.jpg',
  grumblenook: 'img/familiars/cute-deserrt-thing.jpg',
  default: 'img/familiars/familiars.png'
};

const enemyImages = {
  goblin: 'img/enemies/goblin.png',
  slime: 'img/enemies/slime.png',
  golem: 'img/enemies/golem.png',
  warg: 'img/enemies/batcat.jpg',
  raven: 'img/enemies/black-cat.jpg',
  boar: 'img/enemies/crystal-pig.jpg',
  spider: 'img/enemies/spider.jpg',
  harpy: 'img/enemies/firedog.jpg',
  orc: 'img/enemies/orc.png',
  hydra: 'img/enemies/frog-mushroom-head.jpg',
  default: IMG_PATHS.battle
};

// Game State
let game = {
  init: false,
  player: { class: null, faction: null, avatar: '👤', name: 'Keeper' },
  coins: 0,
  dust: 0,
  level: 1,
  xp: 0,
  wins: 0,
  familiars: [],
  inventory: {},
  lastDaily: null,
  achievements: [],
  highestFamiliarLevel: 0,
  totalMaterialsCollected: 0
};

let sel = { class: null, faction: null, starter: null };
let battle = { player: null, enemy: null, turn: 'player' };
let renameTarget = null;
let currentEvent = null;

const personalities = ['Brave', 'Lazy', 'Hungry', 'Playful', 'Serious', 'Shy', 'Bold'];

const starters = [
  { species: 'grumblenook', name: 'Grumblenook', hp: 60, attack: 12, defense: 6, speed: 25, image: 'img/familiars/cute-deserrt-thing.jpg', evolves: true, evolvesAt: 10, evolvesInto: 'Greater Grumblenook' },
  { species: 'dragon', name: 'Silver Dragon', hp: 120, attack: 25, defense: 15, speed: 10, image: 'img/familiars/dragon.png', evolves: true, evolvesAt: 15, evolvesInto: 'Ancient Dragon' },
  { species: 'hippogriff', name: 'Hippogriff', hp: 110, attack: 22, defense: 14, speed: 13, image: 'img/familiars/griffin.jpg', evolves: true, evolvesAt: 12, evolvesInto: 'Royal Hippogriff' }
];

const enemies = [
  { name: 'Goblin', hp: 50, attack: 10, defense: 5, level: 3, image: 'img/enemies/goblin.png' },
  { name: 'Slime', hp: 40, attack: 8, defense: 8, level: 2, image: 'img/enemies/slime.png' },
  { name: 'Orc Warrior', hp: 90, attack: 18, defense: 12, level: 6, image: 'img/enemies/orc.png' },
  { name: 'Shadow Beast', hp: 120, attack: 22, defense: 15, level: 8, image: 'img/enemies/black-cat.jpg' }
];

const loot = [
  {item: 'Iron Ore', chance: 0.6, qty: [1,3]},
  {item: 'Magic Dust', chance: 0.5, qty: [1,2]},
  {item: 'Leather', chance: 0.5, qty: [1,2]},
  {item: 'Rare Gem', chance: 0.15, qty: [1,1]}
];

const recipes = [
  { id: 'armor', name: 'Basic Armor', mats: {'Iron Ore':3, 'Leather':2}, bonus: {stat:'defense', val:5} },
  { id: 'weapon', name: 'Basic Weapon', mats: {'Iron Ore':2}, bonus: {stat:'attack', val:5} },
  { id: 'advanced_armor', name: 'Steel Armor', mats: {'Iron Ore':5, 'Rare Gem':1}, bonus: {stat:'defense', val:10} },
  { id: 'summon', name: 'Summon Familiar', mats: {'Magic Dust':5, 'Rare Gem':2}, type: 'familiar' }
];

const achievements = [
  {id: 'first_win', name: 'First Victory', desc: 'Win your first battle', check: () => game.wins >= 1, icon: '⚔️'},
  {id: 'five_wins', name: 'Warrior', desc: 'Win 5 battles', check: () => game.wins >= 5, icon: '🗡️'},
  {id: 'ten_wins', name: 'Champion', desc: 'Win 10 battles', check: () => game.wins >= 10, icon: '🏆'},
  {id: 'first_craft', name: 'Craftsman', desc: 'Craft your first item', check: () => Object.keys(game.inventory).length >= 3, icon: '⚒️'},
  {id: 'three_familiars', name: 'Growing Team', desc: 'Own 3 familiars', check: () => game.familiars.length >= 3, icon: '👥'},
  {id: 'level_5', name: 'Experienced', desc: 'Reach level 5', check: () => game.level >= 5, icon: '⭐'},
  {id: 'level_10', name: 'Master Keeper', desc: 'Reach level 10', check: () => game.level >= 10, icon: '🌟'},
  {id: 'evolution', name: 'Evolutionist', desc: 'Evolve a familiar', check: () => game.familiars.some(f => f.evolved), icon: '✨'},
  {id: 'collector', name: 'Material Hoarder', desc: 'Collect 100 materials', check: () => game.totalMaterialsCollected >= 100, icon: '📦'},
  {id: 'rich', name: 'Wealthy', desc: 'Have 500 coins', check: () => game.coins >= 500, icon: '💰'}
];

const events = [
  {name: 'Lucky Hour', desc: '2x drop rates for 5 minutes!', duration: 300000, effect: 'double_drops'},
  {name: 'Rare Spawn', desc: 'Legendary enemies appearing!', duration: 600000, effect: 'rare_enemies'},
  {name: 'Merchant Visit', desc: '50% off all shop items!', duration: 300000, effect: 'shop_sale'}
];


// Shop items: prefer `image` paths over emoji. Drop images into assets/shop
const shopItems = [
  { id: 201, name: "Health Potion", price: 20, currency: "coins", image: IMG_PATHS.healthPot, description: "Restores 20 health to all familiars.", type: "consumable" },
  { id: 202, name: "Magic Sword", price: 100, currency: "coins", image: IMG_PATHS.sword, description: "Increases your familiar's attack by 10 for the next battle.", type: "consumable" },
  { id: 203, name: "Rare Familiar Egg", price: 15, currency: "dust", image: IMG_PATHS.egg, type: "egg", description: "A rare egg that can be hatched into a powerful familiar." },
  { id: 204, name: "Experience Boost", price: 30, currency: "coins", image: IMG_PATHS.star, description: "Doubles the XP gained for the next 3 activities.", type: "consumable" },
  { id: 205, name: "Mystery Box", price: 5, currency: "dust", image: IMG_PATHS.crate, description: "Contains a random item from the shop." },
  // A familiar purchasable directly
  { id: 301, type: "familiar", name: "Griffin", price: 50, currency: "dust", image: familiarImages.griffin, hp: 110, attack: 22, defense: 12, speed: 18, description: "A majestic creature." }
];

// Expose image maps globally
// Expose all needed variables globally
window.familiarImages = familiarImages;
window.enemyImages = enemyImages;
window.IMG_PATHS = IMG_PATHS;
window.gameState = game;  // Make sure gameState is available to other modules

// Hatchable familiars (used by eggs/mystery boxes)
const hatchableFamiliars = [
  { name: "Zephyr", image: familiarImages.griffin, hp: 100, attack: 20, defense: 10, speed: 25 },
  { name: 'Pip', image: familiarImages.cat, hp: 60, attack: 8, defense: 6, speed: 30 },
  { name: 'Smokey', image: familiarImages.dragon, hp: 110, attack: 23, defense: 12, speed: 12 },
  { name: 'Fang', image: familiarImages.wolf, hp: 90, attack: 18, defense: 12, speed: 15 }
];

// Opponents for battles (images use enemyImages mapping or direct paths)
const opponents = [
  { id: 1, name: "Goblin Scavenger", level: 3, image: enemyImages.goblin, hp: 50, attack: 10, defense: 5, speed: 10 },
  { id: 2, name: "Slime", level: 5, image: enemyImages.slime, hp: 70, attack: 12, defense: 10, speed: 5 },
  { id: 3, name: "Golem", level: 7, image: enemyImages.golem, hp: 150, attack: 18, defense: 20, speed: 3 },
  { id: 4, name: "Warg", level: 4, image: enemyImages.warg, hp: 80, attack: 14, defense: 8, speed: 12 },
  { id: 5, name: "Raven", level: 6, image: enemyImages.raven, hp: 90, attack: 16, defense: 9, speed: 18 },
  { id: 6, name: "Wild Boar", level: 5, image: enemyImages.boar, hp: 90, attack: 15, defense: 10, speed: 8 },
  { id: 7, name: "Giant Spider", level: 6, image: enemyImages.spider, hp: 100, attack: 18, defense: 12, speed: 10 },
  { id: 8, name: "Harpy", level: 7, image: enemyImages.harpy, hp: 110, attack: 20, defense: 8, speed: 15 },
  { id: 9, name: "Orc Warlord", level: 8, image: enemyImages.orc, hp: 130, attack: 22, defense: 15, speed: 5 },
  { id: 10, name: "Hydra", level: 10, image: enemyImages.hydra, hp: 200, attack: 25, defense: 18, speed: 7 }
];