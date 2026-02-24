'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accessTokenKey } from '@/utils/constants';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem(accessTokenKey);

    if (token) {
      router.replace('/dashboard/organization');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}