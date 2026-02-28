'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ResgateAdaptado } from '../types/resgates.types';

interface ExportarDadosProps {
  resgates: ResgateAdaptado[];
  formatarMoeda: (valor: number) => string;
  formatarData: (data: string) => string;
  disabled?: boolean;
}

export function ExportarDados({ resgates, formatarMoeda, formatarData, disabled }: ExportarDadosProps) {
  const exportarDados = () => {
    const dadosParaExportar = resgates.map(r => ({
      Cliente: r.cliente.nome,
      Email: r.cliente.email,
      WhatsApp: r.cliente.whatsapp || '-',
      Cupom: r.cupom.codigo,
      Descrição: r.cupom.descricao,
      Produto: r.cupom.nomeProduto || '-',
      Quantidade: r.quantidade,
      'Preço Original': r.cupom.precoOriginal ? formatarMoeda(r.cupom.precoOriginal) : '-',
      'Preço com Desconto': r.cupom.precoComDesconto ? formatarMoeda(r.cupom.precoComDesconto) : '-',
      'Desconto': r.cupom.percentualDesconto ? `${r.cupom.percentualDesconto}%` : '-',
      'Valor Pago': r.valorPago ? formatarMoeda(r.valorPago) : '-',
      'Economia': r.economia ? formatarMoeda(r.economia) : '-',
      'Data do Resgate': formatarData(r.resgatadoEm),
      Status: r.qrCodeValidado ? 'Validado' : 'Pendente'
    }));

    const csv = [
      Object.keys(dadosParaExportar[0]).join(','),
      ...dadosParaExportar.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resgates_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Button
      variant="outline"
      onClick={exportarDados}
      disabled={disabled}
      className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 gap-1 sm:gap-2"
    >
      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="hidden xs:inline">Exportar</span>
    </Button>
  );
}