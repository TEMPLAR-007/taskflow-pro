'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ColumnComponent from '@/components/Column';
import TaskCard from '@/components/TaskCard';

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

interface Board {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function BoardView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoardData();
  }, [params.id]);

  const fetchBoardData = async () => {
    try {
      const boardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards/${params.id}`, {
        credentials: 'include',
      });

      if (boardRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!boardRes.ok) throw new Error('Failed to fetch board');
      const boardData = await boardRes.json();
      setBoard(boardData);

      if (boardData.columns) {
        setColumns(boardData.columns);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find(col =>
      col.tasks.some(task => task.id === activeId)
    );
    const overColumn = columns.find(col =>
      col.id === overId || col.tasks.some(task => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns(prevColumns => {
      const activeColIndex = prevColumns.findIndex(col => col.id === activeColumn.id);
      const overColIndex = prevColumns.findIndex(col => col.id === overColumn.id);

      const activeTask = activeColumn.tasks.find(task => task.id === activeId);
      if (!activeTask) return prevColumns;

      const newColumns = [...prevColumns];
      newColumns[activeColIndex] = {
        ...activeColumn,
        tasks: activeColumn.tasks.filter(task => task.id !== activeId)
      };

      const overTaskIndex = overColumn.tasks.findIndex(task => task.id === overId);
      const insertIndex = overTaskIndex >= 0 ? overTaskIndex : overColumn.tasks.length;

      newColumns[overColIndex] = {
        ...overColumn,
        tasks: [
          ...overColumn.tasks.slice(0, insertIndex),
          { ...activeTask, status: overColumn.id },
          ...overColumn.tasks.slice(insertIndex)
        ]
      };

      return newColumns;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find(col =>
      col.tasks.some(task => task.id === taskId)
    );
    const targetColumn = columns.find(col =>
      col.id === overId || col.tasks.some(task => task.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;

    const targetColumnId = targetColumn.id;
    const targetIndex = targetColumn.tasks.findIndex(t => t.id === overId);
    const position = targetIndex >= 0 ? targetIndex : targetColumn.tasks.length;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ columnId: targetColumnId, position }),
      });

      if (!response.ok) {
        fetchBoardData();
      }
    } catch (error) {
      fetchBoardData();
    }
  };

  const handleShareBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards/${params.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: shareEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        setShareError(data.message || 'Failed to share board');
        return;
      }

      setShareEmail('');
      setShowShareModal(false);
      fetchBoardData();
    } catch (error) {
      setShareError('Failed to share board');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Board not found</p>
          <Link href="/boards" className="text-blue-600 hover:text-blue-700">
            Return to boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="mb-8">
          <Link
            href="/boards"
            className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Boards
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">
                {board.name}
              </h1>
              {board.description && (
                <p className="text-neutral-500 mt-1">{board.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Share Board
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                boardId={params.id}
                onTaskCreated={fetchBoardData}
                onTaskDeleted={fetchBoardData}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-50">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Share Board</h2>
            <form onSubmit={handleShareBoard}>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                required
              />
              {shareError && (
                <p className="text-sm text-rose-600 mb-3">{shareError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                    setShareError('');
                  }}
                  className="px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
