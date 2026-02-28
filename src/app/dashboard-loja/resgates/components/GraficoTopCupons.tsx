'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface GraficoTopCuponsProps {
  dados: Array<{
    nome: string;
    total: number;
    validados: number;
  }>;
}

export function GraficoTopCupons({ dados }: GraficoTopCuponsProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <BarChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          Top Cupons
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Cupons com mais resgates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
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
              <Bar dataKey="total" fill="#f97316" name="Total" />
              <Bar dataKey="validados" fill="#10b981" name="Validados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}