'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Activity, Store } from 'lucide-react';

export function DashboardMenu() {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      
      <Button 
        onClick={() => router.push('/dashboard/lojas/nova-com-usuario')}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <Store className="h-4 w-4 mr-2" />
        Nova Loja
      </Button>
    </div>
  );
}