'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColors = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-rose-600',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-lg p-4 border cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'border-blue-400 shadow-lg'
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="text-sm font-medium text-neutral-900 flex-1">
          {task.title}
        </h3>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 text-lg leading-none"
            title="Delete task"
          >
            ×
          </button>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-neutral-600 mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center gap-2">
        {task.priority && (
          <span
            className={`text-xs font-medium ${
              priorityColors[task.priority as keyof typeof priorityColors] ||
              'text-neutral-600'
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}
        {task.due_date && (
          <span className="text-xs text-neutral-500">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
