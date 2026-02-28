'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h2 className="text-lg font-medium text-gray-900">Cliente não encontrado</h2>
      <p className="text-sm text-gray-500 mt-1">
        O cliente não possui resgates nesta loja
      </p>
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mt-4"
      >
        Voltar
      </Button>
    </div>
  );
}