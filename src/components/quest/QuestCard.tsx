import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Task } from '../../types/types';
import { getDifficultyIcon, getDifficultyColor } from '../../utils/xpCalculator';

interface QuestCardProps {
  task: Task;
  isDragging?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-gray-800 rounded-lg border-2 p-4 cursor-grab active:cursor-grabbing
        ${isSortableDragging ? 'opacity-50' : 'opacity-100'}
        ${task.difficulty === 'epic' ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
          task.difficulty === 'hard' ? 'border-orange-500 shadow-lg shadow-orange-500/20' :
          'border-gray-600'}
        ${isDragging ? 'scale-105' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-pixel text-sm text-gray-100 flex-1">{task.title}</h3>
        <span className="text-lg">{getDifficultyIcon(task.difficulty)}</span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mb-3 font-pixel-secondary">
          {task.description.slice(0, 100)}...
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className={`${getDifficultyColor(task.difficulty)} font-pixel-secondary`}>
          {task.difficulty.toUpperCase()}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">⚡ {task.xpReward} XP</span>
          <span className="text-amber-400">🪙 {task.goldReward}</span>
        </div>
      </div>
    </motion.div>
  );
};