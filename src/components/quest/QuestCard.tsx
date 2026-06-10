import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Task } from '../../types/types';
import { getDifficultyIcon, getDifficultyColor } from '../../utils/xpCalculator';
import { useTaskStore } from '../../stores/useTaskStore';
import { useInventoryStore } from '../../stores/useInventoryStore';

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

  const addGoldToInventory = useInventoryStore((state) => state.addGold);
  const completeTask = useTaskStore((state) => state.completeTask);
  const moveTask = useTaskStore((state) => state.moveTask);

  const getStatusStyles = () => {
    switch (task.status) {
      case 'completed':
        return {
          border: 'border-green-500',
          bg: 'bg-green-900/20',
          overlay: 'bg-green-500/10',
          badge: 'bg-green-500 text-white',
          icon: '✅',
          label: 'COMPLETED'
        };
      case 'active':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-900/20',
          overlay: 'bg-blue-500/10',
          badge: 'bg-blue-500 text-white',
          icon: '⚔️',
          label: 'ACTIVE'
        };
      case 'failed':
        return {
          border: 'border-red-500',
          bg: 'bg-red-900/20',
          overlay: 'bg-red-500/10',
          badge: 'bg-red-500 text-white',
          icon: '💀',
          label: 'FAILED'
        };
      default:
        return {
          border: task.difficulty === 'epic' ? 'border-purple-500' :
            task.difficulty === 'hard' ? 'border-orange-500' : 'border-gray-600',
          bg: 'bg-gray-800',
          overlay: '',
          badge: 'bg-gray-600 text-gray-300',
          icon: '📋',
          label: 'BACKLOG'
        };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <motion.div
      ref={ setNodeRef }
      style={ style }
      { ...attributes }
      { ...listeners }
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, scale: 0.9 } }
      whileHover={ { scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' } }
      className={ `
        relative rounded-lg border-2 p-4 cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${statusStyle.border}
        ${statusStyle.bg}
        ${isSortableDragging ? 'opacity-50' : 'opacity-100'}
        ${isDragging ? 'scale-105 shadow-2xl' : 'shadow-lg'}
      `}
    >
      {/* Status Badge */ }
      <div className="absolute -top-2 -right-2 z-10">
        <span className={ `
          px-2 py-1 rounded-full text-[10px] font-bold
          ${statusStyle.badge}
          shadow-lg
        `}>
          { statusStyle.icon } { statusStyle.label }
        </span>
      </div>

      {/* Card Content */ }
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-base text-white flex-1 leading-tight pr-2">
          { task.title }
        </h3>
        <span className="text-2xl flex-shrink-0">{ getDifficultyIcon(task.difficulty) }</span>
      </div>

      { task.description && (
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          { task.description.length > 100
            ? `${task.description.slice(0, 100)}...`
            : task.description }
        </p>
      ) }

      {/* Difficulty & Rewards */ }
      <div className="flex items-center justify-between mb-3">
        <span className={ `
          text-xs font-semibold px-2 py-1 rounded
          ${getDifficultyColor(task.difficulty)}
          bg-gray-700/50
        `}>
          { task.difficulty.toUpperCase() }
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400 font-semibold">
            ⚡ { task.xpReward } XP
          </span>
          <span className="text-yellow-400 font-semibold">
            🪙 { task.goldReward }
          </span>
        </div>
      </div>

      {/* Due Date */ }
      { task.dueDate && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <span className="text-xs text-orange-400 flex items-center gap-1">
            ⏰ Due: { new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) }
          </span>
        </div>
      ) }

      {/* Tags */ }
      { task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          { task.tags.map((tag) => (
            <span
              key={ tag }
              className="text-[11px] bg-gray-700 text-gray-300 px-2 py-1 rounded-full font-medium"
            >
              #{ tag }
            </span>
          )) }
        </div>
      ) }

      {/* Action Buttons for Active Tasks */ }
      { task.status === 'active' && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
          <button
            onClick={ (e) => {
              e.stopPropagation();
              completeTask(task.id);
              addGoldToInventory(task.goldReward);
            } }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold 
                     py-1.5 px-3 rounded transition-colors"
          >
            ✅ Complete
          </button>
          <button
            onClick={ (e) => {
              e.stopPropagation();
              moveTask(task.id, 'failed', 0);
            } }
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold 
                     py-1.5 px-3 rounded transition-colors"
          >
            💀 Fail
          </button>
        </div>
      ) }

      {/* Move to Active Button for Backlog */ }
      { task.status === 'backlog' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={ (e) => {
              e.stopPropagation();
              moveTask(task.id, 'active', 0);
            } }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold 
                     py-1.5 px-3 rounded transition-colors"
          >
            ⚔️ Start Quest
          </button>
        </div>
      ) }

      {/* Timestamp */ }
      <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
        <span>Created: { new Date(task.createdAt).toLocaleDateString() }</span>
        { task.completedAt && (
          <span>Done: { new Date(task.completedAt).toLocaleDateString() }</span>
        ) }
      </div>
    </motion.div>
  );
};