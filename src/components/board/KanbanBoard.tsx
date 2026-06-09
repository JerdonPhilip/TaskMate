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
  
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const completeTask = useTaskStore((state) => state.completeTask);

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
          
          <div className="flex gap-2">
            {/* Data Management Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDataManager(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                       hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-bold text-sm 
                       transition-all shadow-lg border border-blue-400 relative group"
              title="Backup & Restore Data"
            >
              <span className="text-xl">💾</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full 
                             animate-pulse hidden group-hover:block"></span>
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
        <div className="mt-8 px-4 text-center">
          <p className="text-xs text-gray-600">
            💡 Tip: Drag quests between columns • Click 💾 to backup your progress • 
            Your data is saved automatically in this browser
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