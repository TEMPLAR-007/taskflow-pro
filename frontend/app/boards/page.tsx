'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Board {
  id: string;
  title: string;
  ownerId?: string;
  owner: { id?: string; email: string; name?: string | null };
}

export default function BoardsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteBoard(e: React.MouseEvent, boardId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    setDeleting(boardId);
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      api
        .get('/boards')
        .then((res) => setBoards(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await api.post('/boards', { title });
    setBoards((prev) => [res.data, ...prev]);
    setTitle('');
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
              Boards
            </h1>
            <p className="text-neutral-500 text-sm">Organize your tasks and projects</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user?.email}</span>
            <button
              onClick={() => {
                void logout();
                router.push('/login');
              }}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={createBoard} className="mb-8 max-w-xl">
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Create a new board..."
              className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm disabled:opacity-50"
              disabled={!title.trim()}
            >
              Create
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">Loading...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No boards yet. Create one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((b) => (
              <div key={b.id} className="relative group">
                <Link
                  href={`/boards/${b.id}`}
                  className="block bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm p-6 transition-all"
                >
                  <h2 className="font-semibold text-lg text-neutral-900 mb-1">{b.title}</h2>
                  <p className="text-sm text-neutral-500">
                    {b.owner ? (b.owner.name || b.owner.email) : 'You'}
                  </p>
                </Link>
                {(!b.ownerId || b.ownerId === user?.id || b.owner?.id === user?.id) && (
                  <button
                    onClick={(e) => deleteBoard(e, b.id)}
                    disabled={deleting === b.id}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 text-xl leading-none"
                    title="Delete board"
                  >
                    {deleting === b.id ? '...' : '×'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
