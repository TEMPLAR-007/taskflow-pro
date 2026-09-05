'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/boards' : '/login');
    }
  }, [loading, user, router]);

  return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
}
