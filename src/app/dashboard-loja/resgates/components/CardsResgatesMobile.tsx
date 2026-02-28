'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, DollarSign, Calendar, TrendingDown, Eye, Loader2 } from 'lucide-react';
import { ResgateAdaptado } from '../types/resgates.types';

interface CardsResgatesMobileProps {
  resgates: ResgateAdaptado[];
  loading: boolean;
  onVerDetalhes: (resgate: ResgateAdaptado) => void;
  formatarMoeda: (valor: number) => string;
  getStatusBadge: (validado?: boolean) => React.ReactNode;
}

export function CardsResgatesMobile({ 
  resgates, 
  loading, 
  onVerDetalhes, 
  formatarMoeda,
  getStatusBadge 
}: CardsResgatesMobileProps) {
  if (loading) {
    return (
      <div className="col-span-full text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
      </div>
    );
  }

  if (resgates.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
      {resgates.map((resgate) => (
        <Card key={resgate.id} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            {/* Cabeçalho do card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                    {resgate.cliente.nome?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate max-w-[120px]">
                    {resgate.cliente.nome}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                    {resgate.cliente.email}
                  </p>
                </div>
              </div>
              {getStatusBadge(resgate.qrCodeValidado)}
            </div>

            {/* Informações do card */}
            <div className="space-y-2 text-[10px] sm:text-xs">
              <div className="flex items-center gap-2">
                <Ticket className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="font-mono truncate">{resgate.cupom.codigo}</span>
                <Badge variant="outline" className="bg-orange-50 text-[8px] sm:text-[10px] ml-auto">
                  {resgate.quantidade}x
                </Badge>
              </div>

              {resgate.valorPago && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="text-green-600 font-medium">
                    {formatarMoeda(resgate.valorPago)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span>
                  {new Date(resgate.resgatadoEm).toLocaleDateString()} às{' '}
                  {new Date(resgate.resgatadoEm).toLocaleTimeString()}
                </span>
              </div>

              {resgate.economia && resgate.economia > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  <span className="text-blue-600">
                    Economia: {formatarMoeda(resgate.economia)}
                  </span>
                </div>
              )}
            </div>

            {/* Botão ver detalhes */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalhes(resgate)}
              className="w-full mt-3 h-7 text-[10px] sm:text-xs"
            >
              <Eye className="h-3 w-3 mr-2" />
              Ver detalhes
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}