'use client';

import { DashboardLoja } from './components/DashboardLoja';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';

export default function DashboardLojaPage() {
  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DashboardLoja />
      </div>
    </ProtectedRoute>
  );
}