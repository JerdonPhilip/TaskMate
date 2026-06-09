import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../../stores/useTaskStore';
import { TaskDifficulty, TaskPriority, TaskFormData } from '../../types/types';

interface QuestFormProps {
  onClose: () => void;
}

const DIFFICULTY_OPTIONS: { value: TaskDifficulty; label: string; icon: string; color: string; xp: number; gold: number }[] = [
  { value: 'trivial', label: 'Trivial', icon: '🌱', color: 'text-gray-400', xp: 5, gold: 1 },
  { value: 'easy', label: 'Easy', icon: '⚔️', color: 'text-green-400', xp: 10, gold: 5 },
  { value: 'medium', label: 'Medium', icon: '🛡️', color: 'text-yellow-400', xp: 25, gold: 15 },
  { value: 'hard', label: 'Hard', icon: '💀', color: 'text-orange-400', xp: 50, gold: 35 },
  { value: 'epic', label: 'Epic', icon: '👑', color: 'text-purple-400', xp: 100, gold: 75 },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; bgColor: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-300', bgColor: 'bg-gray-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-300', bgColor: 'bg-blue-600' },
  { value: 'high', label: 'High', color: 'text-orange-300', bgColor: 'bg-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-300', bgColor: 'bg-red-600' },
];

const CLASS_OPTIONS = [
  { value: undefined, label: 'Any', icon: '🎯' },
  { value: 'warrior' as const, label: 'Warrior', icon: '⚔️' },
  { value: 'mage' as const, label: 'Mage', icon: '🔮' },
  { value: 'rogue' as const, label: 'Rogue', icon: '🗡️' },
  { value: 'cleric' as const, label: 'Cleric', icon: '✨' },
];

export const QuestForm: React.FC<QuestFormProps> = ({ onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    difficulty: 'easy',
    priority: 'normal',
    tags: [],
    assignedClass: undefined,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === formData.difficulty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Quest name is required, adventurer!';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Quest name must be at least 3 characters';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Quest name too long! Max 50 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    addTask(formData);
    onClose();
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      if (formData.tags.length >= 5) {
        setErrors({ ...errors, tags: 'Maximum 5 tags allowed' });
        return;
      }
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setTagInput('');
      setErrors({ ...errors, tags: undefined });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 
                   border-amber-500/50 p-6 max-w-lg w-full shadow-2xl max-h-[90vh] 
                   overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              📜 New Quest
            </h2>
            <p className="text-gray-400 text-sm mt-1">Create a new quest for your adventure log</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl 
                     hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quest Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Quest Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: undefined });
              }}
              placeholder="Enter an epic quest name..."
              className={`w-full bg-gray-700 border-2 rounded-lg px-4 py-2.5 text-white 
                         placeholder-gray-400 font-medium
                         ${errors.title ? 'border-red-500 bg-red-900/20' : 'border-gray-600 focus:border-amber-500'}
                         outline-none transition-all duration-200`}
              maxLength={50}
              autoFocus
            />
            <div className="flex justify-between mt-1.5">
              {errors.title ? (
                <p className="text-red-400 text-xs font-medium">⚠️ {errors.title}</p>
              ) : (
                <p className="text-gray-500 text-xs">Choose a memorable name for your quest</p>
              )}
              <span className={`text-xs ${formData.title.length > 40 ? 'text-yellow-400' : 'text-gray-500'}`}>
                {formData.title.length}/50
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Quest Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what needs to be done to complete this quest..."
              rows={3}
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-2.5 
                       text-white placeholder-gray-400 font-medium
                       focus:border-amber-500 outline-none transition-all duration-200 
                       resize-none"
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">{formData.description.length}/500</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Quest Difficulty
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: option.value })}
                  className={`p-3 rounded-lg border-2 text-center transition-all duration-200
                    ${formData.difficulty === option.value
                      ? 'border-amber-500 bg-gray-700 scale-105 shadow-lg shadow-amber-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                    }`}
                  title={`${option.label} - ${option.xp} XP, ${option.gold} Gold`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className={`text-[11px] font-bold ${option.color}`}>
                    {option.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {option.xp} XP
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Quest Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: option.value })}
                  className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                    ${formData.priority === option.value
                      ? `${option.bgColor} text-white scale-105 shadow-lg ring-2 ring-amber-500`
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class Assignment */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Recommended Class (Optional)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CLASS_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, assignedClass: option.value })}
                  className={`p-2 rounded-lg border-2 text-center transition-all duration-200
                    ${formData.assignedClass === option.value
                      ? 'border-amber-500 bg-gray-700 scale-105 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-[10px] font-semibold text-gray-300">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Quest Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setErrors({ ...errors, tags: undefined });
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (e.g., work, personal, urgent)"
                className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-lg px-3 py-2 
                         text-white placeholder-gray-400 font-medium text-sm
                         focus:border-amber-500 outline-none transition-all duration-200"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 
                         disabled:cursor-not-allowed rounded-lg font-semibold text-sm 
                         transition-all duration-200 text-white"
              >
                Add
              </button>
            </div>
            {errors.tags && (
              <p className="text-red-400 text-xs mb-2">⚠️ {errors.tags}</p>
            )}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded-full text-sm 
                             font-medium flex items-center gap-2 border border-gray-600"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {5 - formData.tags.length} tags remaining
            </p>
          </div>

          {/* Rewards Preview */}
          <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg p-4 
                         border border-gray-600">
            <h3 className="text-sm font-bold text-gray-200 mb-3">🏆 Quest Rewards Preview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-lg font-bold text-green-400">
                  {selectedDifficulty?.xp || 0} XP
                </div>
                <div className="text-xs text-gray-400 mt-1">Experience Points</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🪙</div>
                <div className="text-lg font-bold text-yellow-400">
                  {selectedDifficulty?.gold || 0} Gold
                </div>
                <div className="text-xs text-gray-400 mt-1">Gold Coins</div>
              </div>
            </div>
            {formData.difficulty === 'epic' && (
              <div className="mt-3 text-center">
                <span className="text-purple-400 text-sm font-semibold">
                  🌟 Epic Quest Bonus: +10% XP & Gold!
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 
                       hover:to-amber-800 text-white font-bold py-3 px-6 rounded-lg 
                       transition-all duration-200 shadow-lg hover:shadow-amber-500/50
                       border border-amber-400 text-sm"
            >
              🗡️ Accept Quest
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 
                       font-semibold rounded-lg transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Tip */}
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Drag quests between columns to update their status
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};