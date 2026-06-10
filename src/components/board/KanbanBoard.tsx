import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTaskStore } from '../../stores/useTaskStore';
import { TaskStatus, Task } from '../../types/types';
import { QuestCard } from '../quest/QuestCard';
import { QuestForm } from '../quest/QuestForm';
import { CharacterSheet } from '../character/CharacterSheet';
import { QuestComplete } from '../animations/QuestComplete';
import { DataManager } from '../layout/DataManager';
import { BackupReminder } from '../layout/BackupReminder';
import { NotificationSystem } from '../ui/Notification';
import { DungeonExplorer } from '../dungeon/DungeonExplorer';
import { InventoryModal } from '../inventory/InventoryModal';
import { ShopModal } from '../shop/ShopModal';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS: { 
  status: TaskStatus; 
  title: string; 
  icon: string;
  color: string;
  description: string;
}[] = [
  { 
    status: 'backlog', 
    title: 'Quest Board', 
    icon: '📋',
    color: 'from-gray-600 to-gray-700',
    description: 'Available quests'
  },
  { 
    status: 'active', 
    title: 'Active Quests', 
    icon: '⚔️',
    color: 'from-blue-600 to-blue-700',
    description: 'In progress'
  },
  { 
    status: 'completed', 
    title: 'Completed', 
    icon: '✨',
    color: 'from-green-600 to-green-700',
    description: 'Well done!'
  },
  { 
    status: 'failed', 
    title: 'Failed', 
    icon: '💀',
    color: 'from-red-600 to-red-700',
    description: 'Better luck next time'
  },
];

export const KanbanBoard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showDungeonExplorer, setShowDungeonExplorer] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const completeTask = useTaskStore((state) => state.completeTask);
  const inventoryCount = useInventoryStore((state) => state.getInventoryCount());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    if (COLUMNS.some((col) => col.status === over.id)) {
      const newStatus = over.id as TaskStatus;
      
      if (newStatus === 'completed') {
        completeTask(activeTask.id);
      } else {
        moveTask(activeTask.id, newStatus, 0);
      }
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask && overTask.status === 'completed') {
        completeTask(activeTask.id);
      } else if (overTask) {
        moveTask(activeTask.id, overTask.status, overTask.order);
      }
    }
  };

  const totalQuests = tasks.length;
  const completedQuests = tasks.filter(t => t.status === 'completed').length;
  const activeQuests = tasks.filter(t => t.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 drop-shadow-lg flex items-center gap-2">
              ⚔️ TaskMate
            </h1>
            <p className="text-gray-400 text-sm mt-1 ml-1">
              RPG Quest Log • {totalQuests} Quests • {activeQuests} Active • {completedQuests} Completed
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Dungeon Explorer Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDungeonExplorer(true)}
              className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 
                       hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg border border-purple-400 group"
              title="Explore Dungeons"
            >
              <span className="text-lg">🗺️</span>
              <span className="hidden sm:inline ml-1">Dungeon</span>
            </motion.button>

            {/* Shop Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShop(true)}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 
                       hover:to-amber-700 text-white px-4 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg border border-yellow-400"
              title="Potion Shop"
            >
              <span className="text-lg">🏪</span>
              <span className="hidden sm:inline ml-1">Shop</span>
            </motion.button>

            {/* Inventory Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInventory(true)}
              className="relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 
                       hover:to-teal-700 text-white px-4 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg border border-emerald-400"
              title="Inventory"
            >
              <span className="text-lg">🎒</span>
              {inventoryCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] 
                               font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {inventoryCount > 99 ? '99+' : inventoryCount}
                </span>
              )}
            </motion.button>

            {/* Data Management Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDataManager(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                       hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg border border-blue-400"
              title="Backup & Restore Data"
            >
              <span className="text-lg">💾</span>
            </motion.button>
            
            {/* New Quest Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuestForm(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 
                       hover:to-amber-800 text-white px-6 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg hover:shadow-amber-500/50
                       border border-amber-400 flex items-center gap-2"
            >
              <span>📜</span> New Quest
            </motion.button>
          </div>
        </div>

        {/* Character Stats */}
        <div className="mb-6">
          <CharacterSheet />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-4">
          <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">Total Quests</div>
            <div className="text-xl font-bold text-white">{totalQuests}</div>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">Active</div>
            <div className="text-xl font-bold text-blue-400">{activeQuests}</div>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">Completed</div>
            <div className="text-xl font-bold text-green-400">{completedQuests}</div>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">Failed</div>
            <div className="text-xl font-bold text-red-400">
              {tasks.filter(t => t.status === 'failed').length}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.status);
              return (
                <div 
                  key={column.status} 
                  className="flex flex-col"
                >
                  {/* Column Header */}
                  <div className={`
                    bg-gradient-to-r ${column.color} rounded-t-lg p-3 
                    border border-gray-600 border-b-0
                  `}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-white text-sm flex items-center gap-2">
                          {column.icon} {column.title}
                        </h2>
                        <p className="text-xs text-gray-200 mt-0.5 opacity-80">
                          {column.description}
                        </p>
                      </div>
                      <span className="bg-black/30 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Column Content */}
                  <div 
                    className="bg-gray-800/80 rounded-b-lg p-3 min-h-[200px] 
                               border border-gray-600 border-t-0 flex-1"
                  >
                    <SortableContext
                      items={columnTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                      id={column.status}
                    >
                      <AnimatePresence>
                        {columnTasks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-3xl mb-2 opacity-50">{column.icon}</div>
                            <p className="text-gray-500 text-sm font-medium">No quests here</p>
                            <p className="text-gray-600 text-xs mt-1">
                              Drag quests to this area
                            </p>
                          </div>
                        ) : (
                          columnTasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="mb-3"
                            >
                              <QuestCard task={task} />
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? <QuestCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>

        {/* Footer Tips */}
        <div className="mt-2 px-4 text-center">
          <p className="text-xs text-gray-600">
            💡 Drag quests between columns • 🗺️ Explore dungeons • 🏪 Buy potions • 🎒 View inventory • 💾 Backup
          </p>
        </div>
      </div>

      {/* Quest Form Modal */}
      <AnimatePresence>
        {showQuestForm && (
          <QuestForm onClose={() => setShowQuestForm(false)} />
        )}
      </AnimatePresence>

      {/* Data Manager Modal */}
      <DataManager 
        isOpen={showDataManager} 
        onClose={() => setShowDataManager(false)} 
      />

      {/* Dungeon Explorer Modal */}
      <AnimatePresence>
        {showDungeonExplorer && (
          <DungeonExplorer onClose={() => setShowDungeonExplorer(false)} />
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <InventoryModal 
        isOpen={showInventory} 
        onClose={() => setShowInventory(false)} 
      />

      {/* Shop Modal */}
      <ShopModal 
        isOpen={showShop} 
        onClose={() => setShowShop(false)} 
      />

      {/* Backup Reminder */}
      <BackupReminder 
        onBackupClick={() => setShowDataManager(true)} 
      />

      {/* Notification System */}
      <NotificationSystem />

      {/* Quest Complete Animation */}
      <QuestComplete />
    </div>
  );
};