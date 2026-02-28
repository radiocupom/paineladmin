'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface GraficoResgatesProps {
  dados: Array<{
    data: string;
    resgates: number;
    validados: number;
  }>;
}

export function GraficoResgates({ dados }: GraficoResgatesProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <LineChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          Resgates por Dia
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12 }}
              />
              <YAxis 
                tick={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12 }}
              />
              <Tooltip 
                contentStyle={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 14 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="resgates" 
                stroke="#f97316" 
                name="Resgates"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="validados" 
                stroke="#10b981" 
                name="Validados"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}