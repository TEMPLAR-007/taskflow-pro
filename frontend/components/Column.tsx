'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface ColumnProps {
  column: Column;
  boardId: string;
  onTaskCreated: () => void;
  onTaskDeleted: () => void;
}

export default function ColumnComponent({
  column,
  boardId,
  onTaskCreated,
  onTaskDeleted,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/columns/${column.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });

      if (response.ok) {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setIsAdding(false);
        onTaskCreated();
      }
    } catch (error) {
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        onTaskDeleted();
      }
    } catch (error) {
    }
  };

  const getColumnBorderColor = () => {
    const colors = {
      todo: 'border-neutral-200',
      in_progress: 'border-blue-200',
      done: 'border-emerald-200'
    };
    return colors[column.id as keyof typeof colors] || 'border-neutral-200';
  };

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className={`bg-white rounded-lg border ${getColumnBorderColor()} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
          {column.title}
        </h2>
        <span className="text-xs text-neutral-500 font-medium">
          {column.tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="space-y-3 min-h-[400px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} />
          ))}
        </SortableContext>
      </div>

      {isAdding ? (
        <form onSubmit={handleAddTask} className="mt-4 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md mb-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setNewTaskPriority('medium');
              }}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 w-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-md flex items-center justify-center gap-2 border border-dashed border-neutral-300"
        >
          <PlusIcon className="h-4 w-4" />
          Add task
        </button>
      )}
    </div>
  );
}
