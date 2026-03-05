'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CupomPopular } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';

interface CuponsPopularesProps {
  cupons: CupomPopular[];
}

export function CuponsPopulares({ cupons }: CuponsPopularesProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">Cupons Mais Resgatados</CardTitle>
        <p className="text-xs text-gray-500">Top {cupons.length} cupons da loja</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {cupons.map((cupom) => (
            <div key={cupom.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium">{cupom.codigo}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {cupom.totalResgates} resgates
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-1">
                  {cupom.nomeProduto || cupom.descricao}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs font-medium text-green-600">
                  {formatters.moeda(cupom.valorTotalGerado)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {cupom.percentualDesconto ? `${cupom.percentualDesconto}% OFF` : '-'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}