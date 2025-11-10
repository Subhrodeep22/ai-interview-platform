'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't apply dashboard layout for auth pages
  if (pathname === '/recruiter/login' || pathname === '/recruiter/register') {
    return <>{children}</>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

