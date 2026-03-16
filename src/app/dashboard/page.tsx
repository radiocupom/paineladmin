// app/dashboard/page.tsx
'use client';

import { DashboardCompleto } from './components/DashboardCompleto';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardCompleto />
    </div>
  );
}