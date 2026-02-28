'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatarMoeda } from '@/services/dashboardLoja';
import { Clock, DollarSign } from 'lucide-react';

interface UltimosResgatesProps {
  resgates: Array<{
    id: string;
    quantidade: number;
    resgatadoEm: string;
    cliente: {
      nome: string;
      email: string;
    };
    cupom: {
      descricao: string;
      codigo: string;
      precoComDesconto?: number;
    };
    valorPago?: number;
  }>;
}

export function UltimosResgates({ resgates }: UltimosResgatesProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Últimos Resgates</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Atividades recentes na sua loja
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-4">
          {resgates.slice(0, 5).map((resgate) => (
            <div key={resgate.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs sm:text-sm">
                  {resgate.cliente.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {resgate.cliente.nome}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      {resgate.cupom.descricao}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-orange-50 text-[10px] sm:text-xs whitespace-nowrap">
                      {resgate.quantidade}x
                    </Badge>
                    
                    {resgate.valorPago ? (
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-1">
                        {formatarMoeda(resgate.valorPago)}
                      </span>
                    ) : resgate.cupom.precoComDesconto ? (
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-1">
                        {formatarMoeda(resgate.cupom.precoComDesconto)}
                      </span>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {new Date(resgate.resgatadoEm).toLocaleDateString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {resgate.valorPago && (
                    <>
                      <span className="text-gray-300">•</span>
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {formatarMoeda(resgate.valorPago)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {resgates.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum resgate recente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}