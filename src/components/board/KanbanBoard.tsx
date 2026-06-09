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

// You'll need to create this component
const COLUMNS: { status: TaskStatus; title: string; icon: string }[] = [
  { status: 'backlog', title: 'Quest Board', icon: '📋' },
  { status: 'active', title: 'Active Quests', icon: '⚔️' },
  { status: 'completed', title: 'Completed', icon: '✨' },
  { status: 'failed', title: 'Failed', icon: '💀' },
];

export const KanbanBoard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);

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
      moveTask(activeTask.id, over.id as TaskStatus, 0);
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        moveTask(activeTask.id, overTask.status, overTask.order);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-pixel text-yellow-400 mb-8">
        ⚔️ TaskMate Quest Log
      </h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <div key={column.status} className="bg-gray-800/50 rounded-lg p-4">
              <h2 className="font-pixel text-lg text-gray-300 mb-4">
                {column.icon} {column.title}
              </h2>
              <SortableContext
                items={getTasksByStatus(column.status).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {getTasksByStatus(column.status).map((task) => (
                  <div key={task.id} className="mb-2">
                    <QuestCard task={task} />
                  </div>
                ))}
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <QuestCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};