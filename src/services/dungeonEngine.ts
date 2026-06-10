import { DUNGEON_TYPES, DungeonType } from '../utils/dungeonTypes';

export interface DungeonScenario {
  title: string;
  description: string;
  environment: string;
  challenge: string;
  choices: DungeonChoice[];
  rewards: {
    xp: number;
    gold: number;
    items?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
}

export interface DungeonChoice {
  id: string;
  text: string;
  risk: 'low' | 'medium' | 'high';
  successChance: number;
  statBonus: string; // Which stat helps with this choice
}

export interface DungeonResult {
  success: boolean;
  narrative: string;
  xpEarned: number;
  goldEarned: number;
  itemsFound: string[];
  consequences: string;
}

interface PlayerStats {
  strength: number;
  intelligence: number;
  agility: number;
  wisdom: number;
}

// Scenario templates based on dungeon type
const SCENARIO_TEMPLATES: Record<string, {
  titles: string[];
  environments: string[];
  challenges: { text: string; statCheck: keyof PlayerStats }[];
  items: string[];
}> = {
  'crypt': {
    titles: [
      'The Whispering Tombs',
      'Halls of the Restless Dead',
      'The Crypt of Forgotten Kings',
      'Catacombs of Eternal Shadow',
      'The Bone Collector\'s Lair',
    ],
    environments: [
      'Ancient stone coffins line the walls. Spectral whispers echo through the darkness.',
      'Skulls embedded in the walls seem to watch your every move. Cold mist covers the floor.',
      'Flickering torchlight reveals hieroglyphics warning of ancient curses.',
      'The air is cold and still. Rows of sarcophagi stretch into the darkness.',
      'Bones crunch underfoot as you navigate the narrow passageways.',
    ],
    challenges: [
      { text: 'A horde of skeleton warriors rises from their graves!', statCheck: 'strength' },
      { text: 'A powerful lich casts dark magic at you!', statCheck: 'intelligence' },
      { text: 'Ghostly apparitions phase through walls to attack!', statCheck: 'wisdom' },
      { text: 'An ancient trap mechanism activates!', statCheck: 'agility' },
      { text: 'A vampire lord awakens from his slumber!', statCheck: 'strength' },
    ],
    items: ['Ancient Coin', 'Bone Charm', 'Spectral Essence', 'Crypt Key', 'Vampire Fang'],
  },
  'forest': {
    titles: [
      'The Whispering Woods',
      'Grove of Ancient Spirits',
      'The Enchanted Thicket',
      'Faerie Ring Clearing',
      'The Treant\'s Domain',
    ],
    environments: [
      'Sunlight filters through the emerald canopy. Magical creatures flit between the trees.',
      'Glowing mushrooms illuminate a path through the ancient forest.',
      'The trees seem to move on their own, creating new paths and closing old ones.',
      'A mystical fog swirls around your feet. The forest is alive with magic.',
      'Flowers bloom and wilt in seconds. Time flows differently here.',
    ],
    challenges: [
      { text: 'An angry treant blocks your path!', statCheck: 'strength' },
      { text: 'Trickster faeries cast confusion spells!', statCheck: 'wisdom' },
      { text: 'Poisonous thorn vines entangle you!', statCheck: 'agility' },
      { text: 'An ancient riddle must be solved to proceed!', statCheck: 'intelligence' },
      { text: 'A pack of dire wolves hunts you!', statCheck: 'agility' },
    ],
    items: ['Faerie Dust', 'Enchanted Acorn', 'Moon Petal', 'Forest Emerald', 'Spirit Wood'],
  },
  'cave': {
    titles: [
      'The Dragon\'s Maw',
      'Caverns of Molten Fire',
      'The Volcanic Depths',
      'Lair of the Flame Wyrm',
      'The Smoldering Abyss',
    ],
    environments: [
      'Rivers of lava flow through the cavern. The heat is almost unbearable.',
      'Massive stalactites hang from the ceiling like dragon teeth.',
      'The ground trembles with volcanic activity. Steam vents hiss all around.',
      'Crystals embedded in the walls glow with an inner fire.',
      'The smell of sulfur fills the air. Something large stirs in the darkness.',
    ],
    challenges: [
      { text: 'A young dragon guards its treasure hoard!', statCheck: 'strength' },
      { text: 'Magical fire barriers block your path!', statCheck: 'intelligence' },
      { text: 'The ground crumbles into a lava pit!', statCheck: 'agility' },
      { text: 'Ancient dragon runes must be deciphered!', statCheck: 'wisdom' },
      { text: 'A fire elemental rises from the magma!', statCheck: 'intelligence' },
    ],
    items: ['Dragon Scale', 'Fire Opal', 'Molten Core', 'Obsidian Shard', 'Phoenix Feather'],
  },
  'tower': {
    titles: [
      'The Wizard\'s Spire',
      'Tower of Arcane Secrets',
      'The Floating Citadel',
      'Sanctum of the Archmage',
      'The Crystal Observatory',
    ],
    environments: [
      'Books float through the air. Arcane symbols glow on every surface.',
      'Staircases spiral in impossible directions. Gravity seems optional here.',
      'Crystal balls show visions of other worlds. Magical energy crackles everywhere.',
      'Robotic constructs patrol the hallways with mechanical precision.',
      'Portals flicker open and closed, revealing glimpses of other dimensions.',
    ],
    challenges: [
      { text: 'An arcane golem guards the next floor!', statCheck: 'intelligence' },
      { text: 'A complex magical puzzle blocks your way!', statCheck: 'wisdom' },
      { text: 'Magical traps fire bolts of energy!', statCheck: 'agility' },
      { text: 'An illusionist creates copies of himself!', statCheck: 'wisdom' },
      { text: 'A magical barrier requires strength to break!', statCheck: 'strength' },
    ],
    items: ['Spell Scroll', 'Arcane Crystal', 'Wizard\'s Tome', 'Mana Gem', 'Enchanted Quill'],
  },
  'dungeon': {
    titles: [
      'The Goblin King\'s Hall',
      'Depths of Despair',
      'The Iron Prison',
      'Caverns of Chaos',
      'The Shadow Dungeon',
    ],
    environments: [
      'Rusty chains hang from the ceiling. The sound of dripping water echoes.',
      'Foul smelling torches barely light the way. Something skitters in the shadows.',
      'Iron bars line the walls of what was once a prison. Some cells are still occupied.',
      'Crude drawings on the walls depict terrible monsters.',
      'The floor is slick with an unknown substance. Bones litter the corners.',
    ],
    challenges: [
      { text: 'A troll blocks the narrow passage!', statCheck: 'strength' },
      { text: 'A complex trap mechanism requires disarming!', statCheck: 'agility' },
      { text: 'Goblins have set up an ambush!', statCheck: 'agility' },
      { text: 'An ancient lock needs to be picked!', statCheck: 'intelligence' },
      { text: 'A dark ritual must be interrupted!', statCheck: 'wisdom' },
    ],
    items: ['Iron Key', 'Troll Tooth', 'Goblin Gold', 'Dungeon Map', 'Lockpicks'],
  },
  'ruins': {
    titles: [
      'The Forgotten Temple',
      'Ruins of the Ancient Ones',
      'The Sunken Sanctuary',
      'Relics of a Lost Age',
      'The Cursed Excavation',
    ],
    environments: [
      'Crumbling pillars tell of a once great civilization. Strange technology hums quietly.',
      'Golden light filters through cracks in the ancient ceiling.',
      'Moss-covered statues of forgotten gods watch your every move.',
      'Ancient machinery still functions after thousands of years.',
      'Hieroglyphics cover every surface, telling stories of the past.',
    ],
    challenges: [
      { text: 'A stone guardian awakens from its slumber!', statCheck: 'strength' },
      { text: 'Ancient technology must be activated correctly!', statCheck: 'intelligence' },
      { text: 'A curse begins to take effect!', statCheck: 'wisdom' },
      { text: 'The floor collapses into a pit trap!', statCheck: 'agility' },
      { text: 'A mummy lord rises to defend his tomb!', statCheck: 'strength' },
    ],
    items: ['Golden Scarab', 'Ancient Relic', 'Pharaoh\'s Ring', 'Sandstone Tablet', 'Cursed Amulet'],
  },
};

// Narrative templates for outcomes
const NARRATIVES = {
  success: {
    strength: [
      'With a mighty blow, you overpower the challenge! Your strength proves unstoppable.',
      'Your raw power smashes through the obstacle! Muscles straining, you emerge victorious.',
      'Channeling your inner warrior, you crush the opposition with sheer force!',
    ],
    intelligence: [
      'Your keen mind finds the solution! Clever thinking outsmarts the challenge.',
      'Using your vast knowledge, you devise a brilliant strategy and succeed!',
      'Your intellect pierces through the deception! The path is now clear.',
    ],
    agility: [
      'With lightning-fast reflexes, you dodge danger and strike true!',
      'Your nimble movements outpace the threat! Grace and speed win the day.',
      'Like a shadow, you slip past the danger and emerge unscathed!',
    ],
    wisdom: [
      'Your deep understanding reveals the truth! Wisdom guides you to victory.',
      'Trusting your instincts, you make the perfect decision at the perfect moment!',
      'Your spiritual awareness detects the hidden weakness! You exploit it masterfully.',
    ],
  },
  failure: {
    strength: [
      'Despite your powerful efforts, the challenge overpowers you this time.',
      'Your muscles ache as the enemy proves too strong. A tactical retreat is wise.',
      'Brute force wasn\'t enough. You withdraw, bruised but wiser.',
    ],
    intelligence: [
      'The puzzle proves more complex than anticipated. You need more knowledge.',
      'Your calculations were slightly off. Next time you\'ll be better prepared.',
      'The magical trap outsmarts you. A learning experience, if nothing else.',
    ],
    agility: [
      'You almost dodged in time. Almost. The trap catches you off guard.',
      'Your quick reflexes weren\'t quick enough today. Time to train more.',
      'The enemy anticipates your moves. You retreat to reassess.',
    ],
    wisdom: [
      'The spirits remain silent. Your connection isn\'t strong enough yet.',
      'You misinterpret the signs. The challenge continues to elude you.',
      'Dark forces cloud your judgment. You need to strengthen your spirit.',
    ],
  },
};

const getRandomFromArray = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const calculateSuccessChance = (
  risk: 'low' | 'medium' | 'high',
  playerStat: number,
  playerLevel: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'epic'
): number => {
  const baseChance = {
    low: 75,
    medium: 55,
    high: 35,
  };

  const difficultyModifier = {
    easy: 10,
    medium: 0,
    hard: -10,
    epic: -20,
  };

  const statBonus = Math.floor(playerStat * 1.5);
  const levelBonus = playerLevel * 2;
  
  let chance = baseChance[risk] + difficultyModifier[difficulty] + statBonus + levelBonus;
  
  // Cap between 10% and 95%
  return Math.max(10, Math.min(95, chance));
};

const getDifficulty = (playerLevel: number, dungeonMinLevel: number): 'easy' | 'medium' | 'hard' | 'epic' => {
  const levelDiff = playerLevel - dungeonMinLevel;
  
  if (levelDiff >= 8) return 'easy';
  if (levelDiff >= 5) return 'medium';
  if (levelDiff >= 2) return 'hard';
  return 'epic';
};

const calculateRewards = (
  dungeon: DungeonType,
  difficulty: 'easy' | 'medium' | 'hard' | 'epic',
  playerLevel: number
): { xp: number; gold: number } => {
  const difficultyMultiplier = {
    easy: 0.7,
    medium: 1.0,
    hard: 1.5,
    epic: 2.5,
  };

  const baseXP = dungeon.baseXP * (1 + playerLevel * 0.3);
  const baseGold = dungeon.baseGold * (1 + playerLevel * 0.2);

  return {
    xp: Math.floor(baseXP * difficultyMultiplier[difficulty]),
    gold: Math.floor(baseGold * difficultyMultiplier[difficulty]),
  };
};

export const generateDungeonScenario = async (
  playerLevel: number,
  _playerClass: string,
  dungeonName: string
): Promise<DungeonScenario> => {
  // Small delay for dramatic effect
  await new Promise(resolve => setTimeout(resolve, 500));

  const dungeon = DUNGEON_TYPES.find(d => d.name === dungeonName) || DUNGEON_TYPES[0];
  const templates = SCENARIO_TEMPLATES[dungeon.id] || SCENARIO_TEMPLATES['dungeon'];
  const difficulty = getDifficulty(playerLevel, dungeon.minLevel);
  const rewards = calculateRewards(dungeon, difficulty, playerLevel);

  const title = getRandomFromArray(templates.titles);
  const environment = getRandomFromArray(templates.environments);
  const challenge = getRandomFromArray(templates.challenges);
  const items = [getRandomFromArray(templates.items)];

  // Add extra items for higher difficulties
  if (difficulty === 'hard' || difficulty === 'epic') {
    items.push(getRandomFromArray(templates.items));
  }
  if (difficulty === 'epic') {
    items.push(getRandomFromArray(templates.items));
  }

  // Generate choices based on player class
  const choices: DungeonChoice[] = [
    {
      id: '1',
      text: getChoiceText('strength'),
      risk: 'high',
      successChance: calculateSuccessChance('high', 5, playerLevel, difficulty),
      statBonus: 'strength',
    },
    {
      id: '2',
      text: getChoiceText('intelligence'),
      risk: 'medium',
      successChance: calculateSuccessChance('medium', 5, playerLevel, difficulty),
      statBonus: 'intelligence',
    },
    {
      id: '3',
      text: getChoiceText('agility'),
      risk: 'low',
      successChance: calculateSuccessChance('low', 5, playerLevel, difficulty),
      statBonus: 'agility',
    },
  ];

  return {
    title,
    description: `You venture deeper into ${dungeon.name}. ${dungeon.description}`,
    environment,
    challenge: challenge.text,
    choices,
    rewards: {
      ...rewards,
      items,
    },
    difficulty,
  };
};

const getChoiceText = (approach: string): string => {
  const texts: Record<string, string> = {
    strength: `Face it head-on with raw power!`,
    intelligence: `Analyze the situation and find a clever solution`,
    agility: `Use speed and stealth to overcome the challenge`,
    wisdom: `Trust your instincts and spiritual awareness`,
  };
  return texts[approach] || 'Proceed carefully';
};

export const resolveChoice = async (
  scenario: DungeonScenario,
  choice: DungeonChoice,
  playerStats: PlayerStats
): Promise<DungeonResult> => {
  // Small delay for dramatic effect
  await new Promise(resolve => setTimeout(resolve, 800));

  // Get the relevant stat based on choice
  const relevantStat = playerStats[choice.statBonus as keyof PlayerStats] || 5;
  
  // Calculate adjusted success chance with player's actual stats
  const statBonus = Math.floor(relevantStat * 2);
  const adjustedChance = Math.max(10, Math.min(95, choice.successChance + statBonus));
  
  // Determine success
  const roll = Math.random() * 100;
  const success = roll <= adjustedChance;

  // Calculate rewards
  const xpMultiplier = success ? 1.0 : 0.3;
  const goldMultiplier = success ? 1.0 : 0.25;

  // Bonus for high stat
  const statMultiplier = 1 + (relevantStat / 50);

  const xpEarned = Math.floor(scenario.rewards.xp * xpMultiplier * statMultiplier);
  const goldEarned = Math.floor(scenario.rewards.gold * goldMultiplier * statMultiplier);

  // Determine which stat narrative to use
  const primaryStat = choice.statBonus as keyof typeof NARRATIVES.success;
  const narratives = success ? NARRATIVES.success[primaryStat] : NARRATIVES.failure[primaryStat];
  const narrative = getRandomFromArray(narratives);

  // Generate consequences
  const consequences = success
    ? `Your ${choice.statBonus} has grown stronger from this experience. (+${xpEarned} XP)`
    : `You've learned from this setback. Your ${choice.statBonus} will serve you better next time.`;

  return {
    success,
    narrative,
    xpEarned,
    goldEarned,
    itemsFound: success ? (scenario.rewards.items || []) : [],
    consequences,
  };
};