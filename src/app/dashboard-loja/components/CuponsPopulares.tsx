'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CupomPopular } from '@/services/dashboardLoja';
import { TrendingUp, Tag, Calendar } from 'lucide-react';

interface CuponsPopularesProps {
  cupons: CupomPopular[];
}

export function CuponsPopulares({ cupons }: CuponsPopularesProps) {
  const maxResgates = cupons.length > 0 
    ? Math.max(...cupons.map(c => c.totalResgates)) 
    : 0;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          Cupons Populares
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Cupons mais resgatados da sua loja
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          {cupons.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-xs sm:text-sm text-gray-500">Nenhum cupom popular</p>
            </div>
          ) : (
            cupons.map((cupom, index) => (
              <div key={cupom.id} className="space-y-2 sm:space-y-3 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
                {/* Header com posição e badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0",
                        index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        index === 1 ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        index === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      )}
                    >
                      {index + 1}º
                    </Badge>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium truncate">
                        {cupom.descricao}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mt-0.5">
                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="truncate">Código: {cupom.codigo}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] sm:text-xs px-2 py-0.5 flex-shrink-0"
                  >
                    {cupom.totalResgates} resgates
                  </Badge>
                </div>
                
                {/* Barra de progresso */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                    <span>Popularidade</span>
                    <span>{Math.round((cupom.totalResgates / maxResgates) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(cupom.totalResgates / maxResgates) * 100} 
                    className="h-1.5 sm:h-2"
                  />
                </div>
                
                {/* Data de validade */}
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>
                    Válido até {format(new Date(cupom.dataExpiracao), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legenda para mobile/tablet */}
        {cupons.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[8px] sm:text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-100 border border-yellow-200 rounded-full"></div>
                <span>1º lugar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 border border-gray-200 rounded-full"></div>
                <span>2º lugar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-100 border border-orange-200 rounded-full"></div>
                <span>3º lugar</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Import cn no topo do arquivo
import { cn } from '@/lib/utils';