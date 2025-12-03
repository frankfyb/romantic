"use client";
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth">
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
