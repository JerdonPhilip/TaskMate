# TaskMate - RPG Quest Log

A high-performance, RPG-themed task management dashboard that runs entirely client-side. Transform your daily tasks into epic quests, explore dungeons, collect loot, and level up your productivity!

## Features

- RPG Themed Interface: Classic RPG UI with pixel fonts, gradients, and fantasy aesthetics
- Kanban Board: Drag-and-drop quest organization with backlog, active, completed, and failed columns
- Character Progression: Level up system with 4 unique classes (Warrior, Mage, Rogue, Cleric)
- Stat System: STR, INT, AGI, WIS stats with equipment bonuses and stat point allocation
- HP & Mana System: Health and mana bars affected by combat, tasks, and potions
- Dungeon Exploration: 8 unique dungeon types with custom scenarios, choices, and rewards
- Loot System: 5 rarity tiers (Common, Uncommon, Rare, Epic, Legendary) with different drop rates
- Inventory System: Equip weapons, armor, and accessories with stat bonuses
- Potion Shop: Buy and use HP/Mana potions, free daily heals, and full rest options
- Gold Economy: Earn gold from quests and dungeons, spend in shop
- Quest Rewards: XP and gold based on difficulty (Trivial, Easy, Medium, Hard, Epic)
- Streak Tracking: Daily quest streaks with bonus rewards
- Drag & Drop: Smooth drag-and-drop between columns with visual feedback
- Animations: Quest completion effects, level up celebrations, and loot drop animations
- Data Persistence: Auto-saves to browser localStorage
- Encrypted Backups: Export/import encrypted backup files (.tmenc) with checksum verification
- Data Security: Optional encryption for saved data with salt protection
- No Backend Required: Fully functional client-side application
- Responsive Design: Works on desktop and mobile devices

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management with persist middleware
- @dnd-kit for drag and drop
- Framer Motion for animations
- UUID for unique ID generation

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

# Clone the repository
git clone https://github.com/yourusername/taskmate.git
cd taskmate

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173

### Build for Production

npm run build

### Preview Production Build

npm run preview

## Project Structure

src/
  components/
    animations/     - Quest complete, level up effects
    board/          - Kanban board and columns
    character/      - Character sheet, stats, reset modal
    dungeon/        - Dungeon explorer and screens
    inventory/      - Inventory modal and item cards
    layout/         - Header, footer, data manager, backup modals
    quest/          - Quest cards, quest form
    shop/           - Potion shop modal
    ui/             - Notifications, buttons, progress bars
  data/             - Loot database, potion shop data
  hooks/            - Custom React hooks
  services/         - Dungeon engine with scenario generation
  stores/           - Zustand stores (user, tasks, inventory, dungeon)
  types/            - TypeScript interfaces
  utils/            - Utility functions, encryption, calculations

## How to Play

### Getting Started
1. Create a character by choosing a name and class
2. Each class has unique base stats and growth rates:
   - Warrior: High STR, gains +3 STR/+2 AGI per level
   - Mage: High INT, gains +3 INT/+2 WIS per level
   - Rogue: High AGI, gains +3 AGI/+2 STR per level
   - Cleric: High WIS, gains +3 WIS/+2 INT per level

### Creating Quests
1. Click "New Quest" button
2. Enter quest name (required, min 3 characters)
3. Choose difficulty (affects XP and Gold rewards)
4. Set priority level
5. Add optional tags and description
6. Click "Accept Quest"

### Managing Quests
- Drag quests between columns to change status
- Backlog: Available quests to start
- Active: Quests in progress
- Completed: Finished quests (earn rewards)
- Failed: Abandoned quests (take damage)

### Character Progression
- Complete quests to earn XP and level up
- Each level grants 2 stat points to allocate
- Stats automatically increase based on class
- HP = STR x 10 + Level x 5
- Mana = INT x 10 + Level x 5

### Dungeon Exploration
1. Click the Dungeon button
2. Choose a dungeon based on your level
3. Read the generated scenario
4. Make a choice (each affects success chance)
5. Win to earn XP, Gold, and loot items
6. Losing deals damage to HP and Mana

### Loot & Inventory
- Items drop with different rarities:
  - Common (80% drop rate) - Gray
  - Uncommon (60% drop rate) - Green
  - Rare (20% drop rate) - Blue
  - Epic (5% drop rate) - Purple
  - Legendary (0.001% drop rate) - Gold
- Equip weapons, armor, and accessories for stat bonuses
- Sell unwanted items for gold

### Potion Shop
- Buy HP and Mana potions
- Use free daily heals (3 per day)
- Full rest restores all HP/Mana for 50 gold
- Potions can be used from inventory

### Data Management
- Auto-save: Progress saved automatically to browser
- Backup: Export encrypted .tmenc files
- Restore: Import backup files to recover progress
- Encrypt: Secure your saved data with encryption
- Clear: Reset all data and start fresh

## Data Storage

All data is stored in your browser's localStorage:
- taskmate-user: Character data, stats, HP/Mana
- taskmate-tasks: Quest board and quest log
- taskmate-inventory: Items, equipment, gold
- taskmate-dungeon: Exploration history

Important: 
- Data does NOT sync across devices
- Clearing browser data will delete ALL progress
- Create regular backups using the Save button
- Backup files are encrypted for security

## Deployment

### GitHub Pages

# Update vite.config.ts base path
base: '/taskmate/'

# Build and deploy
npm run build
npm run deploy

### Netlify / Vercel

1. Connect your repository
2. Set build command: npm run build
3. Set publish directory: dist
4. Deploy

## License

MIT License - Feel free to use and modify!

## Credits

Built with passion for RPGs and productivity. Icons from emoji sets, fonts from Google Fonts (Press Start 2P, VT323).

---

Adventure awaits! May your quests be epic and your productivity legendary!