'use client';

import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RelatoriosPage() {
  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 mt-1">
          Visualize os relatórios do sistema
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Em desenvolvimento</CardTitle>
            <CardDescription>
              Esta página está sendo construída
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Em breve você poderá gerar relatórios aqui.</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}