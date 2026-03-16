'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, QrCode, Gift } from 'lucide-react';
import { toast } from 'sonner';
import clienteService, { Resgate } from '@/services/cliente';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ResgatesClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [resgates, setResgates] = useState<Resgate[]>([]);

  const carregarResgates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await clienteService.getResgatesCliente(id, 1, 50);
      setResgates(response.resgates);
    } catch {
      toast.error('Erro ao carregar resgates do cliente');
      router.push('/dashboard/clientes');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    carregarResgates();
  }, [id, carregarResgates]);

  const formatarData = (data: string | undefined | null) => {
    if (!data) return 'N/A';
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando resgates...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resgates do Cliente</h1>
            <p className="text-gray-500 mt-1">
              Liste os resgates e acesse os QR codes de cada um
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resgates</CardTitle>
            <CardDescription>
              {resgates.length} resgate{resgates.length === 1 ? '' : 's'} encontrado{resgates.length === 1 ? '' : 's'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cupom</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>QR codes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[90px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resgates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <QrCode className="h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  resgates.map((resgate) => {
                    const qrValidados = resgate.qrCodes?.filter(q => q.validado).length || 0;
                    const todosValidados = resgate.qrCodes?.length
                      ? qrValidados === resgate.qrCodes.length
                      : false;

                    return (
                      <TableRow key={resgate.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-700">
                          {formatarData(resgate.resgatadoEm)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {resgate.cupom.codigo}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {resgate.quantidade}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {resgate.qrCodes?.length ?? 0}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[11px] ${
                              todosValidados
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {todosValidados ? 'Completo' : 'Parcial'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/clientes/${id}/resgates/${resgate.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Gift className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
