'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResgatePorDia } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';

interface ResgatesPorDiaChartProps {
  dados: ResgatePorDia[];
}

export function ResgatesPorDiaChart({ dados }: ResgatesPorDiaChartProps) {
  if (!dados || dados.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Resgates por Dia</CardTitle>
          <p className="text-xs text-gray-500">Últimos 7 dias</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Sem dados para exibir</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValor = Math.max(...dados.map(d => d.valorTotal));
  const maxTotal = Math.max(...dados.map(d => d.total));

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">Resgates por Dia</CardTitle>
        <p className="text-xs text-gray-500">Últimos 7 dias</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {dados.map((dia, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{dia.dia}</span>
                <div className="flex gap-3">
                  <span className="text-gray-900 font-medium">{dia.total} resgates</span>
                  <span className="text-blue-600">{formatters.moeda(dia.valorTotal)}</span>
                </div>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                  style={{ width: `${(dia.total / maxTotal) * 100}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full opacity-50"
                  style={{ width: `${(dia.valorTotal / maxValor) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-3 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Quantidade</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Valor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}