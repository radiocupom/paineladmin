'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface MetricasClienteProps {
  metricas: {
    totalResgates: number;
    totalGasto: number;
    totalEconomia: number;
    cuponsUnicos: number;
  };
  formatarMoeda: (valor: number) => string;
}

export function MetricasCliente({ metricas, formatarMoeda }: MetricasClienteProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-0">
          <CardTitle className="text-xs font-medium text-gray-500">
            Total Resgates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-1">
          <div className="text-lg font-bold">{metricas.totalResgates}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 pb-0">
          <CardTitle className="text-xs font-medium text-gray-500">
            Total Gasto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-1">
          <div className="text-lg font-bold text-green-600">
            {formatarMoeda(metricas.totalGasto)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 pb-0">
          <CardTitle className="text-xs font-medium text-gray-500">
            Economia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-1">
          <div className="text-lg font-bold text-blue-600">
            {formatarMoeda(metricas.totalEconomia)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 pb-0">
          <CardTitle className="text-xs font-medium text-gray-500">
            Cupons Usados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-1">
          <div className="text-lg font-bold">
            {metricas.cuponsUnicos}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}