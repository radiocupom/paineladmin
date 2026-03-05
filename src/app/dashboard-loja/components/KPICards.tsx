'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Store, Ticket, QrCode, Users, TrendingUp, Calendar } from 'lucide-react';
import { LojaKPIs } from '@/services/dashboardLoja';

interface KPICardsProps {
  data: LojaKPIs;
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      titulo: 'Loja',
      valor: data.loja.nome,
      icone: Store,
      cor: 'text-orange-600',
      bg: 'bg-orange-50',
      descricao: 'ID: ' + data.loja.id.slice(0, 8) + '...'
    },
    {
      titulo: 'Cupons',
      valor: data.cupons.ativos,
      icone: Ticket,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
      descricao: `${data.cupons.total} total • ${data.cupons.comPreco} com preço`
    },
    {
      titulo: 'QR Codes',
      valor: data.qrCodes.validados,
      icone: QrCode,
      cor: 'text-green-600',
      bg: 'bg-green-50',
      descricao: `${data.qrCodes.pendentes} pendentes • ${data.qrCodes.total} total`
    },
    {
      titulo: 'Clientes',
      valor: data.clientes.total,
      icone: Users,
      cor: 'text-purple-600',
      bg: 'bg-purple-50',
      descricao: 'clientes únicos'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{card.titulo}</span>
              <div className={`p-1.5 rounded-full ${card.bg}`}>
                <card.icone className={`h-3 w-3 ${card.cor}`} />
              </div>
            </div>
            <div className={`text-lg font-bold ${card.cor}`}>
              {typeof card.valor === 'number' ? card.valor.toLocaleString() : card.valor}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{card.descricao}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}