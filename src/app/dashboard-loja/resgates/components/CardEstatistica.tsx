'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardEstatisticaProps {
  titulo: string;
  valor: number | string;
  descricao: string;
  cor?: string;
  progresso?: number;
}

export function CardEstatistica({ 
  titulo, 
  valor, 
  descricao, 
  cor = 'text-gray-900',
  progresso 
}: CardEstatisticaProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 pb-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 truncate">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
        <div className={`text-base sm:text-lg md:text-2xl font-bold ${cor}`}>
          {valor}
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {descricao}
        </p>
        {progresso !== undefined && (
          <div className="w-full h-1 sm:h-1.5 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-1 sm:h-1.5 bg-green-500 rounded-full"
              style={{ width: `${progresso}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}