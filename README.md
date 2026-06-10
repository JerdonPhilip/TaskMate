quest-board/
├── client/                    # Frontend (React + Vite)
│   ├── public/
│   │   └── assets/
│   │       └── sprites/      # Pixel art assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── board/
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   └── Column.jsx
│   │   │   ├── profile/
│   │   │   │   ├── HeroProfile.jsx
│   │   │   │   └── XPBar.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Dashboard.jsx
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useAuth.js
│   │   │   └── useXP.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── boardStore.js
│   │   │   └── userStore.js
│   │   ├── services/
│   │   │   ├── socketService.js
│   │   │   └── apiService.js
│   │   ├── utils/
│   │   │   ├── xpCalculator.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── server/                    # Backend (Node.js + Express)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── xpService.js
│   │   │   └── socketService.js
│   │   ├── utils/
│   │   │   └── jwtHelper.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── LICENSE
├── README.md
└── CONTRIBUTING.md



# ⚔️ RPG Quest Log - Task Management Dashboard

A high-performance, RPG-themed task management dashboard that runs entirely client-side. Transform your daily tasks into epic quests and level up your productivity!

## 🎮 Features

- **RPG Themed Interface**: Classic RPG UI components with pixel fonts and fantasy aesthetics
- **Kanban Board**: Drag-and-drop quest organization
- **Character Progression**: Level up system based on completed tasks
- **XP & Rewards**: Earn experience points and gold for completing quests
- **Achievement System**: Unlock achievements for milestones
- **Streak Tracking**: Maintain daily streaks for bonus rewards
- **Local Storage**: All data persists in your browser
- **Animations**: Satisfying quest completion and level-up effects
- **No Backend Required**: Fully functional client-side application

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rpg-quest-board.git
cd rpg-quest-board

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173

