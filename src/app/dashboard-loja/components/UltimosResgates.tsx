'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle2, Clock } from 'lucide-react';
import { ResgateLoja } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';
import { ModalDetalhesResgate } from './ModalDetalhesResgate';

interface UltimosResgatesProps {
  resgates: ResgateLoja[];
}

export function UltimosResgates({ resgates }: UltimosResgatesProps) {
  const [resgateSelecionado, setResgateSelecionado] = useState<ResgateLoja | null>(null);

  // 🔥 LOG PARA DEBUG
  console.log('📦 UltimosResgates - resgates recebidos:', resgates);
  if (resgates.length > 0) {
    console.log('📦 Primeiro resgate - data:', resgates[0].resgatadoEm);
    console.log('📦 Primeiro resgate - status:', resgates[0].status);
  }

  const getStatusBadge = (status: string) => {
    if (status === 'validado') {
      return (
        <Badge className="bg-green-100 text-green-700 flex items-center gap-1 text-xs px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          Validado
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 text-xs px-2 py-0.5">
        <Clock className="h-3 w-3" />
        Pendente
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Últimos Resgates</CardTitle>
          <p className="text-xs text-gray-500">Os {resgates.length} resgates mais recentes</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {resgates.slice(0, 5).map((resgate) => (
              <div 
                key={resgate.id} 
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                {/* Nome e código */}
                <div className="flex-1">
                  <p className="text-sm font-medium">{resgate.cliente.nome}</p>
                  <p className="text-xs text-gray-500">{resgate.cupom.codigo}</p>
                </div>

                {/* Data, Status e Botão */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {resgate.resgatadoEm ? formatters.data(resgate.resgatadoEm, 'curto') : 'Data indisponível'}
                  </span>
                  {resgate.status && getStatusBadge(resgate.status)}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setResgateSelecionado(resgate)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {resgates.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Nenhum resgate encontrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ModalDetalhesResgate
        resgate={resgateSelecionado}
        open={!!resgateSelecionado}
        onOpenChange={(open) => !open && setResgateSelecionado(null)}
      />
    </>
  );
}