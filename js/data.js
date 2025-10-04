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
let gameState = {
  player: {
    class: 'Knight'
  },
  coins: 150,
  dust: 25,
  level: 1,
  xp: 0,
  lastDaily: null,
  familiars: [
    // Example familiars (images are placeholders; drop your images into assets/familiars and update paths)
  { id: 1, name: "Grumblenook", species: "grumblenook", color: "moss-green", marking: "none", level: 2, xp: 0, image: "img/familiars/cute-deserrt-thing.jpg", hunger: 95, thirst: 90, happiness: 92, hp: 60, attack: 12, defense: 6, speed: 25 },
  { id: 2, name: "Silver Dragon", species: "dragon", color: "silver", marking: "runic", level: 8, xp: 0, image: "img/familiars/dragon.png", hunger: 70, thirst: 60, happiness: 80, hp: 120, attack: 25, defense: 15, speed: 10 },
  { id: 3, name: "Thistle", species: "hippogriff", color: "brown", marking: "striped", level: 6, xp: 0, image: "img/familiars/griffin.jpg", hunger: 80, thirst: 70, happiness: 85, hp: 110, attack: 22, defense: 14, speed: 13 }
  ],
  inventory: [
  { id: 101, name: "Health Potion", image: IMG_PATHS.healthPot, quantity: 3, type: 'consumable', description: 'Restores familiar happiness and slightly heals.' },
  { id: 102, name: "Magic Crystal", image: IMG_PATHS.crystal, quantity: 1, type: 'consumable', description: 'Grants bonus XP when used.' }
  ],
  activities: {
    foraging: { active: false, progress: 0 },
    mining: { active: false, progress: 0 },
    fishing: { active: false, progress: 0 },
    catching: { active: false, progress: 0 }
  }
};

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
window.gameState = gameState;  // Make sure gameState is available to other modules

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
