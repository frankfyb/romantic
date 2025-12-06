"use client";
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false} refetchInterval={0}>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
